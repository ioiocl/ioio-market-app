import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Loader2 } from 'lucide-react';
import { experimentService, uploadService } from '../../api/services';
import RichTextEditor from '../../components/RichTextEditor';

function AdminExperiments() {
  const { t } = useTranslation();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExperiment, setEditingExperiment] = useState(null);
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
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      const res = await experimentService.getAll({ active: false });
      setExperiments(res.data.experiments);
      setLoading(false);
    } catch (error) {
      console.error('Error loading experiments:', error);
      setLoading(false);
    }
  };

  const handleEdit = (experiment) => {
    setEditingExperiment(experiment);
    setFormData({
      titleEs: experiment.title_es || experiment.title,
      descriptionEs: experiment.description_es || experiment.description,
      contentEs: experiment.content_es || experiment.content || '',
      imageUrl: experiment.image_url || experiment.imageUrl || '',
      isActive: experiment.is_active !== false
    });
    setImagePreview(experiment.image_url || experiment.imageUrl || null);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Send both English and Spanish fields
      const dataToSend = {
        ...formData,
        titleEn: formData.titleEs,
        descriptionEn: formData.descriptionEs,
        contentEn: formData.contentEs
      };
      
      if (editingExperiment) {
        await experimentService.update(editingExperiment.id, dataToSend);
      } else {
        await experimentService.create(dataToSend);
      }
      setShowModal(false);
      setEditingExperiment(null);
      await loadExperiments();
    } catch (error) {
      console.error('Error saving experiment:', error);
      alert('Error saving experiment: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this experiment?')) return;
    
    try {
      await experimentService.delete(id);
      await loadExperiments();
    } catch (error) {
      console.error('Error deleting experiment:', error);
      alert('Error deleting experiment');
    }
  };

  const handleNew = () => {
    setEditingExperiment(null);
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
      const res = await uploadService.uploadImage(file, 'experiments');
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
        <h1 className="text-4xl font-bold neon-text">{t('admin.experiments')}</h1>
        <button onClick={handleNew} className="cyber-button">{t('admin.addNew')}</button>
      </div>

      <div className="cyber-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cyber-gray">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiments.map((experiment) => (
              <tr key={experiment.id} className="border-t border-cyber-gray">
                <td className="px-6 py-4">{experiment.title}</td>
                <td className="px-6 py-4">
                  <div className="max-w-md truncate">{experiment.description}</div>
                </td>
                <td className="px-6 py-4">
                  {experiment.isActive ? (
                    <span className="text-cyber-green">Active</span>
                  ) : (
                    <span className="text-gray-500">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleEdit(experiment)}
                    className="text-cyber-blue hover:text-cyber-pink mr-4"
                  >
                    {t('admin.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(experiment.id)}
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
                {editingExperiment ? 'Editar Experimento' : 'Nuevo Experimento'}
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

export default AdminExperiments;
