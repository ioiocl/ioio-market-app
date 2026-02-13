import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Loader2 } from 'lucide-react';
import { activityService, uploadService } from '../../api/services';
import RichTextEditor from '../../components/RichTextEditor';

function AdminActivities() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titleEs: '',
    descriptionEs: '',
    contentEs: '',
    imageUrl: '',
    isActive: true
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await activityService.getAll({ active: false });
      setActivities(res.data.activities);
      setLoading(false);
    } catch (error) {
      console.error('Error loading activities:', error);
      setLoading(false);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      titleEs: activity.title_es || activity.title,
      descriptionEs: activity.description_es || activity.description,
      contentEs: activity.content_es || activity.content || '',
      imageUrl: activity.image_url || activity.imageUrl || '',
      isActive: activity.is_active !== false
    });
    setImagePreview(activity.image_url || activity.imageUrl || null);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        ...formData,
        titleEn: formData.titleEs,
        descriptionEn: formData.descriptionEs,
        contentEn: formData.contentEs
      };
      
      if (editingActivity) {
        await activityService.update(editingActivity.id, dataToSend);
      } else {
        await activityService.create(dataToSend);
      }
      setShowModal(false);
      setEditingActivity(null);
      await loadActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Error saving activity: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;
    
    try {
      await activityService.delete(id);
      await loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Error deleting activity');
    }
  };

  const handleNew = () => {
    setEditingActivity(null);
    setFormData({
      titleEs: '',
      descriptionEs: '',
      contentEs: '',
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
      const res = await uploadService.uploadImage(file, 'activities');
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
        <h1 className="text-4xl font-bold neon-text">Actividades</h1>
        <button onClick={handleNew} className="cyber-button">Agregar Nueva</button>
      </div>

      <div className="cyber-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cyber-gray">
            <tr>
              <th className="px-6 py-3 text-left">Título</th>
              <th className="px-6 py-3 text-left">Descripción</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-t border-cyber-gray">
                <td className="px-6 py-4">{activity.title}</td>
                <td className="px-6 py-4">
                  <div className="max-w-md truncate" dangerouslySetInnerHTML={{ __html: activity.description }}></div>
                </td>
                <td className="px-6 py-4">
                  {activity.isActive ? (
                    <span className="text-cyber-green">Activa</span>
                  ) : (
                    <span className="text-gray-500">Inactiva</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleEdit(activity)}
                    className="text-cyber-blue hover:text-cyber-pink mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-cyber-pink hover:text-cyber-yellow"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cyber-card rounded-lg max-w-2xl w-full h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-cyber-gray">
              <h2 className="text-2xl font-bold text-cyber-blue">
                {editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
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

                <div>
                  <label className="block text-sm font-semibold mb-2">Contenido</label>
                  <RichTextEditor
                    value={formData.contentEs}
                    onChange={(value) => setFormData({ ...formData, contentEs: value })}
                    placeholder="Ingrese el contenido completo..."
                  />
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
                  <label className="text-sm font-semibold">Activa</label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 p-6 border-t border-cyber-gray bg-cyber-dark">
              <button onClick={handleSave} className="cyber-button flex-1" disabled={uploading}>
                Guardar
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-cyber-gray hover:bg-opacity-80 rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminActivities;
