import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin } from 'lucide-react';
import { eventService } from '../api/services';

function EventDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const res = await eventService.getById(id);
      setEvent(res.data.event);
      setLoading(false);
    } catch (error) {
      console.error('Error loading event:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl neon-text loading">{t('common.loading')}</div></div>;
  if (!event) return <div className="container mx-auto px-4 py-20 text-center"><h1 className="text-2xl text-gray-400">Event not found</h1></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="cyber-card rounded-lg overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-96 object-cover" />
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4 neon-text">{event.title}</h1>
          <div className="flex items-center space-x-6 mb-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(event.eventDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>
          </div>
          <p className="text-lg text-gray-300 leading-relaxed">{event.description}</p>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
