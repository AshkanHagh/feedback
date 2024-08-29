import redis from '../configs/redis.config';

export const hset = async <T>(hashKey : string, hashValue : T, expireTime : number) : Promise<void> => {
    await Promise.all([redis.hset(hashKey, hashValue as string), redis.expire(hashKey, expireTime)]);
};

export const hgetall = async <T>(hashKey : string, expireTime : number) : Promise<T> => {
    const [hashDetail] = await Promise.all([redis.hgetall(hashKey), redis.expire(hashKey, expireTime)]);
    return hashDetail as T;
}

export const hget = async <T>(hashKey : string, hashIndex : string, expireTime : number) : Promise<T> => {
    const [hashDetail] = await Promise.all([redis.hget(hashKey, hashIndex), redis.expire(hashKey, expireTime)]);
    return hashDetail as T;
}

export const incr = async (key : string, expireTime : number) : Promise<number>=> {
    const [incrDetail] = await Promise.all([redis.incr(key), redis.expire(key, expireTime)]);
    return incrDetail;
}

export const getIncr = async <T>(key : string, expireTime : number) : Promise<T> => {
    const [incrDetail] = await Promise.all([redis.get(key), redis.expire(key, expireTime)]);
    return incrDetail as T;
}

export const hmset = async <T>(hashKey : string, hashIndex : string, hashValue : T, expireTime : number) : Promise<void> => {
    await Promise.all([redis.hmset(hashKey, hashIndex, JSON.stringify(hashValue)), redis.expire(hashKey, expireTime)]);
}

export const del = async (key : string) : Promise<void> => {
    await redis.del(key)
}

export const hmdel = async (hashKey : string, hashIndex : string) : Promise<void> => {
    await redis.hdel(hashKey, hashIndex);
}