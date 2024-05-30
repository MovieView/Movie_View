import { createClient } from 'redis';
import 'dotenv/config';


const client = createClient({
  url: process.env.REDIS_URL
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (error) => {
  console.error(error);
});


export const setRedisData = async (
  key: string, 
  value: string,
  options: Object = {}
) => {
  await client.connect();
  await client.set(key, value, options);
  await client.quit();
};

export const getRedisData = async (key: string) => {
  await client.connect();
  try {
    return await client.get(key);
  } catch (error) {
    return null;
  } finally {
    await client.quit();
  }
};

export default client;