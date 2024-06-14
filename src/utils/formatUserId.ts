export const formatUserId = (provider: string, userId: string) => {
  switch (provider) {
    case 'github':
      return `github${userId}`;
    case 'kakao':
      return `kakao${userId}`;
    case 'google':
      return `google_${userId}`;
    default:
      console.log('해당하는 provider 값이 없음.');
  }
};
