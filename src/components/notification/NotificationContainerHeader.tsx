import Image from 'next/image'


interface NotificationContainerHeaderProps {
  totalCount: number | undefined;
  closeContainerCallback: () => void;
  toggleSettingsCallback: () => void;
}

const NotificationContainerHeader : React.FC<NotificationContainerHeaderProps> = ({
  totalCount,
  closeContainerCallback,
  toggleSettingsCallback
}) => {
  return (
    <div className='w-full bg-second px-9 sm:px-4 p-4 text-lg font-medium flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='flex flex-col items-center justify-center p-1 rounded-lg hover:bg-fourth'>
          <button onClick={closeContainerCallback}>
            <Image
              src={'/icons/close-black.svg'}
              alt='Close'
              width={20}
              height={20}
              className='w-5 h-5'
            />
          </button>
        </div>
        유저 알림 
      </div>
      {(totalCount) ? (
        <div className='flex flex-col items-center justify-center rounded-lg hover:bg-fourth p-1'>
          <button onClick={toggleSettingsCallback}>
            <Image
              src={'/icons/settings-black.svg'}
              alt='Settings'
              width={20}
              height={20}
              className='w-6 h-6'
            />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default NotificationContainerHeader;