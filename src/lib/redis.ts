import { createClient } from 'redis';
import 'dotenv/config';


const client = createClient({
  url: process.env.REDIS_URL
});

export type RedisClient = typeof client;

export const setRedisData = async (
  redisClient : RedisClient,
  key: string, 
  value: string,
  options: Object = {}
) => {
  await redisClient.set(key, value, options);
};

export const getRedisData = async (
    redisClient : RedisClient,
    key: string
) => {
  return await redisClient.get(key);
};