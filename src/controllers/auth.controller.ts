import type { Context } from 'hono';
import { CatchAsyncError, decodeToken, sendToken, type ConditionResponse } from '../utils';
import type { SocialAuth } from '../schemas';
import prisma from '../configs/prisma.config';
import type { User } from '@prisma/client';
import { hgetall } from '../cache';
import { getCookie } from 'hono/cookie';

export const socialAuth = CatchAsyncError(async (context : Context) => {
    const { email, name, image } = context.req.validationData.json as SocialAuth;
    const emailSearchCache : User = await hgetall<User>(`user:${email}`, 604800);

    const isEmailExists : User | null = emailSearchCache && Object.keys(emailSearchCache).length 
    ? emailSearchCache : await prisma.user.findUnique({where : {email}});
    const userDetail : User = isEmailExists ? isEmailExists : await prisma.user.create({data : {email, name, image}})

    const { accessToken, user } : ConditionResponse = await sendToken(userDetail, context, 'register');
    return context.json({success : true, userDetail : user, accessToken});
});

export const refreshToken = CatchAsyncError(async (context : Context) => {
    const refresh_token : string | undefined = getCookie(context, 'refresh_token');
    const decodedUser : User = decodeToken(refresh_token ?? '', process.env.REFRESH_TOKEN);
    const userDetail : User = await hgetall(`user:${decodedUser.id}`, 604800);

    const accessToken : string = await sendToken(userDetail, context, 'refresh');
    return context.json({success : true, accessToken});
});