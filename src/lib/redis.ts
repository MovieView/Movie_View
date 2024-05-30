import { createClient } from 'redis';
import 'dotenv/config';


const client = createClient({
  url: process.env.REDIS_URL
});

export const setRedisData = async (
  redisClient : typeof client,
  key: string, 
  value: string,
  options: Object = {}
) => {
  await redisClient.connect();
  await redisClient.set(key, value, options);
  await redisClient.quit();
};

export const getRedisData = async (
    redisClient : typeof client,
    key: string
) => {
  await redisClient.connect();
  try {
    return await redisClient.get(key);
  } catch (error) {
    return null;
  } finally {
    await redisClient.quit();
  }
};