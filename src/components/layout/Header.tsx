import { useStore } from '@/store/useStore';
import TabsNavbar from './tabs-navbar';

export function Header() {
  const currentUser = useStore((state) => state.currentUser);
  const avatar = currentUser?.name.charAt(0).toUpperCase() || 'U';

  return (
    <header className="fixed top-0 left-0 w-full h-16 py-6 px-4 border-b border-primary/15 flex items-center justify-between z-20 backdrop-blur-sm">
      <div className="h-full flex items-center gap-4">
        <img
          src="https://storage.googleapis.com/content-generator-ia/ANIMACION%20TRANSPARENTE%203.gif"
          alt="alizia logo by educabot"
          className="h-full object-contain will-change-auto image-render-pixelated"
        />
      </div>
      <div className="flex items-center gap-4">
        <TabsNavbar />
        <div className="w-9 h-9 rounded-full bg-[#735fe3] text-primary-foreground flex items-center justify-center shrink-0">
          {avatar}
        </div>
      </div>
    </header>
  );
}
