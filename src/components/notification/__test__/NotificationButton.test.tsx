/**
 * @jest-environment jsdom
 */

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter() {
    return {
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  }
}));

import '@testing-library/jest-dom'
import { beforeEach, expect, test } from '@jest/globals'
import { fireEvent, render } from '@testing-library/react'
import NotificationButton from '../NotificationButton'
import { describe } from 'node:test'
import fetchMock from 'jest-fetch-mock'
import { jest } from '@jest/globals';


beforeEach(() => {
  fetchMock.mockIf(`/api/notification`, async (req) => {
    return {
      status: 200,
      body: JSON.stringify({
        unreadCount: 3,
        rows: [
          {
            id: "FA6BB17B01A84146981E2C3F987BFEDB",
            template_data: '{"username": "user"}',
            template_message: '!{username}님이 팔로우했습니다.',
            created_at: '2022-01-01T00:00:00Z',
            checked: false,
            url_template: '/user/{username}',
            type_id: 1,
            type_name: 'follow',
          },
          {
            id: "FA6BB17B01A84146981E2C3F987BFEDC",
            template_data: '{"username": "user"}',
            template_message: '!{username}님이 팔로우했습니다.',
            created_at: '2022-01-01T00:00:00Z',
            checked: false,
            url_template: '/user/{username}',
            type_id: 1,
            type_name: 'follow',
          },
          {
            id: "FA6BB17B01A84146981E2C3F987BFEDD",
            template_data: '{"username": "user"}',
            template_message: '!{username}님이 팔로우했습니다.',
            created_at: '2022-01-01T00:00:00Z',
            checked: false,
            url_template: '/user/{username}',
            type_id: 1,
            type_name: 'follow',
          }
      ]}),
    }
  });
})

describe('NotificationButton', () => {
  test('renders NotificationButton component', async () => {
    const {findByText, findByRole, findAllByText} = render(<NotificationButton />);
    const notificationButton = await findByRole('button');
    {/* Open notification */}
    fireEvent.click(notificationButton);

    const notificationHeading = await findByText('유저 알림 (3)');
    expect(notificationHeading).toBeTruthy();

    const notificationItems = await findAllByText('님이 팔로우했습니다.');
    expect(notificationItems).toHaveLength(3);
  })

  test('closes notification when clicking button twice', async () => {
    const {findByRole, queryByText, findByText, findAllByText} = render(<NotificationButton />);
    const notificationButton = await findByRole('button');
    {/* Open notification */}
    fireEvent.click(notificationButton);

    const notificationHeading = await findByText('유저 알림 (3)');
    expect(notificationHeading).toBeTruthy();

    const notificationItems = await findAllByText('님이 팔로우했습니다.');
    expect(notificationItems).toHaveLength(3);

    {/* Clicking outside */}
    fireEvent.click(notificationButton);

    const notificationHeadingAfterClick = queryByText('유저 알림 (3)');
    expect(notificationHeadingAfterClick).toBeFalsy();
  });
})