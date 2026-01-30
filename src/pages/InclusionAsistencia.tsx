import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import type { Device, InclusionStudent, ChatMessage } from '@/types';
import { ArrowLeft, Send, Loader2, Mic, MicOff, User, Package, Sparkles, BookOpen, GraduationCap, Lightbulb, Heart, ClipboardCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UIMessage {
  role: 'assistant' | 'user';
  content: string;
  student?: InclusionStudent | null;
  device?: Device | null;
}

export function InclusionAsistencia() {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<UIMessage[]>([
    { role: 'assistant', content: 'Hola! Contame que esta pasando en el aula y te ayudo a encontrar una solucion.' },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [modalDevice, setModalDevice] = useState<Device | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = '0px';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: msg }]);

    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: msg }];
    setChatHistory(updatedHistory);

    setIsLoading(true);
    try {
      const result = await api.inclusion.assist({
        message: msg,
        history: chatHistory.length > 0 ? updatedHistory : undefined,
      });

      const assistantMsg: UIMessage = {
        role: 'assistant',
        content: result.response,
        student: result.identified_student,
        device: result.device,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setChatHistory((prev) => [...prev, { role: 'user', content: msg }, { role: 'assistant', content: result.response }]);
    } catch (e) {
      console.error('Error:', e);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error al comunicarse con Alicia. Intenta de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  return (
    <div className="flex flex-col h-screen gradient-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="headline-1-emphasized">Asistencia en el aula</h1>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 activity-card-bg">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'assistant' ? (
              <div className="flex gap-2 max-w-[95%]">
                <div className="w-8 h-8 relative flex-shrink-0 mt-1">
                  <div className="absolute inset-0 bg-linear-to-b from-white via-indigo-200 to-indigo-500 rounded-full blur-sm opacity-60"></div>
                  <div className="absolute inset-0 bg-linear-to-b from-white via-indigo-300 to-indigo-600 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  {msg.student && <StudentMiniCard student={msg.student} />}
                  {msg.device && (
                    <DeviceCard
                      device={msg.device}
                      onViewDetail={() => {
                        setModalDevice(msg.device!);
                        setShowDeviceModal(true);
                      }}
                    />
                  )}
                  <div className="max-w-[85%] rounded-2xl p-3 bg-muted text-[#10182B]">
                    <p className="body-2-regular whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl p-3 bg-[#735FE3] text-white">
                  <p className="body-2-regular whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 max-w-[95%]">
            <div className="w-8 h-8 relative flex-shrink-0">
              <div className="absolute inset-0 bg-linear-to-b from-white via-indigo-200 to-indigo-500 rounded-full blur-sm opacity-60"></div>
              <div className="absolute inset-0 bg-linear-to-b from-white via-indigo-300 to-indigo-600 rounded-full"></div>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#735FE3]" />
              <p className="body-2-regular text-[#10182B]">Escribiendo respuesta...</p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describi la situacion..."
            disabled={isLoading}
            rows={1}
            className="flex-1 min-h-[3.5rem] rounded-xl border border-gray-200 px-4 py-4 text-sm text-[#2C2C2C] placeholder:text-[#2C2C2C]/60 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-md resize-none overflow-hidden"
          />
          {speechSupported && (
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-colors ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-[#735FE3] rounded-xl hover:bg-[#735FE3]/90 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white" />}
          </button>
        </div>
        <p className="text-xs text-[#47566C]/60 mt-2 text-center">
          Alizia puede equivocarse. Siempre verifica la informacion importante antes de tomar decisiones.
        </p>
      </div>

      {/* Device detail modal */}
      {showDeviceModal && modalDevice && (
        <DeviceDetailModal device={modalDevice} onClose={() => setShowDeviceModal(false)} />
      )}
    </div>
  );
}

function StudentMiniCard({ student }: { student: InclusionStudent }) {
  const diffLabels: Record<string, string> = {
    MOTRICIDAD_MANOS_BRAZOS: 'Motricidad manos/brazos',
    COMUNICACION_EXPRESION: 'Comunicacion/expresion',
    ATENCION_REGULACION_EMOCIONAL: 'Atencion/regulacion emocional',
    ACCESO_TECNOLOGIA_DIGITAL: 'Acceso a tecnologia digital',
    MULTIPLES: 'Multiples dificultades',
    SIN_DEFINIR: 'Sin definir',
  };

  return (
    <div className="bg-card border border-blue-200 rounded-2xl p-3 space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold">{student.name}</p>
          {student.is_transitory !== undefined && (
            <p className="text-xs text-muted-foreground">
              {student.is_transitory ? 'Condicion transitoria' : 'Condicion permanente'}
            </p>
          )}
        </div>
      </div>
      {student.difficulties && student.difficulties.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {student.difficulties.map((d) => (
            <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {diffLabels[d] || d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DeviceCard({ device, onViewDetail }: { device: Device; onViewDetail: () => void }) {
  return (
    <div className="bg-card border border-primary/20 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/90 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {device.image_url ? (
            <img src={device.image_url} alt={device.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{device.name}</p>
          <Badge variant="secondary" className="bg-[#01CEAA4D] text-xs text-foreground rounded-xl px-2 py-0 mt-0.5">
            {device.ramp_name}
          </Badge>
        </div>
      </div>
      {device.classroom_benefit && (
        <p className="text-sm text-muted-foreground line-clamp-2">{device.classroom_benefit}</p>
      )}
      <button
        onClick={onViewDetail}
        className="w-full py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
      >
        Ver ficha completa
      </button>
    </div>
  );
}

function ModalSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border p-4 space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function DeviceDetailModal({ device, onClose }: { device: Device; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold">Ficha del dispositivo</h2>
          <button onClick={onClose} className="text-sm text-primary font-medium">Cerrar</button>
        </div>

        {/* Hero */}
        <div className="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/90 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {device.image_url ? (
                <img src={device.image_url} alt={device.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{device.name}</h3>
              <Badge variant="secondary" className="bg-[#01CEAA4D] text-xs text-foreground rounded-xl px-2 py-0.5 mt-1">
                {device.ramp_name}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{device.description}</p>
        </div>

        {/* Sections */}
        <div className="p-4 space-y-3">
          {device.classroom_benefit && (
            <ModalSection icon={<Sparkles className="w-5 h-5 text-primary" />} title="Para que te puede ayudar en clase">
              <p className="text-sm text-muted-foreground">{device.classroom_benefit}</p>
            </ModalSection>
          )}

          {device.how_to_use && (
            <ModalSection icon={<BookOpen className="w-5 h-5 text-primary" />} title="Como usar">
              <p className="text-sm text-muted-foreground">{device.how_to_use}</p>
            </ModalSection>
          )}

          {device.rationale && (
            <ModalSection icon={<GraduationCap className="w-5 h-5 text-emerald-500" />} title="Enfoque pedagogico">
              <p className="text-sm text-muted-foreground">{device.rationale}</p>
            </ModalSection>
          )}

          {device.recommendations && (
            <ModalSection icon={<Lightbulb className="w-5 h-5 text-amber-500" />} title="Tips para usarlo mejor">
              <p className="text-sm text-muted-foreground">{device.recommendations}</p>
            </ModalSection>
          )}

          {device.needs_description && (
            <ModalSection icon={<Heart className="w-5 h-5 text-pink-500" />} title="Que necesidades atiende">
              <p className="text-sm text-muted-foreground">{device.needs_description}</p>
            </ModalSection>
          )}

          {device.evaluation_criteria && (
            <ModalSection icon={<ClipboardCheck className="w-5 h-5 text-indigo-500" />} title="Como evaluar o registrar su uso">
              <p className="text-sm text-muted-foreground">{device.evaluation_criteria}</p>
            </ModalSection>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3">
            <span>Cantidad en valija: {device.quantity}</span>
            {device.qr_code && <span>QR: {device.qr_code}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
