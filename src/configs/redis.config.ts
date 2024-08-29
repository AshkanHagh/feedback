import Redis from 'ioredis';

const redis : Redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest : 5,
    reconnectOnError : (err) => {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        if (targetErrors.some(e => err.message.includes(e))) return true
        return false;
    },
    enableAutoPipelining : true,
    connectTimeout : 10000,
    tls : process.env.REDIS_TLS === 'true' ? {} : undefined,
    lazyConnect : false,
});

export default redis;