import Image from 'next/image';


const NotificationFakeButton = () => {
  let className = 'flex flex-col items-center justify-center p-1 rounded-lg relative hover:bg-second invisible';

  return (
    <div className={className}>
      <button>
        <Image 
          src={'/icons/notification.svg'} 
          alt='notification'
          width={8} 
          height={8} 
          className='w-9 h-9'
        />
      </button>
    </div>
  );
}

export default NotificationFakeButton;