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
    image : z.string().url({message : 'Invalid image URL'}),
    email : z.string().email({message : 'Invalid email address'}).regex(/^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
});
export type SocialAuth = z.infer<typeof socialAuthSchema>;