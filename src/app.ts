import './configs/instrument';
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timeout } from 'hono/timeout';

import authRouter from './routes/auth.route';

import { ErrorMiddleware, createRouteNotFoundError, createTimeoutError } from './utils';

const app = new Hono();

app.use(cors({origin : process.env.ORIGIN, credentials : true}));
app.use(logger());
//@ts-expect-error
app.use('/api/*', timeout(process.env.TIMEOUT_SEC, createTimeoutError()));

app.all('/', (context : Context) => context.json({success : true, message : 'Welcome to feedback'}, 200));

app.route('/api/auth', authRouter);

app.notFound((context : Context) => {throw createRouteNotFoundError(`Route : ${context.req.url} not found`)});
app.onError(ErrorMiddleware);

export default app;