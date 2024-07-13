interface IProps {
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ReviewFakeForm({ setIsFormOpen }: IProps) {
  return (
    <div className='flex mb-4' onClick={() => setIsFormOpen(true)}>
      <input
        className='border px-2 h-10 flex-grow outline-none'
        type='text'
        placeholder='리뷰를 작성해 주세요.'
        readOnly
      />
      <button className='bg-first h-10 text-white p-2 rounded-tr-md rounded-br-md'>
        등록
      </button>
    </div>
  );
}
