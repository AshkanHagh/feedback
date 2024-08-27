import type { Context } from 'hono';
import { CatchAsyncError, createValidationError } from '../utils';
import { openTicketSchema, sendTicketSchema, type OpenTicketSchema, type PaginationSchema, type TicketListQueries } from '../schemas';
import { v2 as cloudinary, UploadStream, type UploadApiErrorResponse, type UploadApiResponse } from 'cloudinary';
import type { Ticket, User } from '@prisma/client';
import prisma from '../configs/prisma.config';
import { cacheEvent } from '../events/cache.event';
import pLimit, { type LimitFunction } from 'p-limit';
import { validate } from '../middlewares/validation';
import type { SafeParseReturnType } from 'zod';
import redis from '../configs/redis.config';
import type { ChainableCommander } from 'ioredis';
import { inPlaceSort } from 'fast-sort';
import { hgetall } from '../cache';

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

    const ticketLists : ModifiedTicketList[] = ticketListsCache.length ? ticketListsCache.slice(+startIndex, +limit) 
    : await prisma.ticket.findMany({
        where : {status, department}, take : +limit, skip : +startIndex, orderBy : {createdAt : 'desc'}, include : {
            user : true
        }
    });
    return context.json({success : true, ticketLists}, 200);
});

export const openTicket = CatchAsyncError(async (context : Context) => {
    const { ticketId : id } = context.req.param() as OpenTicketSchema;
    const validationResult = await validate({ticketId : id}, openTicketSchema);
    if(!validationResult.success) throw createValidationError(validationResult.error.issues[0].message);
    const { ticketId } = validationResult.data as OpenTicketSchema;

    const ticketDetailCache : Ticket = await hgetall<Ticket>(`ticket:${ticketId}`, 604800);
    const ticketUser : User = await hgetall<User>(`user:${ticketDetailCache.userId}`, 604800);
    
    const { userId, ...rest } = ticketDetailCache;
    const ticketWithUserDetail : ModifiedTicketList = {...rest, user : ticketUser};

    const ticketDetail = ticketDetailCache && Object.keys(ticketDetailCache).length ? ticketWithUserDetail 
    : await prisma.ticket.findUnique({where : {id : ticketId}, include : {user : true}});
    if(ticketDetail?.status === 'open') cacheEvent.emit('update_ticket_status', ticketId);
    return context.json({success : true, ticketDetail});
});

export const myTickets = CatchAsyncError(async (context : Context) => {
    const { id : currentUserId } = context.get('user') as User;
    const { startIndex, limit } = context.req.validationData.query as PaginationSchema

    const ticketsCache: Record<string, string> = await hgetall(`user_ticket:${currentUserId}`, 604800);
    const ticketDetailRaw : (string | Date)[] = Object.values(ticketsCache);
    const ticketsCacheDetail : Ticket[] = ticketDetailRaw.map(ticket => JSON.parse(ticket as string));
    const sortedTicketDetails : Ticket[] = inPlaceSort(ticketsCacheDetail).desc(ticket => ticket.createdAt);

    const ticketDetail : Ticket[] = sortedTicketDetails.length ? sortedTicketDetails.slice(+startIndex, +limit) 
    : await prisma.ticket.findMany({
        where : {userId : currentUserId}, orderBy : {createdAt : 'desc'}, take : +limit, skip : +startIndex
    });
    return context.json({success : true, ticketsDetail : ticketDetail});
});