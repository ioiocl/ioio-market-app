import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Menu, X, Globe, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import useStore from '../../store/useStore';

function Header() {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, cart, logout, setLanguage } = useStore();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-cyber-dark border-b-2 border-cyber-blue sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="IOIO" className="h-12 w-12" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-cyber-blue transition-colors">
              {t('nav.home')}
            </Link>
            {/* Hidden for production - Products, Events, Experiments */}
            {/* <Link to="/products" className="hover:text-cyber-blue transition-colors">
              {t('nav.products')}
            </Link>
            <Link to="/events" className="hover:text-cyber-blue transition-colors">
              {t('nav.events')}
            </Link>
            <Link to="/experiments" className="hover:text-cyber-blue transition-colors">
              {t('nav.experiments')}
            </Link> */}
            <Link to="/about" className="hover:text-cyber-blue transition-colors">
              {t('nav.about')}
            </Link>
            <Link to="/menu" className="hover:text-cyber-blue transition-colors">
              {t('nav.menu')}
            </Link>
            <Link to="/contact" className="hover:text-cyber-blue transition-colors">
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-cyber-gray rounded-lg transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-5 h-5" />
              <span className="ml-1 text-sm">{i18n.language.toUpperCase()}</span>
            </button>

            {/* Cart - Hidden for production */}
            {/* <Link
              to="/cart"
              className="relative p-2 hover:bg-cyber-gray rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyber-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.items.length}
                </span>
              )}
            </Link> */}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-cyber-purple hover:bg-opacity-80 rounded transition-colors"
                  >
                    {t('nav.admin')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-cyber-gray rounded-lg transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-cyber-blue hover:bg-opacity-80 rounded transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-cyber-gray rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-cyber-gray">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="hover:text-cyber-blue transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              {/* Hidden for production - Products, Events, Experiments */}
              {/* <Link
                to="/products"
                className="hover:text-cyber-blue transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.products')}
              </Link>
              <Link
                to="/events"
                className="hover:text-cyber-blue transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.events')}
              </Link>
              <Link
                to="/experiments"
                className="hover:text-cyber-blue transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.experiments')}
              </Link> */}
              <Link
                to="/about"
                className="hover:text-cyber-blue transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/menu"
                className="hover:text-cyber-blue transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.menu')}
              </Link>
              <Link
                to="/contact"
                className="hover:text-cyber-blue transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.contact')}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
