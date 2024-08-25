import type { Context } from 'hono';
import { CatchAsyncError, decodeToken, sendToken, type ConditionResponse } from '../utils';
import type { SocialAuth } from '../schemas';
import prisma from '../configs/prisma.config';
import type { Users } from '@prisma/client';
import { hgetall } from '../cache';
import { getCookie } from 'hono/cookie';

export const socialAuth = CatchAsyncError(async (context : Context) => {
    const { email, name, image } = context.req.validationData.json as SocialAuth;
    const emailSearchCache : Users = await hgetall<Users>(`user:${email}`, 604800);

    const isEmailExists : Users | null = emailSearchCache ? emailSearchCache : await prisma.users.findUnique({where : {email}});
    const userDetail : Users = isEmailExists ? isEmailExists : await prisma.users.create({data : {email, name, image}})

    const { accessToken, user } : ConditionResponse = await sendToken(userDetail, context, 'register');
    return context.json({success : true, userDetail : user, accessToken});
});

export const refreshToken = CatchAsyncError(async (context : Context) => {
    const refresh_token : string | undefined = getCookie(context, 'refresh_token');
    const decodedUser : Users = decodeToken(refresh_token ?? '', process.env.REFRESH_TOKEN);
    const userDetail : Users = await hgetall(`user:${decodedUser.id}`, 604800);

    const accessToken : string = await sendToken(userDetail, context, 'refresh');
    return context.json({success : true, accessToken});
});