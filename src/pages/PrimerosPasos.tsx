import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Monitor, BookOpen, Heart } from 'lucide-react';
import { api } from '../services/api';
import { AnimatedOrb } from '../components/ui/AnimatedOrb';

const rampConfig: Record<number, { icon: React.ElementType; bg: string; color: string }> = {
  1: { icon: Monitor, bg: 'bg-violet-activity', color: 'text-white' },
  2: { icon: BookOpen, bg: 'bg-green-activity', color: 'text-white' },
  3: { icon: Heart, bg: 'bg-pink-activity', color: 'text-white' },
};

export function PrimerosPasos() {
  const navigate = useNavigate();
  const [ramps, setRamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.inclusion.getRamps().then((data) => {
      setRamps(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen gradient-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-muted border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/inclusion')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="headline-1-emphasized">Primeros Pasos</h1>
          <p className="subheadline-regular text-muted-foreground">Valija de Inclusion</p>
        </div>
      </div>

      {/* Hero section */}
      <div className="flex flex-col items-center px-6 pt-10 pb-8">
        <AnimatedOrb size="md" className="mb-6" />
        <h2 className="large-title-1-regular text-primary text-center mb-2">
          Conoce la Valija
        </h2>
        <p className="body-1-regular text-secondary-foreground text-center max-w-sm">
          La valija de inclusion cuenta con <span className="font-semibold text-primary">3 rampas adaptativas</span>, cada una con dispositivos pensados para diferentes necesidades del aula.
        </p>
      </div>

      {/* Ramp cards */}
      <div className="px-6 pb-12">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted/40 rounded-lg" />
                    <div className="h-4 w-full bg-muted/30 rounded-lg" />
                    <div className="h-4 w-2/3 bg-muted/30 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {ramps.map((ramp, i) => {
              const config = rampConfig[ramp.id] || rampConfig[i + 1] || rampConfig[1];
              const Icon = config.icon;
              return (
                <div
                  key={ramp.id}
                  className="cursor-pointer activity-card-shadow fill-primary rounded-3xl p-5 group hover:scale-[1.01] transition-all"
                  onClick={() => navigate(`/inclusion/primeros-pasos/${ramp.id}`)}
                >
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-7 h-7 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="headline-1-emphasized text-foreground">{ramp.name}</h4>
                        <ArrowRight className="w-5 h-5 text-secondary-foreground group-hover:translate-x-1 group-hover:text-primary transition-all flex-shrink-0" />
                      </div>
                      <p className="body-2-regular text-secondary-foreground line-clamp-2">
                        {ramp.short_description}
                      </p>
                      {ramp.devices && (
                        <span className="inline-block mt-2 callout-semibold text-primary">
                          {ramp.devices.length || '?'} dispositivos
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
