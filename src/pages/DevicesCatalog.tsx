import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, Package, Monitor, BookOpen, Heart } from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/ui/badge';

const rampConfig: Record<number, { icon: React.ElementType; bg: string }> = {
  1: { icon: Monitor, bg: 'bg-violet-activity' },
  2: { icon: BookOpen, bg: 'bg-green-activity' },
  3: { icon: Heart, bg: 'bg-pink-activity' },
};

export function DevicesCatalog() {
  const navigate = useNavigate();
  const [ramps, setRamps] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRamps, setExpandedRamps] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([api.inclusion.getRamps(), api.inclusion.getDevices()]).then(
      ([rampsData, devicesData]) => {
        setRamps(rampsData);
        setDevices(devicesData);
        if (rampsData.length > 0) {
          setExpandedRamps(new Set([rampsData[0].id]));
        }
        setLoading(false);
      }
    );
  }, []);

  const toggleRamp = (id: number) => {
    setExpandedRamps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const devicesByRamp = ramps.map((ramp) => ({
    ...ramp,
    devices: devices.filter((d: any) => d.ramp_id === ramp.id),
  }));

  if (loading) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-background">
      <div className="sticky top-0 z-10 bg-muted border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/inclusion')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="headline-1-emphasized">Dispositivos</h1>
          <p className="subheadline-regular text-muted-foreground">Catálogo de la valija de inclusión</p>
        </div>
      </div>

      <div className="px-4 pt-6 pb-12 space-y-3">
        {devicesByRamp.map((ramp) => {
          const config = rampConfig[ramp.id] || rampConfig[1];
          const Icon = config.icon;
          const isExpanded = expandedRamps.has(ramp.id);

          return (
            <div key={ramp.id} className="rounded-3xl overflow-hidden activity-card-shadow bg-white">
              <button
                onClick={() => toggleRamp(ramp.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="headline-1-emphasized text-foreground">{ramp.name}</h3>
                </div>
                <Badge variant="secondary" className="bg-[#01CEAA4D] callout-regular text-foreground rounded-xl px-3 py-1">
                  {ramp.devices.length}
                </Badge>
                <ChevronDown className={`w-5 h-5 text-secondary-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {ramp.devices.map((device: any) => (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
