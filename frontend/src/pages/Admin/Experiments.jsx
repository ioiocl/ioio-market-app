import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { experimentService } from '../../api/services';
import RichTextEditor from '../../components/RichTextEditor';

function AdminExperiments() {
  const { t } = useTranslation();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExperiment, setEditingExperiment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleEs: '',
    descriptionEn: '',
    descriptionEs: '',
    contentEn: '',
    contentEs: '',
    imageUrl: '',
    isActive: true
  });

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
      titleEn: experiment.title_en || experiment.title,
      titleEs: experiment.title_es || experiment.title,
      descriptionEn: experiment.description_en || experiment.description,
      descriptionEs: experiment.description_es || experiment.description,
      contentEn: experiment.content_en || experiment.content || '',
      contentEs: experiment.content_es || experiment.content || '',
      imageUrl: experiment.image_url || experiment.imageUrl || '',
      isActive: experiment.is_active !== false
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingExperiment) {
        await experimentService.update(editingExperiment.id, formData);
      } else {
        await experimentService.create(formData);
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
      titleEn: '',
      titleEs: '',
      descriptionEn: '',
      descriptionEs: '',
      contentEn: '',
      contentEs: '',
      imageUrl: '',
      isActive: true
    });
    setShowModal(true);
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
          <div className="cyber-card rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyber-blue">
                {editingExperiment ? 'Edit Experiment' : 'New Experiment'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title (English)</label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Title (Spanish)</label>
                <input
                  type="text"
                  value={formData.titleEs}
                  onChange={(e) => setFormData({ ...formData, titleEs: e.target.value })}
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description (English)</label>
                <RichTextEditor
                  value={formData.descriptionEn}
                  onChange={(value) => setFormData({ ...formData, descriptionEn: value })}
                  placeholder="Enter description in English..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description (Spanish)</label>
                <RichTextEditor
                  value={formData.descriptionEs}
                  onChange={(value) => setFormData({ ...formData, descriptionEs: value })}
                  placeholder="Enter description in Spanish..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Content (English)</label>
                <RichTextEditor
                  value={formData.contentEn}
                  onChange={(value) => setFormData({ ...formData, contentEn: value })}
                  placeholder="Enter full content in English..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Content (Spanish)</label>
                <RichTextEditor
                  value={formData.contentEs}
                  onChange={(value) => setFormData({ ...formData, contentEs: value })}
                  placeholder="Enter full content in Spanish..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-semibold">Active</label>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button onClick={handleSave} className="cyber-button flex-1">
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
