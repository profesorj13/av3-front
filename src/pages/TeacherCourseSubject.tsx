import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Calendar, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';

interface Student {
  id: number;
  name: string;
}

interface CoordinationStatus {
  has_published_document: boolean;
  document_name?: string;
  coordinator_name?: string;
  class_plan?: any[];
}

export function TeacherCourseSubject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const csId = parseInt(id || '0');

  const { courses, courseSubjects, categories, setCoordinationStatus, setLessonPlans } = useStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [coordStatus, setCoordStatus] = useState<CoordinationStatus | null>(null);
  const [lessonPlans, setLocalLessonPlans] = useState<any[]>([]);

  const cs = courseSubjects.find((c) => c.id === csId);
  const course = cs ? courses.find((c) => c.id === cs.course_id) : null;

  useEffect(() => {
    loadData();
  }, [csId]);

  const loadData = async () => {
    if (!cs) return;

    try {
      const [studentsData, coordStatusData, lessonPlansData] = await Promise.all([
        api.courses.getStudents(cs.course_id),
        api.courseSubjects.getCoordinationStatus(csId),
        api.lessonPlans.getByCourseSubject(csId),
      ]);

      setStudents(studentsData as Student[]);
      setCoordStatus(coordStatusData as CoordinationStatus);
      setLocalLessonPlans(lessonPlansData as any[]);
      setCoordinationStatus(coordStatusData);
      setLessonPlans(lessonPlansData as any[]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleStartPlanWizard = (classNumber: number, title: string, categoryIds: number[], objective: string) => {
    navigate(`/teacher/planificar/${csId}/${classNumber}`, {
      state: { title, categoryIds, objective },
    });
  };

  if (!cs || !course) {
    return <div>Curso-materia no encontrado</div>;
  }

  const schedule = course.schedule || {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
  };

  const lessonPlanMap: Record<number, any> = {};
  lessonPlans.forEach((lp) => {
    lessonPlanMap[lp.class_number] = lp;
  });

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="large-title-2-bold text-foreground mb-6">
        {cs.course_name} - {cs.subject_name}
      </h1>

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="about">Detalle del curso</TabsTrigger>
          <TabsTrigger value="classes">Mis clases</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alumnos Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-foreground" />
                <h2 className="headline-1-bold text-foreground">Alumnos</h2>
                <span className="callout-regular text-muted-foreground">({students.length})</span>
              </div>

              <Card className="bg-white/50 backdrop-blur-sm border-slate-200 rounded-3xl p-6">
                <div className="space-y-2">
                  {students.length === 0 ? (
                    <p className="body-2-regular text-muted-foreground">No hay alumnos registrados</p>
                  ) : (
                    students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold bg-violet-200 text-violet-700">
                            {getInitials(student.name)}
                          </div>
                          <div>
                            <p className="body-2-medium text-foreground">{student.name}</p>
                            <p className="callout-regular text-muted-foreground">
                              {student.name.toLowerCase().replace(/\s+/g, '')}@Gmail.Com
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Sobre el curso Section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-foreground" />
                  <h2 className="headline-1-bold text-foreground">Sobre el curso</h2>
                </div>

                <Card className="bg-white/50 backdrop-blur-sm border-slate-200 rounded-3xl p-6">
                  <div className="space-y-4">
                    <div className="pb-4 border-b border-slate-200">
                      <p className="callout-bold text-foreground mb-1">CURSO</p>
                      <p className="body-2-regular text-foreground">{cs.course_name}</p>
                    </div>

                    <div>
                      <p className="callout-bold text-foreground mb-1">MATERIA</p>
                      <p className="body-2-regular text-foreground">{cs.subject_name}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Grilla de horarios Card */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-foreground" />
                  <h2 className="headline-1-bold text-foreground">Grilla de horarios</h2>
                </div>

                <Card className="bg-white/50 backdrop-blur-sm border-slate-200 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="body-2-medium text-foreground">Ver horarios del curso</span>
                    <ArrowRight className="w-5 h-5 text-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          {!coordStatus?.has_published_document ? (
            <Card className="bg-white/50 backdrop-blur-sm border-slate-200 rounded-3xl">
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="headline-1-bold text-foreground mb-2">Documento de coordinación no disponible</h3>
                <p className="body-1-regular text-muted-foreground mb-2">
                  El coordinador aún no ha publicado el documento de coordinación para esta materia.
                </p>
                <p className="body-2-regular text-muted-foreground">Contacta al coordinador para más información.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div>
                <h3 className="headline-1-bold text-foreground mb-2">Plan de clases</h3>
                <p className="body-2-regular text-muted-foreground">
                  Documento: {coordStatus.document_name} | Coordinador: {coordStatus.coordinator_name || 'N/A'}
                </p>
              </div>

              <div className="space-y-3">
                {(coordStatus.class_plan || []).length === 0 ? (
                  <p className="body-1-regular text-muted-foreground">
                    No hay clases definidas en el documento de coordinación
                  </p>
                ) : (
                  (coordStatus.class_plan || []).map((c: any) => {
                    const existingPlan = lessonPlanMap[c.class_number];
                    const statusClass = existingPlan
                      ? existingPlan.status === 'planned'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-100';
                    const statusLabel = existingPlan
                      ? existingPlan.status === 'planned'
                        ? 'Planificada'
                        : 'En progreso'
                      : 'Sin planificar';

                    const categoryNames = (c.category_ids || []).map((catId: number) => {
                      const cat = categories.find((cat) => cat.id === catId);
                      return cat ? cat.name : `Cat ${catId}`;
                    });

                    return (
                      <Card key={c.class_number} className="bg-white/50 backdrop-blur-sm border-slate-200 rounded-3xl">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="rounded-xl">
                                  Clase {c.class_number}
                                </Badge>
                                <Badge className={statusClass}>{statusLabel}</Badge>
                              </div>
                              <h4 className="headline-1-bold text-foreground mb-3">{c.title || 'Sin título'}</h4>
                              <div className="flex flex-wrap gap-2">
                                {categoryNames.map((name: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="rounded-xl">
                                    {name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant={existingPlan ? 'outline' : 'default'}
                              onClick={() =>
                                existingPlan
                                  ? navigate(`/teacher/plan/${existingPlan.id}`)
                                  : handleStartPlanWizard(
                                      c.class_number,
                                      c.title || '',
                                      c.category_ids || [],
                                      c.objective || '',
                                    )
                              }
                            >
                              {existingPlan ? 'Revisar' : 'Planificar'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
