import { useNavigate } from 'react-router-dom';
import { MessageCircle, CalendarDays, BookOpen, Package } from 'lucide-react';
import { AnimatedOrb } from '../components/ui/AnimatedOrb';

export function InclusionHome() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gradient-background px-6">
      <div className="flex flex-col items-center mb-12">
        <AnimatedOrb size="md" className="mb-4" />
        <img
          src="https://storage.googleapis.com/content-generator-ia/ANIMACION%20TRANSPARENTE%203.gif"
          alt="alizia logo by educabot"
          className="w-64 object-contain"
        />
        <h2 className="large-title-1-regular text-primary">Inclusión</h2>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => navigate('/inclusion/asistencia')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold">Asistencia</p>
            <p className="text-sm text-muted-foreground">Ayuda en tiempo real en el aula</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/inclusion/planificar')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold">Planificar</p>
            <p className="text-sm text-muted-foreground">Adaptar una clase con dispositivos</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/inclusion/primeros-pasos')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold">Primeros pasos</p>
            <p className="text-sm text-muted-foreground">Conoce la valija y sus rampas</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/inclusion/dispositivos')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold">Dispositivos</p>
            <p className="text-sm text-muted-foreground">Catalogo de la valija de inclusion</p>
          </div>
        </button>
      </div>
    </div>
  );
}
