import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Package, Play, Monitor, BookOpen, Heart } from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/ui/badge';

const rampConfig: Record<number, { icon: React.ElementType; bg: string; gradient: string }> = {
  1: { icon: Monitor, bg: 'bg-violet-activity', gradient: 'from-primary/20 to-primary/5' },
  2: { icon: BookOpen, bg: 'bg-green-activity', gradient: 'from-emerald-400/20 to-emerald-400/5' },
  3: { icon: Heart, bg: 'bg-pink-activity', gradient: 'from-pink-400/20 to-pink-400/5' },
};

export function RampDetail() {
  const navigate = useNavigate();
  const { rampId } = useParams<{ rampId: string }>();
  const [ramp, setRamp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rampId) {
      api.inclusion.getRamp(Number(rampId)).then((data) => {
        setRamp(data);
        setLoading(false);
      });
    }
  }, [rampId]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ramp) return null;

  const config = rampConfig[ramp.id] || rampConfig[1];
  const Icon = config.icon;

  return (
    <div className="min-h-screen gradient-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-muted border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/inclusion/primeros-pasos')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="headline-1-emphasized">{ramp.name}</h1>
          <p className="subheadline-regular text-muted-foreground">Rampa adaptativa</p>
        </div>
      </div>

      {/* Hero section */}
      <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
        <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center mb-4`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h2 className="large-title-2-bold text-foreground mb-2">{ramp.name}</h2>
        <p className="body-2-regular text-secondary-foreground max-w-xs">
          {ramp.description}
        </p>
      </div>

      {/* Video placeholder */}
      <div className="px-4 mt-6">
        <div className="rounded-3xl overflow-hidden activity-card-shadow">
          <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent aspect-video flex items-center justify-center group cursor-pointer">
            <div className="relative flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center call-card-shadow group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
              </div>
              <span className="callout-semibold text-primary">Ver video de la rampa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Devices section */}
      <div className="px-4 mt-8 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="title-2-emphasized text-foreground">Dispositivos</h3>
          <Badge variant="secondary" className="bg-[#01CEAA4D] callout-regular text-foreground rounded-xl px-3 py-1">
            {ramp.devices?.length || 0} items
          </Badge>
        </div>

        <div className="space-y-3">
          {ramp.devices?.map((device: any) => (
            <div
              key={device.id}
              className="cursor-pointer activity-card-shadow fill-primary rounded-3xl p-4 group hover:scale-[1.01] transition-all"
              onClick={() => navigate(`/inclusion/dispositivo/${device.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {device.image_url ? (
                    <img src={device.image_url} alt={device.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="headline-1-emphasized text-foreground">{device.name}</h4>
                  <p className="body-2-regular text-secondary-foreground line-clamp-2">{device.classroom_benefit || device.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-secondary-foreground group-hover:translate-x-1 group-hover:text-primary transition-all flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
