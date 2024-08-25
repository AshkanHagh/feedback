import ErrorHandler from './errorHandler';

export const createValidationError = (message : string) => {
    return new ErrorHandler(message, 400);
};

export const createRouteNotFoundError = (message : string) => {
    return new ErrorHandler(message, 404);
};

export const createBadRequestError = (message : string = 'Bad request') => {
    return new ErrorHandler(message, 400);
};

export const createTimeoutError = (message : string = 'Request timeout after waiting 3.5 seconds. Please try again later') => {
    return new ErrorHandler(message, 408);
};

export const createForbiddenError = (message : string = 'Forbidden') => {
    return new ErrorHandler(message, 403);
};

export const createResourceNotFoundError = (message : string = 'Resource not found') => {
    return new ErrorHandler(message, 404);
};

export const createInvalidUserIdError = (message : string = 'Invalid id - User not found') => {
    return new ErrorHandler(message, 400);
};

export const createTokenRefreshError = (message : string = 'Could not refresh token') => {
    return new ErrorHandler(message, 400);
};

export const createLoginRequiredError = (message : string = 'Please login to access this resource') => {
    return new ErrorHandler(message, 401);
};

export const createEmailOrPasswordMatchError = (message : string = 'Email or password dose not match') => {
    return new ErrorHandler(message, 400);
}

export const createAccessTokenInvalidError = (message : string = 'Access token is not valid') => {
    return new ErrorHandler(message, 401);
};

export const createInternalServerError = (message : string = 'Internal server error') => {
    return new ErrorHandler(message, 500);
};

export const createUserNotFoundError = (message : string = 'User not found') => {
    return new ErrorHandler(message, 404);
};

export const createInvalidVerifyCodeError = (message : string = 'Invalid verify code') => {
    return new ErrorHandler(message, 400);
};

export const createEmailAlreadyExistsError = (message : string = 'Email or Username already exists') => {
    return new ErrorHandler(message, 409);
};

export const createInvalidEmailError = (message : string = 'Invalid email') => {
    return new ErrorHandler(message, 401);
};