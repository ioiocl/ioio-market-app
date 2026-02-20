import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { useActivitiesStore } from '../store/activitiesStore';

export default function ActivitiesSection() {
  const { t } = useTranslation();
  const { activities, fetchActivities } = useActivitiesStore();

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <section id="activities" className="py-20 bg-white">
      <div className="container">
        <h2 className="text-4xl font-bold text-center mb-12">{t('activities.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div key={activity.id} className="card">
              <img
                src={activity.image_url}
                alt={activity.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3">{activity.title}</h3>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                
                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{activity.duration}</span>
                </div>
                
                <button className="btn btn-secondary w-full">
                  {t('activities.learnMore')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
