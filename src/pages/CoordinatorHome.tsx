import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedOrb } from '@/components/ui/AnimatedOrb';
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
        <AnimatedOrb size="lg" className="mb-8" />

        <h2 className="large-title-1-regular text-primary">Hola {firstName},</h2>
        <h3 className="large-title-2-regular">¿En qué curso trabajamos hoy?</h3>
      </div>

      <div className="w-full max-w-5xl">
        <h2 className="text-xl font-semibold text-secondary-foreground mb-6 px-4">Mis cursos</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 px-4">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="cursor-pointer hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm border-slate-200 p-4 group rounded-3xl"
              onClick={() => navigate(`/curso/${course.id}`)}
            >
              <div className="flex flex-col h-full gap-4">
                {/* Header con turno y estado */}
                <div className="flex items-center justify-between">
                  <span className="body-2-regular text-foreground">Turno mañana</span>
                  <Badge
                    variant="secondary"
                    className="bg-[#01CEAA4D] text-secondary-foreground hover:bg-[#01CEAA4D] rounded-xl px-4 py-1.5"
                  >
                    Activo
                  </Badge>
                </div>

                {/* Título del curso */}
                <h3 className="large-title-2-bold text-foreground">{course.name}</h3>

                {/* Nivel */}
                <p className="body-1-regular text-muted-foreground">Nivel secundario</p>

                {/* Flecha */}
                <div className="mt-auto flex justify-end">
                  <ArrowRight className="w-8 h-8 text-secondary-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
