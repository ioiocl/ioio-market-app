import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, LogOut } from 'lucide-react';
import AdminSlider from '../components/admin/AdminSlider';
import AdminEvents from '../components/admin/AdminEvents';
import AdminActivities from '../components/admin/AdminActivities';
import AdminProducts from '../components/admin/AdminProducts';

export default function AdminPage() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('slider');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">{t('admin.title')}</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('admin.password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="btn btn-primary w-full">
              {t('admin.login')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">{t('admin.title')}</h1>
            <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('slider')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'slider' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('admin.slider')}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'events' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('admin.events')}
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'activities' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('admin.activities')}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'products' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('admin.products')}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'slider' && <AdminSlider />}
            {activeTab === 'events' && <AdminEvents />}
            {activeTab === 'activities' && <AdminActivities />}
            {activeTab === 'products' && <AdminProducts />}
          </div>
        </div>
      </div>
    </div>
  );
}
