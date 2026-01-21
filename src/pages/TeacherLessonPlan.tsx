import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, X, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { ChatBot } from '@/components/ui/ChatBot';
import { api } from '@/services/api';
import type { ChatMessage } from '@/types';

export function TeacherLessonPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const planId = parseInt(id || '0');

  const {
    currentLessonPlan,
    setCurrentLessonPlan,
    teacherChatHistory,
    addTeacherChatMessage,
    clearTeacherChatHistory,
    isGenerating,
    setIsGenerating,
    categories,
    activities,
  } = useStore();

  useEffect(() => {
    loadPlan();
    return () => {
      clearTeacherChatHistory();
    };
  }, [planId]);

  // Auto-generate content for all moments when plan loads for the first time
  useEffect(() => {
    if (currentLessonPlan && !isGenerating) {
      const moments = (currentLessonPlan as any).moments || {};
      const needsGeneration = ['apertura', 'desarrollo', 'cierre'].some(
        (moment) => !moments[moment]?.generatedContent || moments[moment]?.generatedContent.trim() === '',
      );

      if (needsGeneration) {
        handleGenerateAllMoments();
      }
    }
  }, [currentLessonPlan?.id]); // Only trigger on plan load, not on every update

  const loadPlan = async () => {
    try {
      const plan = await api.lessonPlans.getById(planId);
      setCurrentLessonPlan(plan as any);
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const handleGenerateAllMoments = async () => {
    if (!currentLessonPlan || isGenerating) return;

    setIsGenerating(true);
    try {
      // Generate content for all three moments sequentially
      const momentTypes = ['apertura', 'desarrollo', 'cierre'];

      for (const momentType of momentTypes) {
        await api.chat.sendMessage(`/teacher-lesson-plans/${planId}/generate-moment`, {
          moment_type: momentType,
        });
      }

      // Reload the full plan to get all generated content
      const updatedPlan = await api.lessonPlans.getById(planId);
      setCurrentLessonPlan(updatedPlan as any);
    } catch (error) {
      console.error('Error generating moments:', error);
      alert('Error al generar contenido con IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
    };

    addTeacherChatMessage(userMessage);
    setIsGenerating(true);

    try {
      const result = await api.chat.sendMessage(`/teacher-lesson-plans/${planId}/chat`, {
        history: teacherChatHistory.concat(userMessage),
      });

      addTeacherChatMessage({ role: 'assistant', content: (result as any).response });

      // Update lesson plan if there were changes
      if ((result as any).plan && (result as any).changes_made && (result as any).changes_made.length > 0) {
        setCurrentLessonPlan({ ...currentLessonPlan, ...(result as any).plan });
      }
    } catch (e) {
      console.error('Error sending teacher chat message:', e);
      addTeacherChatMessage({ role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.' });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentLessonPlan) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  const categoryNames = (currentLessonPlan.category_ids || []).map((catId: number) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : `Cat ${catId}`;
  });

  const getActivityNames = (momentKey: string) => {
    const moments = currentLessonPlan.moments as any;
    const activityIds = moments?.[momentKey]?.activities || [];
    return activityIds.map((actId: number) => {
      const act = activities.find((a) => a.id === actId);
      return act ? act.name : `Act ${actId}`;
    });
  };

  const momentTypes = [
    { key: 'apertura', name: 'Apertura/Motivación' },
    { key: 'desarrollo', name: 'Desarrollo/Construcción' },
    { key: 'cierre', name: 'Cierre/Metacognición' },
  ];

  return (
    <div className="h-screen flex flex-col gradient-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
        <button
          onClick={() => navigate(`/teacher/cs/${currentLessonPlan.course_subject_id}`)}
          className="cursor-pointer hover:opacity-70"
        >
          <ChevronLeft className="w-6 h-6 text-[#10182B]" />
        </button>
        <h1 className="title-2-bold text-[#10182B]">Planificación de clase</h1>
        <button
          onClick={() => navigate(`/teacher/cs/${currentLessonPlan.course_subject_id}`)}
          className="cursor-pointer hover:opacity-70"
        >
          <X className="w-6 h-6 text-[#10182B]" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Sidebar - Chat */}
        <div className="w-80 flex flex-col">
          <ChatBot
            messages={teacherChatHistory}
            onSendMessage={handleChatMessage}
            isGenerating={isGenerating}
            placeholder="Escribí tu mensaje para Alizia..."
            welcomeMessage={{
              title: 'Plan creado',
              content: 'Si necesitás realizar algún cambio, podés escribirme y te ayudaremos.',
            }}
          />
        </div>

        {/* Center - AI Generated Content */}
        <div className="flex-1 flex flex-col activity-card-bg rounded-2xl overflow-hidden">
          <div className="h-px bg-gray-200/50" />
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Momentos de la clase */}
            <div className="space-y-4">
              <h3 className="headline-1-bold text-[#10182B]">Momentos de la clase</h3>
              <div className="space-y-4">
                {momentTypes.map((mt) => {
                  const activityNames = getActivityNames(mt.key);
                  const moments = currentLessonPlan.moments as any;
                  const generatedContent = moments?.[mt.key]?.generatedContent || '';

                  return (
                    <div key={mt.key} className="activity-card-bg rounded-2xl p-4 space-y-3">
                      <h4 className="body-1-medium text-secondary-foreground">{mt.name}</h4>
                      {activityNames.length > 0 && (
                        <div>
                          <p className="body-2-medium text-[#10182B] mb-2">Estrategias didácticas:</p>
                          <div className="flex flex-wrap gap-2">
                            {activityNames.map((name: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {isGenerating && !generatedContent ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                          <p className="body-2-regular text-[#47566C]">Generando contenido con IA...</p>
                        </div>
                      ) : generatedContent ? (
                        <div>
                          <p className="body-2-medium text-[#10182B] mb-2">Contenido generado:</p>
                          <p className="body-2-regular text-[#47566C] leading-relaxed whitespace-pre-wrap">
                            {generatedContent}
                          </p>
                        </div>
                      ) : (
                        <p className="body-2-regular text-[#47566C]/60 italic">Generando contenido con IA...</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
