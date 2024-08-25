import app from './app';

Bun.serve({
    port : process.env.PORT as number || 8811,
    fetch : app.fetch
})