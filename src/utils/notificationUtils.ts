export function splitStringWithPlaceholders(text: string) {
  // This regular expression finds substrings inside and outside of curly braces
  // the left curly brace may have a '!' in front of it, which means it should be bold
  const regex = /!?\{[^{}]*\}|\S[^{}]*(?=\s|$)/g;
  return text.match(regex);
};

export function formatDate(date: string) {
  const dateObj = new Date(date);
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diff / 60000);
  const diffInHours = Math.floor(diff / 3600000);
  const diffInDays = Math.floor(diff / 86400000);

  if (diffInMinutes < 1) {
    return '방금 전';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }
}