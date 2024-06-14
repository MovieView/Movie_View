/**
 * @jest-environment node
 */

jest.mock('redis');

import { beforeEach, expect, jest, test } from '@jest/globals';
import { describe } from 'node:test';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import fetchMock from 'jest-fetch-mock';
import { createClient } from 'redis';


beforeEach(() => {
  // Map을 사용하여 Redis Mock 구현
  const map = new Map();

  (createClient as jest.Mock).mockReturnValue({
    connect: jest.fn(() => {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }),
    quit: jest.fn(() => {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }),
    set: jest.fn((key: string, value: string, options: {EX: number}) => {
      return new Promise((resolve, reject) => {
        // EX 시간 후에 데이터 삭제
        if (options.EX > 0) {
          setTimeout(() => {
              map.delete(key);
          }, options.EX * 1000);
        }

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

  // TMDB API Mock
  fetchMock.mockIf(/^https:\/\/api\.themoviedb\.org\/3.*$/, async (req) => {
    const url : URL = new URL(req.url);
    const query : string | null = url.searchParams.get('query');
    const page : string | null = url.searchParams.get('page');
    if (query === 'avengers') {
      return {
        status: 200,
        body: JSON.stringify({
          page: parseInt(page ?? '1'), 
          results: [
            {
              id: 1,
              title: 'Avengers',
              poster_path: '/avengers.jpg'
            },
            {
              id: 2,
              title: 'Avengers: Age of Ultron',
              poster_path: '/avengers-age-of-ultron.jpg'
            }
        ]}),
      };
    }
    return {
      status: 200,
      body: JSON.stringify({
        page: parseInt(page ?? '1'),
        results: [
          {
            id: 3,
            title: 'Harry Potter',
            poster_path: '/harry-potter.jpg'
          },
          {
            id: 4,
            title: 'Harry Potter and the Chamber of Secrets',
            poster_path: '/harry-potter-and-the-chamber-of-secrets.jpg'
          }
        ]
      }),
    };
 });
});


describe('Movie API', () => {
  test('Should return movies', async () => {
    const requestWithTitle = new NextRequest('http://localhost:3000/api/movie?title=avengers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseWithTitle : Response = await GET(requestWithTitle);
    const dataWithTitle : any = await responseWithTitle.json();

    expect(responseWithTitle.status).toBe(200);
    expect(dataWithTitle.results).toEqual(
      [
        {
          id: 1,
          title: 'Avengers',
          posterUrl: 'https://image.tmdb.org/t/p/w500/avengers.jpg',
        },
        {
          id: 2,
          title: 'Avengers: Age of Ultron',
          posterUrl: 'https://image.tmdb.org/t/p/w500/avengers-age-of-ultron.jpg',
        },
      ],
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));
    const request = new NextRequest('http://localhost:3000/api/movie', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response : Response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual(
      [
        {
          id: 3,
          title: 'Harry Potter',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter.jpg'
        },
        {
          id: 4,
          title: 'Harry Potter and the Chamber of Secrets',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter-and-the-chamber-of-secrets.jpg'
        }
      ],
    );
  }, 30000);

  test('Should return 400 if I send another request within 2 seconds', async () => {
    const request = new NextRequest('http://localhost:3000/api/movie', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const response : Response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.results).toEqual(
      [
        {
          id: 3,
          title: 'Harry Potter',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter.jpg'
        },
        {
          id: 4,
          title: 'Harry Potter and the Chamber of Secrets',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter-and-the-chamber-of-secrets.jpg'
        }
      ],
    );

    const request2 = new NextRequest('http://localhost:3000/api/movie', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const response2 : Response = await GET(request2);
    expect(response2.status).toBe(400);
  });

  test('Fetch from cache', async () => {
    const request = new NextRequest('http://localhost:3000/api/movie', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': '100.100.100.100'
      },
    });
    const response : Response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.results).toEqual(
      [
        {
          id: 3,
          title: 'Harry Potter',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter.jpg'
        },
        {
          id: 4,
          title: 'Harry Potter and the Chamber of Secrets',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter-and-the-chamber-of-secrets.jpg'
        }
      ],
    );

    const request2 = new NextRequest('http://localhost:3000/api/movie', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': '100.100.100.101'
      },
    });

    const response2 : Response = await GET(request2);
    const data2 = await response2.json();
    expect(response2.status).toBe(200);
    expect(data2.results).toEqual(
      [
        {
          id: 3,
          title: 'Harry Potter',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter.jpg'
        },
        {
          id: 4,
          title: 'Harry Potter and the Chamber of Secrets',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter-and-the-chamber-of-secrets.jpg'
        }
      ],
    );
  });

  test('Should return the right page number', async () => {
    const request = new NextRequest('http://localhost:3000/api/movie?page=2', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const response : Response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.page).toBe(2);
    expect(data.results).toEqual(
      [
        {
          id: 3,
          title: 'Harry Potter',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter.jpg'
        },
        {
          id: 4,
          title: 'Harry Potter and the Chamber of Secrets',
          posterUrl: 'https://image.tmdb.org/t/p/w500/harry-potter-and-the-chamber-of-secrets.jpg'
        }
      ],
    );

    const request2 = new NextRequest('http://localhost:3000/api/movie?page=3&title=avengers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': '100.100.200.200'
      },
    });

    const response2 : Response = await GET(request2);
    const data2 = await response2.json();
    expect(response2.status).toBe(200);
    expect(data2.page).toBe(3);
    expect(data2.results).toEqual(
      [
        {
          id: 1,
          title: 'Avengers',
          posterUrl: 'https://image.tmdb.org/t/p/w500/avengers.jpg',
        },
        {
          id: 2,
          title: 'Avengers: Age of Ultron',
          posterUrl: 'https://image.tmdb.org/t/p/w500/avengers-age-of-ultron.jpg',
        },
      ],
    );
  });
});