import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function Header() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="IOIO Logo" className="h-12 w-12" />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              {t('header.title')}
            </h1>
          </div>
          
          <nav className="flex items-center gap-6">
            <a href="#slider" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('header.nav.home')}
            </a>
            <a href="#events" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('header.nav.events')}
            </a>
            <a href="#activities" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('header.nav.activities')}
            </a>
            <a href="#shop" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('header.nav.shop')}
            </a>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="font-semibold">{i18n.language.toUpperCase()}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
