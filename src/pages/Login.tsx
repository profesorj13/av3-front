import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import type { User, Area, CourseSubject } from '@/types';

export function Login() {
  const navigate = useNavigate();
  const { users, areas, courseSubjects, setUsers, setAreas, setCourseSubjects, setCurrentUser } = useStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, areasData, courseSubjectsData] = await Promise.all([
        api.users.getAll(),
        api.areas.getAll(),
        api.courseSubjects.getAll(),
      ]);
      setUsers(usersData as User[]);
      setAreas(areasData as Area[]);
      setCourseSubjects(courseSubjectsData as CourseSubject[]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getUserRoleLabel = (userId: number) => {
    const area = areas.find((a) => a.coordinator_id === userId);
    if (area) return `Coordinador/a de ${area.name}`;

    const teacherSubjects = courseSubjects.filter((cs) => cs.teacher_id === userId);
    if (teacherSubjects.length > 0) {
      const subjectNames = [...new Set(teacherSubjects.map((cs) => cs.subject_name))];
      return `Docente de ${subjectNames.join(', ')}`;
    }

    return 'Sin rol asignado';
  };

  const handleSelectUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Bienvenido</h1>
          <p className="text-slate-600">Selecciona tu usuario para continuar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card
              key={user.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSelectUser(user.id)}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {user.name.charAt(0)}
                </div>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <CardDescription className="text-sm">{getUserRoleLabel(user.id)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
