import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Loader2 } from 'lucide-react';
import { bannerService, uploadService } from '../../api/services';

function AdminBanners() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titleEs: '',
    linkUrl: '',
    displayOrder: 0,
    imageUrl: '',
    isActive: true
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const res = await bannerService.getAll({ active: false });
      setBanners(res.data.banners);
      setLoading(false);
    } catch (error) {
      console.error('Error loading banners:', error);
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      titleEs: banner.title_es || banner.title || '',
      linkUrl: banner.link_url || banner.linkUrl || '',
      displayOrder: banner.display_order || banner.displayOrder || 0,
      imageUrl: banner.image_url || banner.imageUrl || '',
      isActive: banner.is_active !== false
    });
    setImagePreview(banner.image_url || banner.imageUrl || null);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        ...formData,
        titleEn: formData.titleEs
      };
      
      if (editingBanner) {
        await bannerService.update(editingBanner.id, dataToSend);
      } else {
        await bannerService.create(dataToSend);
      }
      setShowModal(false);
      setEditingBanner(null);
      await loadBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Error saving banner: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;
    
    try {
      await bannerService.delete(id);
      await loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Error deleting banner');
    }
  };

  const handleNew = () => {
    setEditingBanner(null);
    setFormData({
      titleEs: '',
      linkUrl: '',
      displayOrder: banners.length + 1,
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
      const res = await uploadService.uploadImage(file, 'banners');
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
        <h1 className="text-4xl font-bold neon-text">{t('admin.banners')}</h1>
        <button onClick={handleNew} className="cyber-button">{t('admin.addNew')}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="cyber-card rounded-lg overflow-hidden">
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2">{banner.title}</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                  Orden: {banner.displayOrder}
                </span>
                <span className={banner.isActive ? 'text-cyber-green' : 'text-gray-500'}>
                  {banner.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(banner)}
                  className="flex-1 px-4 py-2 bg-cyber-blue hover:bg-opacity-80 rounded transition-colors"
                >
                  {t('admin.edit')}
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="flex-1 px-4 py-2 bg-cyber-pink hover:bg-opacity-80 rounded transition-colors"
                >
                  {t('admin.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cyber-card rounded-lg max-w-2xl w-full h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-cyber-gray">
              <h2 className="text-2xl font-bold text-cyber-blue">
                {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
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
                  <label className="block text-sm font-semibold mb-2">URL de Enlace (opcional)</label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Orden de Visualización</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
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
                      <img src={imagePreview} alt="Preview" className="w-24 h-16 object-cover rounded" />
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

export default AdminBanners;
