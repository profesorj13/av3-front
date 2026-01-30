import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Play, BookOpen, Lightbulb, GraduationCap, QrCode, CalendarDays, Heart, ClipboardCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/ui/badge';

export function DeviceDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.inclusion.getDevice(Number(id)).then((data) => {
        setDevice(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!device) return null;

  return (
    <div className="min-h-screen gradient-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-muted border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="headline-1-emphasized">Ficha del dispositivo</h1>
          <p className="subheadline-regular text-muted-foreground">{device.ramp_name}</p>
        </div>
      </div>

      {/* Hero card */}
      <div className="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 activity-card-shadow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/90 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {device.image_url ? (
              <img src={device.image_url} alt={device.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h2 className="title-1-emphasized text-foreground">{device.name}</h2>
            <Badge variant="secondary" className="bg-[#01CEAA4D] callout-regular text-foreground rounded-xl px-2 py-0.5 mt-1">
              {device.ramp_name}
            </Badge>
          </div>
        </div>
        <p className="body-1-regular text-secondary-foreground">{device.description}</p>
      </div>

      {/* Video placeholder */}
      <div className="px-4 mt-5">
        <div className="rounded-3xl overflow-hidden activity-card-shadow">
          <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent aspect-video flex items-center justify-center group cursor-pointer">
            <div className="relative flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center call-card-shadow group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
              </div>
              <span className="callout-semibold text-primary">Ver video del dispositivo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="px-4 mt-6 space-y-4 pb-32">
        {device.classroom_benefit && (
          <Section icon={<Sparkles className="w-5 h-5 text-primary" />} title="Para que te puede ayudar en clase">
            <p className="body-2-regular text-secondary-foreground">{device.classroom_benefit}</p>
          </Section>
        )}

        {device.how_to_use && (
          <Section icon={<BookOpen className="w-5 h-5 text-primary" />} title="Como usar">
            <p className="body-2-regular text-secondary-foreground">{device.how_to_use}</p>
          </Section>
        )}

        {device.rationale && (
          <Section icon={<GraduationCap className="w-5 h-5 text-emerald-500" />} title="Enfoque pedagogico">
            <p className="body-2-regular text-secondary-foreground">{device.rationale}</p>
          </Section>
        )}

        {device.recommendations && (
          <Section icon={<Lightbulb className="w-5 h-5 text-amber-500" />} title="Tips para usarlo mejor">
            <p className="body-2-regular text-secondary-foreground">{device.recommendations}</p>
          </Section>
        )}

        {device.needs_description && (
          <Section icon={<Heart className="w-5 h-5 text-pink-500" />} title="Que necesidades atiende">
            <p className="body-2-regular text-secondary-foreground">{device.needs_description}</p>
          </Section>
        )}

        {device.evaluation_criteria && (
          <Section icon={<ClipboardCheck className="w-5 h-5 text-indigo-500" />} title="Como evaluar o registrar su uso">
            <p className="body-2-regular text-secondary-foreground">{device.evaluation_criteria}</p>
          </Section>
        )}

        {/* Meta info */}
        <div className="fill-primary rounded-3xl activity-card-shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-secondary-foreground">
              <Package className="w-4 h-4" />
              <span className="body-2-medium">Cantidad en valija: <span className="text-foreground font-semibold">{device.quantity}</span></span>
            </div>
            {device.qr_code && (
              <div className="flex items-center gap-1.5 text-secondary-foreground">
                <QrCode className="w-4 h-4" />
                <span className="callout-regular">{device.qr_code}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={() => navigate('/inclusion/planificar')}
          className="w-full py-4 rounded-2xl bg-primary-gradient text-white headline-1-emphasized call-card-shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <CalendarDays className="w-5 h-5" />
          Planificar uso
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="fill-primary rounded-3xl activity-card-shadow p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="headline-1-emphasized text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}
