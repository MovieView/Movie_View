interface IProps {
  text: string;
  icon?: React.ReactNode;
  fontSize?: 'xs' | 'sm' | 'md' | 'lg';
  state?: boolean;
  onClick?: () => void;
}

export default function ReviewButton({
  text,
  icon,
  fontSize = 'md',
  state = false,
  onClick,
}: IProps) {
  return (
    <button
      className={`${
        state ? 'bg-third' : 'bg-transparent'
      } text-${fontSize} inline-flex items-center gap-1 border px-2 rounded-lg hover:bg-third transition ease-linear duration-300 w-fit`}
      onClick={onClick}
    >
      {icon && <div>{icon}</div>}
      <span>{text}</span>
    </button>
  );
}
