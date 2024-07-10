interface IProps {
  size: 'xs' | 'sm' | 'lg';
  item?: boolean;
}

export default function Spinner ({
  size,
  item = false
}: IProps) {
  const sizeMapping = {
    xs: '2rem',
    sm: '3rem',
    lg: '6rem'
  };
  
  const spinnerSize: string = sizeMapping[size] || '6rem';

  const spinner = (
    <div
      className='mx-auto animate-spin border-t-4 border-r-4 border-l-4 border-b-4 border-t-second border-r-second rounded-full my-2'
      style={{ height: spinnerSize, width: spinnerSize }}
    ></div>
  );

  return (
    <>
      {item ? (
        <div className='flex items-center justify-center min-h-screen'>
          {spinner}
        </div>
      ) : (
        spinner
      )}
    </>
  );
}
