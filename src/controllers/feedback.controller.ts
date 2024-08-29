import type { Context } from 'hono';
import { CatchAsyncError, createForbiddenError, createResourceNotFoundError, createValidationError } from '../utils';
import { openTicketSchema, sendTicketSchema, type OpenTicketSchema, type PaginationSchema, type SendCommentSchema, 
    type TicketListQueries 
} from '../schemas';
import { v2 as cloudinary, UploadStream, type UploadApiErrorResponse, type UploadApiResponse } from 'cloudinary';
import type { Comment, Ticket, User } from '@prisma/client';
import prisma from '../configs/prisma.config';
import { cacheEvent } from '../events/cache.event';
import pLimit, { type LimitFunction } from 'p-limit';
import { validate } from '../middlewares/validation';
import type { SafeParseReturnType } from 'zod';
import redis from '../configs/redis.config';
import type { ChainableCommander } from 'ioredis';
import { inPlaceSort } from 'fast-sort';
import { hgetall, hmset } from '../cache';
import { emailEvent } from '../events/email.event';
import ErrorHandler from '../utils/errorHandler';

export const uploadImage = async (images : File[]) : Promise<string[]> => {
    const limit : LimitFunction = pLimit(10);
    const uploadResponse = images.map(image => 
        limit(async () => {
            const arrayBuffer : ArrayBuffer = await image.arrayBuffer();
            const buffer : Buffer = Buffer.from(arrayBuffer);
        
            return new Promise<string>((resolve, reject) => {
                const uploadStream : UploadStream = cloudinary.uploader.upload_stream({resource_type : 'auto', folder : 'feedback'},
                    (error : UploadApiErrorResponse | undefined, response : UploadApiResponse | undefined) => {
                        error ? reject(error) : response ? resolve(response.secure_url) : undefined
                    }
                )
                uploadStream.end(buffer);
            });
        })
    )
    return Promise.all(uploadResponse);
}

export const sendTicket = CatchAsyncError(async (context : Context) => {
    const formData : FormData = await context.req.formData();
    const inputData = <Ticket>{
        title : formData.get('title'), description : formData.get('description'), department : formData.get('department'),
        images : formData.getAll('images')
    }
    const zodValidationResult : SafeParseReturnType<unknown, unknown> = await validate(inputData, sendTicketSchema);
    if(!zodValidationResult.success) throw createValidationError(zodValidationResult.error?.issues[0].message);
    const { id : currentUserId } = context.get('user') as User;

    const { title, description, department, images } = zodValidationResult.data as Omit<Ticket, 'images'> & {images : File[]};
    const ticketDetail = await prisma.ticket.create({
        data : {title, description, department, images : images ? await uploadImage(images) : [], userId : currentUserId}
    });

    cacheEvent.emit('insert_user_ticket', currentUserId, ticketDetail);
    return context.json({success : true, ticketDetail}, 201);
});

type TicketLists = (Record<string, string> & User);
type ModifiedTicketList = (Omit<Ticket, 'userId'> & {user : User});
export const ticketList = CatchAsyncError(async (context : Context) => {
    const { department, status, limit, startIndex } = context.req.validationData.query as TicketListQueries;
    let cursor : string = '0';
    const cacheSearchResult : TicketLists[] = [];
    do {
        const [newCursor, keys] : [string, string[]] = await redis.scan(cursor, 'MATCH', 'user_ticket:*', 'COUNT', 100);
        const pipeline : ChainableCommander = redis.pipeline();

        keys.forEach(key => {
            pipeline.hgetall(key);
            pipeline.hgetall(`user:${key.split(':')[1]}`)
        });
        (await pipeline.exec())!.forEach(ticket => cacheSearchResult.push(ticket[1] as TicketLists));
        cursor = newCursor;
    } while (cursor !== '0');

    const ticketListsCache : ModifiedTicketList[] = [];
    for (let i : number = 0; i < cacheSearchResult.length; i += 2) {
        const ticketDetailRaw : (string | Date)[] = Object.values(cacheSearchResult[i]);
        const ticketDetail : Ticket[] = ticketDetailRaw.map(ticket => JSON.parse(ticket as string));
    
        const filteredAndSortedTickets : Ticket[] = inPlaceSort(
            ticketDetail.filter(ticket => ticket.status === status && ticket.department === department)
        ).desc(ticket => ticket.createdAt);
    
        const ticketUserDetail : User = cacheSearchResult[i + 1];
        filteredAndSortedTickets.forEach(ticket => {
            const { userId, ...ticketWithoutUserId } = ticket;
            ticketListsCache.push({...ticketWithoutUserId, user: ticketUserDetail});
        });
    }

    const ticketLists : ModifiedTicketList[] = ticketListsCache.length ? ticketListsCache.slice(+startIndex, +startIndex + +limit) 
    : await prisma.ticket.findMany({
        where : {status, department}, take : +limit, skip : +startIndex, orderBy : {createdAt : 'desc'}, include : {
            user : true
        }
    });
    return context.json({success : true, ticketLists}, 200);
});

