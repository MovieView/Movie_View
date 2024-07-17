'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaHeart } from 'react-icons/fa6';
import Link from 'next/link';
import useUserProfilePicture from '@/hooks/useUserProfilePicture';


const Edit = () => {
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState<File | undefined>(
    undefined
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [inProcess, setInProcess] = useState<boolean>(true);
  const [isProfileUpdated, setIsProfileUpdated] = useState<boolean>(false);
  const { profilePicture, getProfilePicture, isLoading, error } =
    useUserProfilePicture();

  useEffect(() => {
    if(session){
      const userId = session.uid;
      const provider = session.provider;
      
      getProfilePicture(userId, provider);
    }
    
    if (isProfileUpdated) {
      window.location.reload();

    }
  }, [isProfileUpdated, session]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setInProcess(false);
    } else {
      alert('png, jpg 파일만 업로드 가능합니다.');
    }
  };

  const handleUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
    setInProcess(false);
    if (event.target.value === '') {
      setInProcess(true);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (session && (selectedImage || userName)) {
      setInProcess(true);
      try {
        const data = await updateProfile(session.uid, selectedImage, userName);
        alert('프로필이 성공적으로 변경되었습니다.');
  
        setIsProfileUpdated(true);
      } catch (error) {
        alert('프로필 변경에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setInProcess(false);
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
        </div>

        <div className='relative flex justify-center items-center w-32 h-32 rounded-full border-2 border-gray-400 cursor-pointer overflow-hidden'>
          <input
            type='file'
            accept='.png, .jpg, .jpeg'
            onChange={handleImageChange}
            className='absolute inset-0 opacity-0 cursor-pointer'
          />
          {preview ? (
            <img
              src={preview}
              alt='Preview'
              className='w-full h-full object-cover rounded-full'
            />
          ) : (
            <img
              src={profilePicture || '/default-profile.png'}
              alt='Profile'
              className='w-full h-full object-cover rounded-full'
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

        {inProcess ? (
          <button className='px-4 py-2 bg-gray-500 text-white rounded'>
            수정하기
          </button>
        ) : (
          <button
            type='submit'
            className='px-4 py-2 bg-blue-500 text-white rounded'
          >
            수정하기
          </button>
        )}
      </form>
    </div>
  );
};

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

  const response = await fetch('/api/users', {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
};

export default Edit;
