import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import type { CoordinationDocument } from '@/types';

interface Student {
  id: number;
  name: string;
}

export function Course() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = parseInt(id || '0');

  const { courses, subjects } = useStore();
  const getUserArea = useStore((state) => state.getUserArea());

  const [students, setStudents] = useState<Student[]>([]);
  const [areaDocs, setAreaDocs] = useState<CoordinationDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const course = courses.find((c) => c.id === courseId);
  const areaSubjects = getUserArea ? subjects.filter((s) => s.area_id === getUserArea.id) : [];

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [studentsData, allDocs] = await Promise.all([api.courses.getStudents(courseId), api.documents.getAll()]);

      setStudents(studentsData as Student[]);

      if (getUserArea) {
        const filtered = (allDocs as CoordinationDocument[]).filter((d) => d.area_id === getUserArea.id);
        setAreaDocs(filtered);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDocument = async (docId: number) => {
    try {
      await api.documents.publish(docId);
      loadCourseData();
    } catch (error) {
      console.error('Error publishing document:', error);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('¿Estás seguro de que quieres borrar este documento?')) return;

    try {
      await api.documents.delete(docId);
      loadCourseData();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleStartWizard = () => {
    navigate(`/curso/${courseId}/crear`);
  };

  if (!course) {
    return <div>Curso no encontrado</div>;
  }

  const statusLabels: Record<string, string> = {
    draft: 'Borrador',
    published: 'Publicado',
    archived: 'Archivado',
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  const schedule = course.schedule || {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {course.name} - {getUserArea?.name || ''}
      </Button>

      <Tabs defaultValue="about" className="w-full">
        <TabsList>
          <TabsTrigger value="about">Sobre el curso</TabsTrigger>
          <TabsTrigger value="docs">Doc. de coordinación</TabsTrigger>
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
                  <CardTitle>Detalles del curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    <strong>Nombre:</strong> {course.name}
                  </p>
                  <p className="text-sm">
                    <strong>Área:</strong> {getUserArea?.name || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <strong>Alumnos:</strong> {students.length}
                  </p>
                  <p className="text-sm">
                    <strong>Materias:</strong> {areaSubjects.map((s) => s.name).join(', ')}
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

        <TabsContent value="docs" className="space-y-4">
          {areaDocs.length > 0 && (
            <>
              <h3 className="text-lg font-semibold">Documentos existentes</h3>
              <div className="space-y-3">
                {areaDocs.map((doc) => (
                  <Card
                    key={doc.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/doc/${doc.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <Badge className={statusColors[doc.status] || statusColors.draft}>
                            {statusLabels[doc.status] || 'Borrador'}
                          </Badge>
                          <h4 className="font-semibold">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {doc.start_date} - {doc.end_date}
                          </p>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {doc.status !== 'published' && (
                            <Button size="sm" variant="default" onClick={() => handlePublishDocument(doc.id)}>
                              Publicar
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => navigate(`/doc/${doc.id}`)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(doc.id)}>
                            Borrar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <hr className="my-6" />
            </>
          )}

          <h3 className="text-lg font-semibold">Crear nuevo documento</h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Badge>Nuevo</Badge>
                  <h4 className="font-semibold">Documento de coordinación</h4>
                  <p className="text-sm text-muted-foreground">
                    Crear documento para el área {getUserArea?.name || ''}
                  </p>
                </div>
                <Button onClick={handleStartWizard}>Crear</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
