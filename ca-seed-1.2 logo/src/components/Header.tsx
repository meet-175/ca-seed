import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import Logo from './Logo';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={cn("flex items-center justify-between px-6 py-3.5 bg-[#7e22ce] text-white shrink-0 shadow-sm", className)}>
      <Link to="/" className="group flex items-center hover:opacity-95 transition-opacity">
        <Logo variant="white" showTagline={true} />
      </Link>
      <div className="flex items-center gap-3">
        <Link 
          to="/admin" 
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors border border-white/10"
        >
          <Settings className="w-4 h-4" />
          Admin
        </Link>
      </div>
    </header>
  );
}
