import { Hono } from 'hono';
import { validationMiddleware } from '../middlewares/validation';
import { socialAuthSchema } from '../schemas';
import { refreshToken, socialAuth } from '../controllers/auth.controller';

const authRouter = new Hono();

authRouter.post('/social', validationMiddleware('json', socialAuthSchema), socialAuth);

authRouter.post('/social', refreshToken);

export default authRouter;