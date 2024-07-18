export type TProvider = 'github' | 'kakao' | 'naver';

export interface LoginRequestBody {
  userId: BigInt;
  provider: TProvider;
  extraData: {
    name: string;
    profilePicture: string;
  };
}
