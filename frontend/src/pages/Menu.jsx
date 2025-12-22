import { useTranslation } from 'react-i18next';

function Menu() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text text-center">{t('nav.menu')}</h1>
      <div className="flex justify-center">
        <div className="cyber-card rounded-lg p-4 max-w-4xl w-full">
          <img 
            src="/menu.jpg" 
            alt="Menu" 
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default Menu;
