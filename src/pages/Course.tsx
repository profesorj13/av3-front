import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Calendar, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
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

  const { courses } = useStore();
  const getUserArea = useStore((state) => state.getUserArea());

  const [students, setStudents] = useState<Student[]>([]);
  const [areaDocs, setAreaDocs] = useState<CoordinationDocument[]>([]);

  const course = courses.find((c) => c.id === courseId);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const [studentsData, allDocs] = await Promise.all([api.courses.getStudents(courseId), api.documents.getAll()]);

      setStudents(studentsData as Student[]);

      if (getUserArea) {
        const filtered = (allDocs as CoordinationDocument[]).filter((d) => d.area_id === getUserArea.id);
        setAreaDocs(filtered);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
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

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = () => {
    return 'bg-violet-200 text-violet-700';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <h1 className="large-title-2-bold text-foreground mb-6">Curso {course.name}</h1>

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="about">Detalle del curso</TabsTrigger>
          <TabsTrigger value="classes">Doc. de coordenadas</TabsTrigger>
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
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getAvatarColor()}`}
                          >
                            {getInitials(student.name)}
                          </div>
                          <div>
                            <p className="body-2-medium text-foreground">{student.name}</p>
                            <p className="callout-regular text-muted-foreground">
                              {student.name.toLowerCase().replace(/\s+/g, '')}@Gmail.Com
                            </p>
                          </div>
                        </div>
                        <button className="text-muted-foreground hover:text-foreground">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                            <circle cx="8" cy="3" r="1.5" />
                            <circle cx="8" cy="8" r="1.5" />
                            <circle cx="8" cy="13" r="1.5" />
                          </svg>
                        </button>
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
                      <p className="callout-bold text-foreground mb-1">INSTITUCIÓN</p>
                      <p className="body-2-regular text-foreground">IFD. N°13</p>
                    </div>

                    <div className="pb-4 border-b border-slate-200">
                      <p className="callout-bold text-foreground mb-1">ÁREA</p>
                      <p className="body-2-regular text-foreground">{getUserArea?.name || 'N/A'}</p>
                    </div>

                    <div className="pb-4 border-b border-slate-200">
                      <p className="callout-bold text-foreground mb-1">NIVEL</p>
                      <p className="body-2-regular text-foreground">Secundaria</p>
                    </div>

                    <div className="pb-4 border-b border-slate-200">
                      <p className="callout-bold text-foreground mb-1">TURNO</p>
                      <p className="body-2-regular text-foreground">Mañana</p>
                    </div>

                    <div>
                      <p className="callout-bold text-foreground mb-1">CICLO LECTIVO</p>
                      <p className="body-2-regular text-foreground">2026</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Grilla de horarios Card */}
              <div>
                <Card className="bg-white/50 backdrop-blur-sm border-slate-200 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all group">
                  <div className="flex items-center justify-between">
                    <h2 className=" text-foreground flex gap-2">
                      <Calendar className="w-5 h-5 text-foreground" />
                      Grilla de horarios
                    </h2>
                    <ArrowRight className="w-5 h-5 text-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          {areaDocs.length > 0 && (
            <>
              <div>
                <h3 className="headline-1-bold text-foreground mb-4">Documentos existentes</h3>
                <div className="space-y-3">
                  {areaDocs.map((doc) => (
                    <Card
                      key={doc.id}
                      className="bg-white/50 backdrop-blur-sm border-slate-200 rounded-3xl cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => navigate(`/doc/${doc.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Badge
                              className={
                                doc.status === 'published'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                  : doc.status === 'archived'
                                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                              }
                            >
                              {doc.status === 'published'
                                ? 'Publicado'
                                : doc.status === 'archived'
                                  ? 'Archivado'
                                  : 'Borrador'}
                            </Badge>
                            <h4 className="headline-1-bold text-foreground">{doc.name}</h4>
                            <p className="body-2-regular text-muted-foreground">
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
              </div>
              <div className="h-px bg-slate-200" />
            </>
          )}

          <div>
            <h3 className="headline-1-bold text-foreground mb-4">Crear nuevo documento</h3>
            <Card className="bg-white/50 backdrop-blur-sm border-slate-200 rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Nuevo</Badge>
                    <h4 className="headline-1-bold text-foreground">Documento de coordinación</h4>
                    <p className="body-2-regular text-muted-foreground">
                      Crear documento para el área {getUserArea?.name || ''}
                    </p>
                  </div>
                  <Button onClick={handleStartWizard}>Crear</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
