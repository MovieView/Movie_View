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
import { expect, jest, test } from '@jest/globals'
import { fireEvent, render } from '@testing-library/react'
import { describe } from 'node:test'
import NotificationContainer from '../NotificationContainer'


describe('NotificationContainer', () => {
  const changeVisibility = jest.fn();
  const loadNotifications = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);

  const notifications: INotification[] = [
    {
      id: "FABCDEF",
      value: "Hello, World!",
      read: false,
      createdAt: '2022-01-01T00:00:00Z',
    },
    {
      id: "FABCDEG",
      value: "Hello, World!",
      read: false,
      createdAt: '2022-01-01T00:00:00Z',
    },
    {
      id: "FABCDEH",
      value: "Hello, World!",
      read: false,
      createdAt: '2022-01-01T00:00:00Z',
    }
  ]

  test('renders NotificationButton component', async () => {
    const {findAllByText} = render(
      <NotificationContainer 
        visibility={true}
        changeVisibility={changeVisibility}
        loadNotifications={loadNotifications}
        notifications={notifications}
        isLoading={false}
        error={null}
      />
    );

    const notificationContainer = await findAllByText('유저 알림 (3)');
    expect(notificationContainer).toHaveLength(1);

    const notificationItems = await findAllByText('Hello, World!');
    expect(notificationItems).toHaveLength(3);
    expect(notificationItems).not.toHaveLength(4);
  });

  test('renders NotificationButton component with error', async () => {
    const {findAllByText} = render(
      <NotificationContainer 
        visibility={true}
        changeVisibility={changeVisibility}
        loadNotifications={loadNotifications}
        notifications={notifications}
        isLoading={false}
        error={'Error'}
      />
    );

    const error = await findAllByText('알림 로딩중 에러 발생');
    expect(error).toHaveLength(1);
  });

  test('renders NotificationButton component with loading', async () => {
    const {queryAllByText} = render(
      <NotificationContainer 
        visibility={true}
        changeVisibility={changeVisibility}
        loadNotifications={loadNotifications}
        notifications={notifications}
        isLoading={true}
        error={null}
      />
    );

    const error = queryAllByText('알림 로딩중 에러 발생');
    expect(error).toHaveLength(0);

    const notificationItems = queryAllByText('Hello, World!');
    expect(notificationItems).toHaveLength(0);
  });

  test('renders NotificationButton component with no notifications', async () => {
    const {queryAllByText} = render(
      <NotificationContainer 
        visibility={true}
        changeVisibility={changeVisibility}
        loadNotifications={loadNotifications}
        notifications={[]}
        isLoading={false}
        error={null}
      />
    );

    const error = queryAllByText('알림 로딩중 에러 발생');
    expect(error).toHaveLength(0);

    const notificationItems = queryAllByText('Hello, World!');
    expect(notificationItems).toHaveLength(0);

    const noNotification = queryAllByText('새로운 알림이 없습니다.');
    expect(noNotification).toHaveLength(1);
  });

  test('toggle settings', async () => {
    const {findAllByRole, queryByText} = render(
      <NotificationContainer 
        visibility={true}
        changeVisibility={changeVisibility}
        loadNotifications={loadNotifications}
        notifications={notifications}
        isLoading={false}
        error={null}
      />
    );

    const settingsButton = await findAllByRole('button');
    expect(settingsButton).toHaveLength(2);

    fireEvent.click(settingsButton[1]);

    const markEverythingAsRead = queryByText('전체 읽음 처리');
    expect(markEverythingAsRead).toBeTruthy();

    const deleteNotification = queryByText('알림 삭제');
    expect(deleteNotification).toBeTruthy();

    fireEvent.click(settingsButton[1]);

    const markEverythingAsReadAfterClose = queryByText('전체 읽음 처리');
    expect(markEverythingAsReadAfterClose).toBeFalsy();

    const deleteNotificationAfterClose = queryByText('알림 삭제');
    expect(deleteNotificationAfterClose).toBeFalsy();
  });
});