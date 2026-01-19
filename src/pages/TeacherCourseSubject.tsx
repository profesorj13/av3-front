import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {cs.course_name} - {cs.subject_name}
      </Button>

      <Tabs defaultValue="about" className="w-full">
        <TabsList>
          <TabsTrigger value="about">Sobre el curso</TabsTrigger>
          <TabsTrigger value="classes">Clases</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Alumnos</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay alumnos registrados</p>
                ) : (
                  <ul className="space-y-2">
                    {students.map((s) => (
                      <li key={s.id} className="text-sm">
                        {s.name}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    <strong>Curso:</strong> {cs.course_name}
                  </p>
                  <p className="text-sm">
                    <strong>Materia:</strong> {cs.subject_name}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grilla de horarios</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(schedule).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay horarios definidos</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Hora</th>
                            {days.map((d) => (
                              <th key={d} className="text-left p-2">
                                {dayNames[d]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2">08:00-09:30</td>
                            {days.map((d) => (
                              <td key={d} className="p-2">
                                {schedule[d]?.[0]?.subject || '-'}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">09:45-11:15</td>
                            {days.map((d) => (
                              <td key={d} className="p-2">
                                {schedule[d]?.[1]?.subject || '-'}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          {!coordStatus?.has_published_document ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">Documento de coordinación no disponible</h3>
                <p className="text-muted-foreground mb-2">
                  El coordinador aún no ha publicado el documento de coordinación para esta materia.
                </p>
                <p className="text-sm text-muted-foreground">Contacta al coordinador para más información.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Plan de clases</h3>
                <p className="text-sm text-muted-foreground">
                  Documento: {coordStatus.document_name} | Coordinador: {coordStatus.coordinator_name || 'N/A'}
                </p>
              </div>

              <div className="space-y-3">
                {(coordStatus.class_plan || []).length === 0 ? (
                  <p className="text-muted-foreground">No hay clases definidas en el documento de coordinación</p>
                ) : (
                  (coordStatus.class_plan || []).map((c: any) => {
                    const existingPlan = lessonPlanMap[c.class_number];
                    const statusClass = existingPlan
                      ? existingPlan.status === 'planned'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800';
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
                      <Card key={c.class_number}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Clase {c.class_number}</Badge>
                                <Badge className={statusClass}>{statusLabel}</Badge>
                              </div>
                              <h4 className="font-semibold mb-2">{c.title || 'Sin título'}</h4>
                              <div className="flex flex-wrap gap-1">
                                {categoryNames.map((name: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
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
