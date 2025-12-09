import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { bannerService } from '../../api/services';

function AdminBanners() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await bannerService.delete(id);
      await loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Error deleting banner');
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
        <button className="cyber-button">{t('admin.addNew')}</button>
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
                  Order: {banner.displayOrder}
                </span>
                <span className={banner.isActive ? 'text-cyber-green' : 'text-gray-500'}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-cyber-blue hover:bg-opacity-80 rounded transition-colors">
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
    </div>
  );
}

export default AdminBanners;
