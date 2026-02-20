import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2 } from 'lucide-react';
import { useActivitiesStore } from '../../store/activitiesStore';

export default function AdminActivities() {
  const { t } = useTranslation();
  const { activities, fetchActivities, addActivity, updateActivity, deleteActivity } = useActivitiesStore();
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    duration: ''
  });

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateActivity(editing.id, formData);
      setEditing(null);
    } else {
      await addActivity(formData);
    }
    setFormData({ title: '', description: '', image_url: '', duration: '' });
  };

  const handleEdit = (activity) => {
    setEditing(activity);
    setFormData(activity);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta actividad?')) {
      await deleteActivity(id);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4">{editing ? t('admin.edit') : t('admin.add')} Actividad</h3>
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
            type="text"
            placeholder="Duración (ej: 2 horas)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                setFormData({ title: '', description: '', image_url: '', duration: '' });
              }}
              className="btn btn-secondary"
            >
              {t('admin.cancel')}
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
            <img src={activity.image_url} alt={activity.title} className="w-24 h-16 object-cover rounded" />
            <div className="flex-1">
              <h4 className="font-bold">{activity.title}</h4>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.duration}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(activity)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(activity.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
