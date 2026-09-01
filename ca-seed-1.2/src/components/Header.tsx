import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={cn("flex items-center justify-between px-6 py-4 bg-[#7e22ce] text-white shrink-0", className)}>
      <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <BookOpen className="w-7 h-7" />
        <span className="text-xl font-bold tracking-tight">CA Seed</span>
      </Link>
      <div className="flex items-center gap-3">
        {/* Admin and Tester buttons temporarily removed */}
      </div>
    </header>
  );
}
