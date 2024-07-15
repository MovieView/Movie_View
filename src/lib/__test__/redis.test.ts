jest.mock("@/lib/redis");
jest.mock("redis");

import { RedisClient } from "@/lib/redis";
import { beforeEach, describe, expect, test } from "@jest/globals";
import { createClient } from "redis";

import { jest } from "@jest/globals";


beforeEach(() => {
  const map = new Map();

  (createClient as jest.Mock).mockReturnValue({
    connect: jest.fn(() => {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }),
    set: jest.fn((key: string, value: string, options: {EX: number}) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
            map.delete(key);
        }, options.EX * 1000);
        map.set(key, value);
        if (map.has(key)) {
          resolve(true);
        }
        resolve(false);
      });
    }),
    get: jest.fn((key: string) => {
      return new Promise((resolve, reject) => {
        if (!map.has(key)) {
          resolve(null);
        }
        resolve(map.get(key));
      });
    }),
  });
});

describe('Redis Mock', () => {
  test('Connect to redis', async () => {
    const client : RedisClient = createClient({
      url: 'redis://localhost:6379'
    });
    const value = await client.connect();
    expect(value).toBe(true);
  });

  test('Should set data to redis', async () => {
    const client : RedisClient = createClient({
      url: 'redis://localhost:6379'
    });
    const value = await client.connect();
    expect(value).toBeTruthy();
    const result = await client.set('key', 'value', {EX: 5});
    expect(result).toBeTruthy();
    const data = await client.get('key');
    expect(data).toBe('value');

    await new Promise((resolve) => setTimeout(resolve, 6000));
    const newData = await client.get('key');
    expect(newData).toBeNull();
  }, 15000);
});