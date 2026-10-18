import { CheckCircle2 } from 'lucide-react';

// A lightweight, self-contained toast banner. Render conditionally based on a
// `message` string kept in the parent's local state; parent clears it after ~2s.
const Toast = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-50 animate-fade-up">
      <div className="bg-ink text-white text-sm font-medium rounded-2xl px-4 py-3 shadow-soft flex items-center gap-2">
        <CheckCircle2 size={16} className="text-green-400 shrink-0" />
        {message}
      </div>
    </div>
  );
};

export default Toast;
