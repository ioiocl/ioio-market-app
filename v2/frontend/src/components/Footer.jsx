import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="IOIO Logo" className="h-10 w-10" />
            <div>
              <h3 className="font-bold text-lg">{t('header.title')}</h3>
              <p className="text-gray-400 text-sm">© 2026 IOIO. {t('footer.rights')}.</p>
            </div>
          </div>
          
          <a
            href="/admin"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            {t('footer.admin')}
          </a>
        </div>
      </div>
    </footer>
  );
}
