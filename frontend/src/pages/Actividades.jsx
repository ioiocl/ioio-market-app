import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { activityService } from '../api/services';
import { Link } from 'react-router-dom';

function Actividades() {
  const { i18n } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await activityService.getAll({ active: true });
      setActivities(res.data.activities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-2xl neon-text">Cargando...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4 neon-text">Actividades</h1>
        <p className="text-gray-400">No hay actividades disponibles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-64 overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/20 to-cyber-black" />
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold neon-text text-center">Actividades</h1>
        </div>
      </section>

      {/* Activities Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div key={activity.id} className="cyber-card rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              {activity.imageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={activity.imageUrl}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-cyber-blue">{activity.title}</h3>
                <div 
                  className="text-gray-300 mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: activity.description }}
                />
                {activity.content && (
                  <div 
                    className="prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: activity.content }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Actividades;
