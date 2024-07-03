'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaHeart } from 'react-icons/fa6';
import Link from 'next/link';
const Edit = () => {
    const { data: session } = useSession();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>('');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            setSelectedImage(file);
            setPreview(URL.createObjectURL(file));
        } else {
            alert('png, jpg 파일만 업로드 가능합니다.');
        }
    };

    const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (selectedImage || nickname) {
            // 서버로 보내는 로직
        }
    };
    const heartList = () => {
        // 좋아요 한 리스트로 이동
    };

    if (!session) {
        return <div>먼저 로그인해주세요.</div>;
    }

    return (
        // <div className='bg-first w-2/5 h-auto text-black-600 rounded-lg mb-20 pb-10'>
        <div className='bg-gray-100 w-2/5 h-auto text-black-600 rounded-lg mb-20 pb-10 border border-first'>
            <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center space-y-4'>
            <div className='p-10 text-[20px] font-bold'>프로필 수정<FaHeart className='relative bottom-6 left-80 text-first'  onClick={heartList}/></div>
                <div className='relative flex justify-center items-center w-32 h-32 rounded-full border-2 border border-gray-400 cursor-pointer'>
                    <input 
                        type='file' 
                        accept='.png, .jpg, .jpeg' 
                        onChange={handleImageChange} 
                        className='absolute inset-0 opacity-0 cursor-pointer' 
                    />
                    {preview ? (
                        <img src={preview} alt='Preview' className='w-full h-full object-cover rounded-full' />
                    ) : (
                        <img src={session.user?.image || '/default-profile.png'} alt='Profile' className='w-full h-full object-cover rounded-full' />
                    )}
                </div>
                <input 
                    type='text' 
                    placeholder='수정하실 닉네임을 입력해주세요.' 
                    value={nickname}
                    onChange={handleNicknameChange}
                    className='w-4/5 h-10 border border-gray rounded p-2'
                />
                <button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded'>
                    수정하기
                </button>
            </form>
        </div>
    );
};

export default Edit;
