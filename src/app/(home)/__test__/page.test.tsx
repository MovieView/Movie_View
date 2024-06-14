/**
 * @jest-environment jsdom
 */

jest.mock('redis');

import '@testing-library/jest-dom'
import { beforeEach, expect, jest, test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import Home from '../page'
import { describe } from 'node:test'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from 'redis'

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

describe('Home Page', () => {
  test('renders the search bar', () => {
    const queryClient = new QueryClient();
    render(<QueryClientProvider client={queryClient}><Home /></QueryClientProvider>);
    const searchBarText = screen.getByText('Search', { exact: false }).textContent;
    expect(searchBarText).toBe('Search');
  })
});