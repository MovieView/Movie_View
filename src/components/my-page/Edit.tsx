'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaHeart } from 'react-icons/fa6';
import Link from 'next/link';

const updateProfile = async (
  userId: string,
  profilePicture?: File,
  userName?: string
) => {
  const formData = new FormData();

  formData.append('userId', userId);
  if (profilePicture) {
    formData.append('profilePicture', profilePicture);
  }
  if (userName) {
    formData.append('username', userName);
  }

  const response = await fetch('/api/my-page', {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    console.log(response.json());
    throw new Error('Failed to update profile');
  }

  return response.json();
};

const Edit = () => {
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState<File | undefined>(
    undefined
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      alert('png, jpg 파일만 업로드 가능합니다.');
    }
  };

  const handleUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (session && (selectedImage || userName)) {
      try {
        const data = await updateProfile(session.uid, selectedImage, userName);
        console.log(data.message);
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!session) {
    return <div>먼저 로그인해주세요.</div>;
  }

  return (
    <div className='bg-gray-100 w-2/5 h-auto text-black-600 rounded-lg mb-20 pb-10 border border-first'>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col justify-center items-center space-y-4'
      >
        <div className='w-full flex justify-center'>
          <div className='relative w-full max-w-4xl p-10 text-[20px] font-bold flex items-center justify-between'>
            <span className='mx-auto'>프로필 수정</span>
            <Link href={'/my-page/movies-like'}>
              <FaHeart className='absolute right-[20px] text-first' />
            </Link>
          </div>

          <div className='relative flex justify-center items-center w-32 h-32 rounded-full border-2 border border-gray-400 cursor-pointer'>
            <input
              type='file'
              accept='.png, .jpg, .jpeg'
              onChange={handleImageChange}
              className='absolute inset-0 opacity-0 cursor-pointer'
            />
            {/* {preview ? (
            <img src={preview} alt='Preview' layout="fill" objectFit="cover" className='rounded-full' />
          ) : (
            <img src={session.user?.image || '/default-profile.png'} alt='Profile' layout="fill" objectFit="cover" className='rounded-full' />
          )} */}
            {preview ? (
              <img src={preview} alt='Preview' className='rounded-full' />
            ) : (
              <img
                src={session.user?.image || '/default-profile.png'}
                alt='Profile'
                className='rounded-full'
              />
            )}
          </div>
          <input
            type='text'
            placeholder='수정하실 닉네임을 입력해주세요.'
            value={userName}
            onChange={handleUserNameChange}
            className='w-4/5 h-10  border border-gray rounded p-2'
          />
          <button
            type='submit'
            className='px-4 py-2 bg-blue-500 text-white rounded'
          >
            수정하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default Edit;
