'use client';

import { useRouter } from 'next/navigation';

export default function ErrorOMG() {
  const router = useRouter();

  return (
    <div className='fixed flex flex-col min-h-screen items-center justify-center w-full p-3'>
      <div className='-translate-y-16'>
        <p className='w-full text-2xl text-center font-semibold'>
          페이지를 찾을 수 없습니다.
        </p>
        <div className='flex flex-col mt-10 sm:flex-row'>
          <button
            className='p-2 mr-0 text-white sm:mr-4 bg-[#769FCD] hover:bg-[#769FCD]/80 rounded-md'
            onClick={() => router.back()}
          >
            이전 페이지로 돌아가기
          </button>
          <button
            className='p-2 mt-2 text-white bg-[#769FCD] hover:bg-[#769FCD]/80 sm:mt-0 rounded-md'
            onClick={() => router.push('/')}
          >
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
