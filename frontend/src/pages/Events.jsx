import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { eventService } from '../api/services';

function Events() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await eventService.getAll();
      setEvents(res.data.events);
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-2xl neon-text loading">{t('common.loading')}</div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text">{t('events.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <Link key={event.id} to={`/events/${event.id}`} className="cyber-card rounded-lg overflow-hidden group">
            <div className="relative h-64 overflow-hidden">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-400 mb-4 line-clamp-2">{event.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyber-blue">{event.location}</span>
                <span className="text-gray-500">{new Date(event.eventDate).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Events;
