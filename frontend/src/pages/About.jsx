import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { companyInfoService } from '../api/services';

function About() {
  const { t } = useTranslation();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      const res = await companyInfoService.get();
      setCompanyInfo(res.data.companyInfo);
      setLoading(false);
    } catch (error) {
      console.error('Error loading company info:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl neon-text loading">{t('common.loading')}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text">{t('nav.about')}</h1>
      <div className="cyber-card rounded-lg p-8">
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 leading-relaxed">{companyInfo?.about || 'IOIO is a cyberpunk-inspired fashion and makerspace brand.'}</p>
        </div>
      </div>
    </div>
  );
}

export default About;
