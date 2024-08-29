import { z } from 'zod';

export const cookieOptionSchema = z.object({
    expires : z.date(),
    maxAge : z.number().min(1, {message : 'Max age must be a positive number'}),
    httpOnly : z.boolean(),
    sameSite : z.enum(['lax', 'strict', 'none']),
    secure : z.boolean().optional().default(false)
});
export type CookieOption = z.infer<typeof cookieOptionSchema>;

export const socialAuthSchema = z.object({
    name : z.string({message : 'Name is required'}).min(1).regex(/^[a-zA-Z\s]+$/, {message : 'Name can only contain letters and spaces'}),
    image : z.string({message : 'Filed image is required'}).url({message : 'Invalid image URL'}),
    email : z.string({message : 'Filed email is required'}).email({message : 'Invalid email address'})
    .regex(/^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
});
export type SocialAuth = z.infer<typeof socialAuthSchema>;

export const sendTicketSchema = z.object({
    title : z.string().min(1),
    description : z.string().min(1).max(500),
    department : z.enum(['management', 'tech_support', 'general_support']),
    images : z.array(z.instanceof(File)).optional(),
});
export type SendTicketSchema = z.infer<typeof sendTicketSchema>;

export const paginationSchema = z.object({
    limit : z.string().min(1).default('12'),
    startIndex : z.string().min(1).default('0')
});
export type PaginationSchema = z.infer<typeof paginationSchema>;

export const ticketListSchema = z.object({
    department : z.enum(['management', 'tech_support', 'general_support']),
    status : z.enum(['open', 'in_progress', 'closed']).default('in_progress'),
}).merge(paginationSchema);
export type TicketListQueries = z.infer<typeof ticketListSchema>;

export const openTicketSchema = z.object({
    ticketId : z.string({message : 'Ticket id is required'})
});
export type OpenTicketSchema = z.infer<typeof openTicketSchema>;

export const sendCommentSchema = z.object({
    content : z.string().min(1)
});
export type SendCommentSchema = z.infer<typeof sendCommentSchema>;