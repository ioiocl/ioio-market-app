import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../api/services';
import useStore from '../store/useStore';

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authService.login(formData.email, formData.password);
      setUser(res.data.user, res.data.token);
      
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="cyber-card rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center neon-text">{t('auth.login')}</h1>

        {error && (
          <div className="mb-4 p-4 bg-cyber-pink bg-opacity-20 border border-cyber-pink rounded text-cyber-pink">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="cyber-button w-full"
          >
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="text-cyber-blue hover:text-cyber-pink transition-colors">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
