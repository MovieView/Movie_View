export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  });
  const formattedDate = date && formatter.format(date);
  return formattedDate;
}
