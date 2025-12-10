import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Loader2 } from 'lucide-react';
import { eventService, uploadService } from '../../api/services';
import RichTextEditor from '../../components/RichTextEditor';

function AdminEvents() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titleEs: '',
    descriptionEs: '',
    eventDate: '',
    location: '',
    imageUrl: '',
    isActive: true
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await eventService.getAll({ active: false });
      setEvents(res.data.events);
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      titleEs: event.title_es || event.title,
      descriptionEs: event.description_es || event.description,
      eventDate: event.event_date ? event.event_date.split('T')[0] : '',
      location: event.location || '',
      imageUrl: event.image_url || event.imageUrl || '',
      isActive: event.is_active !== false
    });
    setImagePreview(event.image_url || event.imageUrl || null);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Send both English and Spanish fields
      const dataToSend = {
        ...formData,
        titleEn: formData.titleEs,
        descriptionEn: formData.descriptionEs
      };
      
      if (editingEvent) {
        await eventService.update(editingEvent.id, dataToSend);
      } else {
        await eventService.create(dataToSend);
      }
      setShowModal(false);
      setEditingEvent(null);
      await loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventService.delete(id);
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  const handleNew = () => {
    setEditingEvent(null);
    setFormData({
      titleEs: '',
      descriptionEs: '',
      eventDate: '',
      location: '',
      imageUrl: '',
      isActive: true
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file, 'events');
      setFormData({ ...formData, imageUrl: res.data.imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error subiendo imagen: ' + (error.response?.data?.error?.message || error.message));
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl neon-text loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold neon-text">{t('admin.events')}</h1>
        <button onClick={handleNew} className="cyber-button">{t('admin.addNew')}</button>
      </div>

      <div className="cyber-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cyber-gray">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Location</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-cyber-gray">
                <td className="px-6 py-4">{event.title}</td>
                <td className="px-6 py-4">
                  {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4">{event.location || 'N/A'}</td>
                <td className="px-6 py-4">
                  {event.isActive ? (
                    <span className="text-cyber-green">Active</span>
                  ) : (
                    <span className="text-gray-500">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleEdit(event)}
                    className="text-cyber-blue hover:text-cyber-pink mr-4"
                  >
                    {t('admin.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-cyber-pink hover:text-cyber-yellow"
                  >
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cyber-card rounded-lg max-w-2xl w-full h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-cyber-gray">
              <h2 className="text-2xl font-bold text-cyber-blue">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.titleEs}
                    onChange={(e) => setFormData({ ...formData, titleEs: e.target.value })}
                    className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Descripción</label>
                  <RichTextEditor
                    value={formData.descriptionEs}
                    onChange={(value) => setFormData({ ...formData, descriptionEs: value })}
                    placeholder="Ingrese la descripción..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Fecha del Evento</label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Ubicación</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Imagen</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-cyber-blue text-black rounded cursor-pointer hover:bg-opacity-80 transition-colors">
                      {uploading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</>
                      ) : (
                        <><Upload className="w-5 h-5" /> Subir Imagen</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                    )}
                  </div>
                  {formData.imageUrl && (
                    <p className="text-xs text-gray-400 mt-2 truncate">{formData.imageUrl}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-semibold">Activo</label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 p-6 border-t border-cyber-gray bg-cyber-dark">
              <button onClick={handleSave} className="cyber-button flex-1" disabled={uploading}>
                {t('admin.save')}
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-cyber-gray hover:bg-opacity-80 rounded transition-colors"
              >
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEvents;
