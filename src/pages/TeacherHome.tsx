import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import type { CourseSubject } from '@/types';

export function TeacherHome() {
  const navigate = useNavigate();
  const { currentUser, courseSubjects, setTeacherCourses } = useStore();

  const firstName = currentUser?.name.split(' ')[0] || '';
  const teacherId = currentUser?.id;

  useEffect(() => {
    loadTeacherCourses();
  }, [teacherId]);

  const loadTeacherCourses = async () => {
    try {
      const allCourseSubjects = await api.courseSubjects.getAll();
      const teacherCourseSubjects = (allCourseSubjects as CourseSubject[]).filter((cs) => cs.teacher_id === teacherId);
      setTeacherCourses(teacherCourseSubjects);
    } catch (error) {
      console.error('Error loading teacher courses:', error);
    }
  };

  const teacherCourses = courseSubjects.filter((cs) => cs.teacher_id === teacherId);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold">
          {firstName.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hola {firstName},</h1>
          <p className="text-slate-600">¿en qué materia trabajamos hoy?</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Mis Materias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherCourses.map((cs) => (
            <Card
              key={cs.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/teacher/cs/${cs.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{cs.course_name}</Badge>
                </div>
                <CardTitle className="text-lg">{cs.subject_name}</CardTitle>
                <CardDescription className="text-sm">Click para ver detalles y planificar clases</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {teacherCourses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No tienes materias asignadas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
