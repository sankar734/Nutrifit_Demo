import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, showBack = false, right = null }) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-lavender flex items-center justify-center text-primary"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 className="text-lg font-bold text-ink">{title}</h1>
      </div>
      {right}
    </header>
  );
};

export default Header;
