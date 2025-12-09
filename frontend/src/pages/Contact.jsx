import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { companyInfoService } from '../api/services';

function Contact() {
  const { t } = useTranslation();
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      const res = await companyInfoService.get();
      setCompanyInfo(res.data.companyInfo);
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text">{t('nav.contact')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="cyber-card rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-cyber-blue">Get in Touch</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Mail className="w-6 h-6 text-cyber-blue" />
              <span>{companyInfo?.contactEmail || 'contact@ioio.com'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="w-6 h-6 text-cyber-blue" />
              <span>{companyInfo?.contactPhone || '+1 (555) 123-4567'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="w-6 h-6 text-cyber-blue" />
              <span>{companyInfo?.address || '123 Maker Street, Tech District'}</span>
            </div>
          </div>
        </div>
        <div className="cyber-card rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-cyber-blue">Send a Message</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Name" className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink" />
            <input type="email" placeholder="Email" className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink" />
            <textarea placeholder="Message" rows="4" className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"></textarea>
            <button type="submit" className="cyber-button w-full">{t('common.submit')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
