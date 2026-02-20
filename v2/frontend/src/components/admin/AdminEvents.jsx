import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2 } from 'lucide-react';
import { useEventsStore } from '../../store/eventsStore';

export default function AdminEvents() {
  const { t } = useTranslation();
  const { events, fetchEvents, addEvent, updateEvent, deleteEvent } = useEventsStore();
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    date: '',
    location: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateEvent(editing.id, formData);
      setEditing(null);
    } else {
      await addEvent(formData);
    }
    setFormData({ title: '', description: '', image_url: '', date: '', location: '' });
  };

  const handleEdit = (event) => {
    setEditing(event);
    setFormData({ ...event, date: event.date.split('T')[0] });
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este evento?')) {
      await deleteEvent(id);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4">{editing ? t('admin.edit') : t('admin.add')} Evento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="URL de imagen"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="px-4 py-2 border rounded-lg md:col-span-2"
            rows="3"
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Ubicación"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn btn-primary">
            {editing ? t('admin.save') : t('admin.add')}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormData({ title: '', description: '', image_url: '', date: '', location: '' });
              }}
              className="btn btn-secondary"
            >
              {t('admin.cancel')}
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
            <img src={event.image_url} alt={event.title} className="w-24 h-16 object-cover rounded" />
            <div className="flex-1">
              <h4 className="font-bold">{event.title}</h4>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()} - {event.location}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(event)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(event.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
