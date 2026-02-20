import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin } from 'lucide-react';
import { useEventsStore } from '../store/eventsStore';

export default function EventsSection() {
  const { t } = useTranslation();
  const { events, fetchEvents } = useEventsStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <section id="events" className="py-20 bg-gray-50">
      <div className="container">
        <h2 className="text-4xl font-bold text-center mb-12">{t('events.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="card">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>
                
                <button className="btn btn-primary w-full">
                  {t('events.register')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
