import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, ShoppingBag, Users, Image, Calendar, Beaker, FileText, Activity } from 'lucide-react';

function AdminDashboard() {
  const { t } = useTranslation();

  const menuItems = [
    { icon: Package, label: t('admin.products'), path: '/admin/products', color: 'cyber-blue' },
    { icon: ShoppingBag, label: t('admin.orders'), path: '/admin/orders', color: 'cyber-pink' },
    { icon: Image, label: t('admin.banners'), path: '/admin/banners', color: 'cyber-yellow' },
    { icon: Calendar, label: t('admin.events'), path: '/admin/events', color: 'cyber-green' },
    { icon: Beaker, label: t('admin.experiments'), path: '/admin/experiments', color: 'cyber-purple' },
    { icon: Activity, label: 'Actividades', path: '/admin/activities', color: 'cyber-pink' },
    { icon: FileText, label: 'Páginas Personalizadas', path: '/admin/pages', color: 'cyber-blue' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text">{t('admin.dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className="cyber-card rounded-lg p-8 hover:scale-105 transition-transform">
            <item.icon className={`w-12 h-12 mb-4 text-${item.color}`} />
            <h3 className="text-xl font-bold">{item.label}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
