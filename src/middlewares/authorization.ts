import type { Context, Next } from 'hono';
import { decodeToken, type DecodedToken, createAccessTokenInvalidError, createLoginRequiredError, CatchAsyncError, 
    createForbiddenError 
} from '../utils';
import { hgetall } from '../cache';
import type { User } from '../types';
import { z } from 'zod';

const tokenSchema = z.string().trim().regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/, 
    {message : 'Invalid jwt token format'}
);

const extractToken = (authHeader : string | undefined) : string => {
    if(!authHeader || !authHeader.startsWith('Bearer ')) throw createLoginRequiredError();
    const token : string = authHeader.split(' ')[1];
    const validationDetail : z.SafeParseReturnType<string, string> = tokenSchema.safeParse(token);
    if(!token || !validationDetail.success) throw createAccessTokenInvalidError();
    return validationDetail.data;
}

const decodeAndValidateToken = (token : string) : DecodedToken => {
    const decodedToken : DecodedToken = decodeToken(token, process.env.ACCESS_TOKEN);
    if (!decodedToken) throw createAccessTokenInvalidError();
    return decodedToken;
};

const fetchUserInfo = async (userId : string): Promise<User> => {
    const user : User = await hgetall<User>(`user:${userId}`, 604800);
    if (!user || Object.keys(user).length <= 0) throw createLoginRequiredError();
    return user;
}

export const isAuthenticated = CatchAsyncError(async (context : Context, next : Next) : Promise<void> => {
    const token : string = extractToken(context.req.header('authorization'));
    const decodedToken : DecodedToken = decodeAndValidateToken(token);
    const user : User = await fetchUserInfo(decodedToken.id);
    
    context.set('user', user);
    await next();
});

export const authorizedRoles = (...roles : Array<User['role']>) => {
    return CatchAsyncError(async (context : Context, next : Next) => {
        const currentUserDetail : User = context.get('user') as User;
        if(!roles.includes(currentUserDetail?.role)) throw createForbiddenError();
        await next();
    });
};