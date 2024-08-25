import { EventEmitter } from 'node:events';
import type { Users } from '../types';
import { hset } from '../cache';

export const cacheEvent = new EventEmitter();

cacheEvent.on('insert_user_detail', async (userDetail : Users) => {
    await Promise.all([hset(`user:${userDetail.id}`, userDetail, 604800), hset(`user:${userDetail.email}`, userDetail, 604800)]);
});