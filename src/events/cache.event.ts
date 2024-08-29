import { EventEmitter } from 'node:events';
import type { Ticket, User } from '../types';
import { hmset, hset } from '../cache';
import prisma from '../configs/prisma.config';

export const cacheEvent = new EventEmitter();

cacheEvent.on('insert_user_detail', async (userDetail : User) => {
    await Promise.all([hset(`user:${userDetail.id}`, userDetail, 604800), 
        hset(`user:${userDetail.email}`, userDetail, 604800)
    ]);
});

cacheEvent.on('insert_user_ticket', async (id : string, ticketDetail : Ticket) => {
    await Promise.all([hset(`ticket:${ticketDetail.id}`, ticketDetail, 1209600), 
        hmset(`user_ticket:${id}`, ticketDetail.id, ticketDetail, 1209600)
    ]);
});

cacheEvent.on('update_ticket_status', async (ticketId : string) => {
    const updatedTicketDetail = await prisma.ticket.update({
        data : {status : 'in_progress'}, where : {id : ticketId}
    });
    await Promise.all([hset(`ticket:${ticketId}`, updatedTicketDetail, 604800), 
        hmset(`user_ticket:${updatedTicketDetail.userId}`, updatedTicketDetail.id, updatedTicketDetail, 604800)
    ]);
});