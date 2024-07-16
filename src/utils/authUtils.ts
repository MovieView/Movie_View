export const formatUserId = (provider: string, userId: string) => {
  switch (provider) {
    case 'github':
      return `github_${userId}`;
    case 'kakao':
      return `kakao_${userId}`;
    case 'google':
      return `google_${userId}`;
    default:
      return;
  }
};

export const formProviderId = (provider: string) => {
  switch (provider) {
    case 'github':
      return 0;
    case 'kakao':
      return 1;
    case 'google':
      return 2;
  }
};

export const formatDateToMySQL = (date: Date) => {
  const pad = (num: number) => (num < 10 ? '0' : '') + num;
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  );
};

export const generateUniqueInt = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  return timestamp * 1000 + randomNum;
};