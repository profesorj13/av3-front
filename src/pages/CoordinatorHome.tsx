import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { api } from '@/services/api';
import type { Course } from '@/types';

export function CoordinatorHome() {
  const navigate = useNavigate();
  const { currentUser, courses, setCourses } = useStore();

  const firstName = currentUser?.name.split(' ')[0] || '';

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await api.courses.getAll();
      setCourses(coursesData as Course[]);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-full px-6 py-12">
      <div className="flex flex-col items-center mb-16 mt-8">
        <div className="w-48 h-48 rounded-full mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-200 to-indigo-500 rounded-full blur-xl opacity-80"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-300 to-indigo-600 rounded-full"></div>
        </div>

        <h1 className="text-4xl font-normal text-indigo-600 mb-2">Hola {firstName},</h1>
        <p className="text-slate-700 text-lg">¿En qué curso trabajamos hoy?</p>
      </div>

      <div className="w-full max-w-5xl">
        <h2 className="text-xl font-semibold text-slate-700 mb-6 px-4">Mis cursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="cursor-pointer hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm border-slate-200 p-6 group"
              onClick={() => navigate(`/curso/${course.id}`)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-xs">
                    Turno mañana
                  </Badge>
                  <Badge variant="secondary" className="bg-teal-500 text-white hover:bg-teal-500 text-xs">
                    Activo
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-1">{course.name}</h3>
                <p className="text-sm text-slate-500 mb-4">Nivel secundario</p>

                <div className="mt-auto flex justify-end">
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
