import { useEffect } from 'react';


interface IUseOutsideClick {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  onClose: () => void;
}

const useOutsideClick = ({ ref, isVisible, onClose }: IUseOutsideClick) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isVisible && 
        ref.current && 
        ref.current instanceof HTMLElement && 
        event.target instanceof Node && 
        !ref.current.contains(event.target)
      ){
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose, ref]);
};

export default useOutsideClick;