type CommentsAndAuthor = {comments : (Omit<Comment, 'userId'> & {user : User})[]}
type CombineTicketRelation = ModifiedTicketList & CommentsAndAuthor;

export const openTicket = CatchAsyncError(async (context : Context) => {
    const { ticketId : id } = context.req.param() as OpenTicketSchema;
    const validationResult = await validate({ticketId : id}, openTicketSchema);
    if(!validationResult.success) throw createValidationError(validationResult.error.issues[0].message);
    const { ticketId } = validationResult.data as OpenTicketSchema;

    const ticketDetailCache : Ticket = await hgetall<Ticket>(`ticket:${ticketId}`, 604800);
    const [ticketUser, commentsCache] : [User, Record<string, string>] = await Promise.all([
        hgetall<User>(`user:${ticketDetailCache.userId}`, 604800), 
        hgetall<Record<string, string>>(`ticket_comment:${ticketId}`, 604800)
    ]);

    const commentsDetail : Comment[] = Object.values(commentsCache).map(comment => JSON.parse(comment) as Comment);
    const sortedCommentDetail : Comment[] = inPlaceSort(commentsDetail).desc(comment => comment.createdAt);

    const pipeline : ChainableCommander = redis.pipeline();
    const userIds : string[] = [...new Set(sortedCommentDetail.map(comment => comment.userId))];
    userIds.forEach(id => pipeline.hgetall(`user:${id}`));
    const usersData : User[] = (await pipeline.exec())!.map(data => data[1] as User);

    const { userId, ...rest } = ticketDetailCache
    const combineTicketAndRelations : CombineTicketRelation = {
        ...rest, user : ticketUser, comments : sortedCommentDetail.map(comment => ({
            ...comment, user : usersData.find(user => user.id, comment.userId) as User
        }))
    }

    const ticketDetail : CombineTicketRelation | null = Object.keys(ticketDetailCache).length ? combineTicketAndRelations 
    : await prisma.ticket.findUnique({where : {id : ticketId}, include : {user : true, comments : {include : {user : true}}}});
    
    if(ticketDetail?.status === 'open') cacheEvent.emit('update_ticket_status', ticketId);
    emailEvent.emit('ticket-status-changed', ticketUser.email, ticketDetail?.title, 
        `${process.env.API_BASEURL}/api/feedback/ticket/${ticketId}`, 'in_progress')
    return context.json({success : true, ticketDetail});
});

export const myTickets = CatchAsyncError(async (context : Context) => {
    const { id : currentUserId } = context.get('user') as User;
    const { startIndex, limit } = context.req.validationData.query as PaginationSchema

    const ticketsCache: Record<string, string> = await hgetall(`user_ticket:${currentUserId}`, 604800);
    const ticketsCacheDetail : Ticket[] = Object.values(ticketsCache).map(ticket => JSON.parse(ticket as string));
    const sortedTicketDetails : Ticket[] = inPlaceSort(ticketsCacheDetail).desc(ticket => ticket.createdAt);

    const ticketDetail : Ticket[] = sortedTicketDetails.length ? sortedTicketDetails.slice(+startIndex, +startIndex + +limit) 
    : await prisma.ticket.findMany({
        where : {userId : currentUserId}, orderBy : {createdAt : 'desc'}, take : +limit, skip : +startIndex
    });
    return context.json({success : true, ticketsDetail : ticketDetail});
});

