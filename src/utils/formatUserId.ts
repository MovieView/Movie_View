export const formatUserId = (provider: string, userId: string) => {
  switch (provider) {
    case 'github':
      return `g_${userId}`;
    case 'kakao':
      return `k_${userId}`;
    case 'naver':
      return `n_${userId}`;
    default:
      console.log('해당하는 provider 값이 없음.');
  }
};
