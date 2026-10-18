import { useCallback, useRef, useState } from 'react';

// Small hook to manage a transient toast message without pulling in a full toast library.
export const useToast = (duration = 2000) => {
  const [message, setMessage] = useState('');
  const timeoutRef = useRef(null);

  const showToast = useCallback(
    (msg) => {
      setMessage(msg);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setMessage(''), duration);
    },
    [duration]
  );

  return { message, showToast };
};

export default useToast;
