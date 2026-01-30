import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import type { Device, InclusionStudent, ChatMessage, Subject } from '@/types';
import { ArrowLeft, Send, Loader2, ChevronRight, User, Package, Plus, X, Save, Check, Sparkles, BookOpen, GraduationCap, Lightbulb, Heart, ClipboardCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type PlannerStep = 'activity' | 'student' | 'new_profile' | 'recommendation' | 'chat';

interface ActivityData {
  subject: string;
  objective: string;
  duration: string;
  dynamic: string;
  materials: string;
}

export function InclusionPlanner() {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<PlannerStep>('activity');
  const [messages, setMessages] = useState<{ role: string; content: string; type?: string; data?: any }[]>([
    { role: 'assistant', content: 'Hola! Soy Alicia, tu asistente de inclusion. Vamos a planificar una clase inclusiva. Contame sobre la actividad.' },
  ]);
  const [activityData, setActivityData] = useState<ActivityData>({
    subject: '',
    objective: '',
    duration: '',
    dynamic: 'individual',
    materials: '',
  });
  const [students, setStudents] = useState<InclusionStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<InclusionStudent | null>(null);
  const [recommendedDevice, setRecommendedDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [courseId] = useState(1); // Default to course 1 for demo
  const [newProfileData, setNewProfileData] = useState({
    is_transitory: false,
    difficulties: [] as string[],
    free_description: '',
  });
  const [selectedNewStudent, setSelectedNewStudent] = useState<InclusionStudent | null>(null);
  const [, setSubjectsList] = useState<Subject[]>([]);
  const [showStudentPickerModal, setShowStudentPickerModal] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadStudents();
    api.subjects.getAll().then(setSubjectsList).catch(console.error);
  }, [courseId]);

  const loadStudents = async () => {
    try {
      const data = await api.inclusion.getCourseInclusionStudents(courseId);
      setStudents(data);
    } catch (e) {
      console.error('Error loading students:', e);
    }
  };

  const handleActivitySubmit = () => {
    if (!activityData.subject || !activityData.objective) return;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: `Asignatura: ${activityData.subject}\nObjetivo: ${activityData.objective}\nDuracion: ${activityData.duration || 'No especificada'}\nDinamica: ${activityData.dynamic}\nMateriales: ${activityData.materials || 'No especificados'}`,
      },
      {
        role: 'assistant',
        content: 'Genial! Ahora selecciona el alumno que necesita adaptacion.',
      },
    ]);
    setStep('student');
  };

  const handleStudentSelect = async (student: InclusionStudent) => {
    if (!student.profile_id) {
      setSelectedNewStudent(student);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `Seleccione a ${student.name}` },
        { role: 'assistant', content: `${student.name} no tiene un perfil de inclusion todavia. Vamos a crear uno. Contame sobre sus necesidades.` },
      ]);
      setStep('new_profile');
      return;
    }

    setSelectedStudent(student);
    const diffLabels: Record<string, string> = {
      MOTRICIDAD_MANOS_BRAZOS: 'motricidad en manos/brazos',
      COMUNICACION_EXPRESION: 'comunicacion/expresion',
      ATENCION_REGULACION_EMOCIONAL: 'atencion/regulacion emocional',
      ACCESO_TECNOLOGIA_DIGITAL: 'acceso a tecnologia digital',
      MULTIPLES: 'multiples dificultades',
      SIN_DEFINIR: 'sin definir',
    };
    const difficulties = student.difficulties?.map((d) => diffLabels[d] || d).join(', ') || 'sin especificar';

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: `Seleccione a ${student.name}` },
      {
        role: 'assistant',
        content: `Listo, seleccionaste a ${student.name}. Según la ficha, dijiste que presenta: ${difficulties}. ${student.is_transitory ? '(Condición transitoria)' : '(Condición permanente)'}\n\nBuscando la mejor recomendación...`,
      },
    ]);

    setStep('recommendation');
    await getRecommendation(student);
  };

  const handleNewProfileSubmit = async () => {
    if (!selectedNewStudent || newProfileData.difficulties.length === 0) return;
    setIsLoading(true);

    try {
      await api.inclusion.createStudentProfile(selectedNewStudent.id, newProfileData);
      await loadStudents();
      const updatedStudents = await api.inclusion.getCourseInclusionStudents(courseId);
      const updated = updatedStudents.find((s) => s.id === selectedNewStudent.id);
      if (updated) {
        setSelectedStudent(updated);
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: 'Perfil creado' },
          { role: 'assistant', content: `Listo, se creó la ficha de ${updated.name}. Buscando la mejor recomendación...` },
        ]);
        setStep('recommendation');
        await getRecommendation(updated);
      }
    } catch (e) {
      console.error('Error creating profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendation = async (student: InclusionStudent) => {
    setIsLoading(true);
    try {
      const result = await api.inclusion.recommend({
        subject: activityData.subject,
        objective: activityData.objective,
        duration: activityData.duration,
        dynamic: activityData.dynamic,
        materials: activityData.materials,
        student_id: student.id,
      });

      setRecommendedDevice(result.device);
      setChatHistory([
        { role: 'user', content: `Necesito una recomendacion de dispositivo para ${student.name} en la actividad de ${activityData.objective} en ${activityData.subject}.` },
        { role: 'assistant', content: result.response },
      ]);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
          type: 'recommendation',
          data: { device: result.device },
        },
      ]);
      setStep('chat');
    } catch (e) {
      console.error('Error getting recommendation:', e);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Hubo un error al generar la recomendacion. Por favor, intenta de nuevo.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(updatedHistory);

    setIsLoading(true);
    try {
      const result = await api.inclusion.recommend({
        subject: activityData.subject,
        objective: activityData.objective,
        duration: activityData.duration,
        dynamic: activityData.dynamic,
        materials: activityData.materials,
        student_id: selectedStudent?.id || 0,
        history: updatedHistory,
      });

      const newHistory: ChatMessage[] = [...updatedHistory, { role: 'assistant', content: result.response }];
      setChatHistory(newHistory);

      if (result.device) {
        setRecommendedDevice(result.device);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.response, type: 'recommendation', data: { device: result.device } },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.response }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error al comunicarse con Alicia.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDifficulty = (d: string) => {
    setNewProfileData((prev) => ({
      ...prev,
      difficulties: prev.difficulties.includes(d) ? prev.difficulties.filter((x) => x !== d) : [...prev.difficulties, d],
    }));
  };

  const studentsWithProfile = students.filter((s) => s.profile_id);
  const studentsWithoutProfile = students.filter((s) => !s.profile_id);

  const difficultyOptions = [
    { value: 'MOTRICIDAD_MANOS_BRAZOS', label: 'Tiene dificultad para mover o controlar sus manos o brazos' },
    { value: 'COMUNICACION_EXPRESION', label: 'Tiene dificultad para comunicarse o expresar respuestas' },
    { value: 'ATENCION_REGULACION_EMOCIONAL', label: 'Tiene dificultad para mantener la atencion o regular emociones' },
    { value: 'ACCESO_TECNOLOGIA_DIGITAL', label: 'Tiene dificultad para acceder a la tecnologia digital' },
    { value: 'MULTIPLES', label: 'Tiene varias de estas dificultades' },
    { value: 'SIN_DEFINIR', label: 'No estoy seguro / quiero explorar opciones' },
  ];

  return (
    <div className="flex flex-col h-screen gradient-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted">
        <button onClick={() => {
          if ((step === 'chat' || step === 'recommendation') && recommendedDevice) {
            setShowBackConfirm(true);
          } else {
            navigate(-1);
          }
        }} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="headline-1-emphasized">Planificar con perspectiva de inclusion</h1>
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
                  {msg.type === 'recommendation' && msg.data?.device && (
                    <DeviceCard device={msg.data.device} onViewDetail={() => setShowDeviceModal(true)} />
                  )}
                  <div className="max-w-[85%] rounded-2xl p-3 bg-muted text-[#10182B]">
                    <p className="body-2-regular whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.type === 'recommendation' && (
                    <button
                      onClick={() => {
                        const planData = {
                          activity: activityData,
                          student: selectedStudent,
                          device: recommendedDevice,
                          recommendation: msg.content,
                          savedAt: new Date().toISOString(),
                        };
                        const saved = JSON.parse(localStorage.getItem('inclusion_plans') || '[]');
                        saved.push(planData);
                        localStorage.setItem('inclusion_plans', JSON.stringify(saved));
                        setSavedToast(true);
                        setTimeout(() => setSavedToast(false), 2500);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-4 h-4" /> Guardar planificacion
                    </button>
                  )}
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

        {/* Wizard steps inline */}
        {step === 'activity' && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Paso 1: Actividad</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Asignatura *</label>
                <Select value={activityData.subject} onValueChange={(v) => setActivityData((prev) => ({ ...prev, subject: v }))}>
                  <SelectTrigger className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                    <SelectValue placeholder="Selecciona una asignatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Matematica', 'Practicas de lenguaje', 'Historia', 'Economia'].map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Objetivo de la actividad *</label>
                <input
                  type="text"
                  value={activityData.objective}
                  onChange={(e) => setActivityData((prev) => ({ ...prev, objective: e.target.value }))}
                  placeholder="Ej: Dictado de texto"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Duracion</label>
                  <input
                    type="text"
                    value={activityData.duration}
                    onChange={(e) => setActivityData((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="Ej: 10 minutos"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Dinamica</label>
                  <Select value={activityData.dynamic} onValueChange={(v) => setActivityData((prev) => ({ ...prev, dynamic: v }))}>
                    <SelectTrigger className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="grupal">Grupal</SelectItem>
                      <SelectItem value="parejas">En parejas</SelectItem>
                      <SelectItem value="con_tecnologia">Con tecnologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Materiales</label>
                <input
                  type="text"
                  value={activityData.materials}
                  onChange={(e) => setActivityData((prev) => ({ ...prev, materials: e.target.value }))}
                  placeholder="Ej: Lapiz y cuaderno"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <button
                onClick={handleActivitySubmit}
                disabled={!activityData.subject || !activityData.objective}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'student' && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Paso 2: Alumno</p>
            {studentsWithProfile.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Perfil del alumno:</p>
                {studentsWithProfile.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStudentSelect(s)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-input hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium truncate">{s.name}</p>
                  </button>
                ))}
              </div>
            )}
            {studentsWithoutProfile.length > 0 && (
              <button
                onClick={() => setShowStudentPickerModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-input hover:border-primary/50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Crear nuevo perfil de inclusion</p>
              </button>
            )}
          </div>
        )}

        {step === 'new_profile' && selectedNewStudent && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Perfil de inclusion: {selectedNewStudent.name}</p>
            <div>
              <label className="text-sm font-medium mb-2 block">La condicion es transitoria o permanente?</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewProfileData((prev) => ({ ...prev, is_transitory: true }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${newProfileData.is_transitory ? 'border-primary bg-primary/10 text-primary' : 'border-input'}`}
                >
                  Transitoria
                </button>
                <button
                  onClick={() => setNewProfileData((prev) => ({ ...prev, is_transitory: false }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${!newProfileData.is_transitory ? 'border-primary bg-primary/10 text-primary' : 'border-input'}`}
                >
                  Permanente
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cual describe mejor al estudiante?</label>
              <div className="space-y-2">
                {difficultyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleDifficulty(opt.value)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                      newProfileData.difficulties.includes(opt.value) ? 'border-primary bg-primary/10 text-primary' : 'border-input hover:border-primary/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Algo mas sobre este alumno? (opcional)</label>
              <textarea
                value={newProfileData.free_description}
                onChange={(e) => setNewProfileData((prev) => ({ ...prev, free_description: e.target.value }))}
                placeholder="Notas adicionales..."
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm min-h-[60px] resize-none"
              />
            </div>
            <button
              onClick={handleNewProfileSubmit}
              disabled={newProfileData.difficulties.length === 0 || isLoading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Crear perfil y continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {isLoading && step === 'recommendation' && (
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

      {/* Input area for free chat */}
      {(step === 'chat' || step === 'recommendation') && (
        <div className="px-4 py-3">
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="Escribi un mensaje..."
              disabled={isLoading}
              className="w-full h-14 rounded-xl border border-gray-200 px-4 pr-12 text-sm text-[#2C2C2C] placeholder:text-[#2C2C2C]/60 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-md"
            />
            <button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#735FE3] rounded-lg hover:bg-[#735FE3]/90 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>
          <p className="text-xs text-[#47566C]/60 mt-2 text-center">
            Alizia puede equivocarse. Siempre verificá la información importante antes de tomar decisiones.
          </p>
        </div>
      )}

      {/* Saved toast */}
      {savedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium shadow-lg">
          <Check className="w-4 h-4" /> Planificacion guardada
        </div>
      )}

      {/* Back confirmation modal */}
      {showBackConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setShowBackConfirm(false)}>
          <div className="bg-card rounded-2xl p-5 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold">Queres guardar la planificacion antes de salir?</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const planData = {
                    activity: activityData,
                    student: selectedStudent,
                    device: recommendedDevice,
                    recommendation: messages.find((m) => m.type === 'recommendation')?.content || '',
                    savedAt: new Date().toISOString(),
                  };
                  const saved = JSON.parse(localStorage.getItem('inclusion_plans') || '[]');
                  saved.push(planData);
                  localStorage.setItem('inclusion_plans', JSON.stringify(saved));
                  setShowBackConfirm(false);
                  navigate(-1);
                }}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
              >
                Guardar y salir
              </button>
              <button
                onClick={() => { setShowBackConfirm(false); navigate(-1); }}
                className="w-full py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors"
              >
                Descartar
              </button>
              <button
                onClick={() => setShowBackConfirm(false)}
                className="w-full py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device detail modal */}
      {showDeviceModal && recommendedDevice && (
        <DeviceDetailModal device={recommendedDevice} onClose={() => setShowDeviceModal(false)} />
      )}

      {/* Student picker modal */}
      {showStudentPickerModal && (
        <StudentPickerModal
          students={studentsWithoutProfile}
          onSelect={(s) => {
            setShowStudentPickerModal(false);
            handleStudentSelect(s);
          }}
          onClose={() => setShowStudentPickerModal(false)}
        />
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

function StudentPickerModal({
  students,
  onSelect,
  onClose,
}: {
  students: InclusionStudent[];
  onSelect: (s: InclusionStudent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Selecciona un alumno</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-input hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium truncate">{s.name}</p>
            </button>
          ))}
        </div>
      </div>
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
          <button onClick={onClose} className="text-sm text-primary font-medium">
            Cerrar
          </button>
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
