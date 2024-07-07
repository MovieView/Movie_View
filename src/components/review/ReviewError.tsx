export default function ReviewError() {
  return (
    <div className='w-full max-w-3xl mx-auto py-8 px-2 border text-center my-8 rounded-md'>
      <p className='text-lg'>
        현재 서버에 문제가 발생하여 요청을 처리할 수 없습니다. 잠시 후 다시
        시도해주세요.
      </p>
    </div>
  );
}
