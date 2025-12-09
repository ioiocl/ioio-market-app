import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Github } from 'lucide-react';

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cyber-dark border-t-2 border-cyber-blue mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="/logo.png" alt="IOIO" className="h-10 w-10" />
              <span className="text-xl font-bold neon-text">IOIO</span>
            </div>
            <p className="text-gray-400 text-sm">
              Cyberpunk Fashion & Makerspace
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyber-blue">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-cyber-blue transition-colors">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-400 hover:text-cyber-blue transition-colors">
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/experiments" className="text-gray-400 hover:text-cyber-blue transition-colors">
                  {t('nav.experiments')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyber-blue">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-cyber-blue transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-cyber-blue transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyber-blue">{t('footer.followUs')}</h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/ioio_official"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-cyber-gray hover:bg-cyber-blue rounded-lg transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/ioio_tech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-cyber-gray hover:bg-cyber-blue rounded-lg transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/ioio.official"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-cyber-gray hover:bg-cyber-blue rounded-lg transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/ioio-labs"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-cyber-gray hover:bg-cyber-blue rounded-lg transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-cyber-gray mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© {currentYear} IOIO. {t('footer.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
