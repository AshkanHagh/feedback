import type { Context, Next } from 'hono';
import ErrorHandler from './errorHandler';

type AsyncRequestHandler<T> = (context : Context, next  : Next) => T;

export const CatchAsyncError = <T>(theFunc : AsyncRequestHandler<T>) => (context : Context, next : Next) => {
    return Promise.resolve(theFunc(context, next)).catch((error : ErrorHandler) => {
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    });
};
