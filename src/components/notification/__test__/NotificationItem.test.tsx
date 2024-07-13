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
import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe } from 'node:test'
import NotificationItem from '../NotificationItem'
import fetchMock, { MockParams } from 'jest-fetch-mock'
import { formatDate } from '@/utils/notificationUtils'


describe('NotificationItem', () => {
  test('renders NotificationItem component', async () => {
    const changeVisibility = jest.fn();
    const {queryAllByText} = render(
      <NotificationItem 
        id="FABCDEF"
        createdAt="2024-04-08T00:00:00Z"
        read={false}
        message={['Hello, World!']}
        changeVisibility={changeVisibility}
        deleteMode={false}
      />
    );

    const notificationText : HTMLElement[] = queryAllByText('Hello, World!');
    expect(notificationText).toHaveLength(1);

    const unreadFlag : HTMLCollectionOf<Element> = document.getElementsByClassName('bg-red-600');
    expect(unreadFlag).toHaveLength(1);

    const formattedDateString : string = formatDate('2024-04-08T00:00:00Z');

    const dateText : HTMLElement[] = queryAllByText(formattedDateString);
    expect(dateText).toHaveLength(1);
  });

  test('clicking on notification item marks it as read', async () => {
    const changeVisibility = jest.fn();
    fetchMock.mockResponseOnce(
      JSON.stringify({ message: 'Notification marked as read'}),
      { status: 200 } as MockParams
    );
    render(
      <NotificationItem 
        id="FABCDEF"
        createdAt="2024-04-08T00:00:00Z"
        read={false}
        message={['Hello, World!']}
        changeVisibility={changeVisibility}
        deleteMode={false}
      />
    );

    const notificationItem : HTMLAnchorElement = document.getElementsByTagName('a')[0];
    fireEvent.click(notificationItem);

    await waitFor(() => {
      expect(changeVisibility).not.toHaveBeenCalledTimes(0);
      expect(changeVisibility).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });

    const unreadFlag : HTMLCollectionOf<Element> = document.getElementsByClassName('bg-red-600');
    expect(unreadFlag).toHaveLength(0);
  });

  test('clicking on notification item with read', async () => {
    const changeVisibility = jest.fn();
    render(
      <NotificationItem 
        id="FABCDEF"
        createdAt="2024-04-08T00:00:00Z"
        read={true}
        message={['Hello, World!']}
        changeVisibility={changeVisibility}
        deleteMode={false}
      />
    );

    const notificationItem : HTMLAnchorElement = document.getElementsByTagName('a')[0];
    fireEvent.click(notificationItem);

    await waitFor(() => {
      expect(changeVisibility).not.toHaveBeenCalledTimes(0);
      expect(changeVisibility).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  test('clicking on notification item with error', async () => {
    const changeVisibility = jest.fn();
    fetchMock.mockResponseOnce(
      JSON.stringify({ message: 'Unauthorized'}),
      { status: 401 } as MockParams
    );
    render(
      <NotificationItem 
        id="FABCDEG"
        createdAt="2024-04-08T00:00:00Z"
        read={false}
        message={['Hello, World!']}
        changeVisibility={changeVisibility}
        deleteMode={false}
      />
    );

    const notificationItem : HTMLAnchorElement = document.getElementsByTagName('a')[0];
    fireEvent.click(notificationItem);

    await waitFor(() => {
      expect(changeVisibility).toHaveBeenCalledTimes(0);
      expect(changeVisibility).not.toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });
});