import { Home, Calendar, Folder, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <nav className={cn('w-16 backdrop-blur-sm border-r border-primary/15 flex flex-col items-center py-4', className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <a
            href="#/"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-black hover:text-[#324155] transition-colors"
          >
            <Home size={20} />
          </a>
        </li>
        <li>
          <a
            href="#/"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-black hover:text-[#324155] transition-colors"
          >
            <Calendar size={20} />
          </a>
        </li>
        <li>
          <a
            href="#/"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-black hover:text-[#324155] transition-colors"
          >
            <Folder size={20} />
          </a>
        </li>
        <li>
          <a
            href="#/"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-black hover:text-[#324155] transition-colors"
          >
            <Settings size={20} />
          </a>
        </li>
      </ul>
    </nav>
  );
}
