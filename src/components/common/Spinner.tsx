interface IProps {
  size: 'xs' | 'sm' | 'lg';
  item?: boolean;
}

export default function Spinner({ size, item = false }: IProps) {
  const spinner = (
    <div
      className={`mx-auto animate-spin border-t-4 border-r-4 border-l-4 border-b-4 border-t-second border-r-second rounded-full my-2 ${getSpinnerSize(
        size
      )}`}
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

function getSpinnerSize(size: 'xs' | 'sm' | 'lg') {
  switch (size) {
    case 'xs':
      return 'h-8 w-8';
    case 'sm':
      return 'h-12 w-12';
    case 'lg':
      return 'h-24 w-24';
  }
}