type TicketWithRelation = Ticket & CommentsAndAuthor;
// Tasks
// Read all this https://claude.ai/chat/1a07d1e0-0b0c-4703-b396-4fab332919c3
export const myTicket = CatchAsyncError(async (context : Context) => {
    const { ticketId } = context.req.param() as {ticketId : string};
    const { id : currentUserId } = context.get('user') as User;

    const [ticketsCache, ticketCommentsCache] : [Ticket, Record<string, string>] = await Promise.all([
        hgetall<Ticket>(`ticket:${ticketId}`, 604800), hgetall<Record<string, string>>(`ticket_comment:${ticketId}`, 604800)
    ]);
    if(ticketsCache?.userId.toString() !== currentUserId.toString()) throw createForbiddenError();

    const ticketCommentDetail : Comment[] = Object.values(ticketCommentsCache).map(comment => JSON.parse(comment) as Comment)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const pipeline : ChainableCommander = redis.pipeline();
    ticketCommentDetail.forEach(comment => pipeline.hgetall(`user:${comment.userId}`));
    const commentsAuthor : User[] = (await pipeline.exec())?.map(data => data[1] as User) ?? [];
    const userMap = new Map(commentsAuthor.map(user => [user.id, user]));

    const ticketWithRelationDetail : TicketWithRelation = {
        ...ticketsCache, comments : ticketCommentDetail.map(comment => ({
            ...comment, user : userMap.get(comment.userId) as User
        }))
    }

    const ticketDetail : TicketWithRelation | null = Object.keys(ticketsCache).length ? ticketWithRelationDetail : 
    await prisma.ticket.findUnique({
        where : {id : ticketId}, include : {user : true, comments : {include : {user : true}}}
    });
    return context.json({success : true, ticketsDetail : ticketDetail});
});

type TicketAndUser = (Ticket & {user : User});
export const adminSendComment = CatchAsyncError(async (context : Context) => {
    const { content } = context.req.validationData.json as SendCommentSchema;
    const { ticketId } = context.req.param() as {ticketId : string};
    const { id : currentUserId } = context.get('user') as User;

    const ticketDetail : TicketAndUser | null = await prisma.ticket.findUnique({where : {id : ticketId}, include : {user : true}});
    if(!ticketDetail) throw createResourceNotFoundError();
    if(ticketDetail.status === 'closed') throw new ErrorHandler(`Ticket : ${ticketId} is closed`);

    const commentDetail : Comment = await prisma.comment.create({data : {content : content, userId : currentUserId, ticketId}});
    const [commentCache] = await Promise.all([hgetall<Record<string, string>>(`ticket_comment:${ticketId}`, 604800),
        hmset(`ticket_comment:${ticketId}`, commentDetail.id, commentDetail, 60480),
    ]);

    if(!Object.keys(commentCache).length) emailEvent.emit('admin-comment-added', ticketDetail.user.email, ticketDetail.title, '');
    return context.json({success : true, commentDetail}, 201);
});

export const userSendComment = CatchAsyncError(async (context : Context) => {
    const { content } = context.req.validationData.json as SendCommentSchema;
    const { ticketId } = context.req.param() as {ticketId : string};
    const { id : currentUserId } = context.get('user') as User;

    const ticketDetail : TicketAndUser | null = await prisma.ticket.findUnique({where : {id : ticketId}, include : {user : true}});
    if(ticketDetail?.status === 'closed') throw new ErrorHandler(`Ticket : ${ticketId} is closed`);
    if(ticketDetail?.userId.toString() !== currentUserId.toString()) throw createForbiddenError();

    const commentDetail : Comment = await prisma.comment.create({data : {content : content, userId : currentUserId, ticketId}});
    await hmset(`ticket_comment:${ticketId}`, commentDetail.id, commentDetail, 60480)
    return context.json({success : true, commentDetail}, 201);
});

export const closeTicket = CatchAsyncError(async (context : Context) => {
    const { ticketId } = context.req.param() as {ticketId : string};
    const updatedTicket : TicketAndUser = await prisma.ticket.update({where : {id : ticketId}, 
        data : {status : 'closed'}, include : {user :true}
    });
    cacheEvent.emit('insert_user_tickets', updatedTicket.userId, updatedTicket);

    emailEvent.emit('ticket-status-changed', updatedTicket.user.email, updatedTicket?.title, 
        `${process.env.API_BASEURL}/api/feedback/ticket/${ticketId}`, 'closed');
    return context.json({success : true, ticketDetail : updatedTicket});
});