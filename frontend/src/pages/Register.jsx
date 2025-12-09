import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../api/services';
import useStore from '../store/useStore';

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.register(formData);
      setUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="cyber-card rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center neon-text">{t('auth.register')}</h1>

        {error && (
          <div className="mb-4 p-4 bg-cyber-pink bg-opacity-20 border border-cyber-pink rounded text-cyber-pink">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('auth.firstName')}</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('auth.lastName')}</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">{t('auth.email')}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">{t('auth.password')}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cyber-button w-full"
          >
            {loading ? t('common.loading') : t('auth.register')}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-cyber-blue hover:text-cyber-pink transition-colors">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
