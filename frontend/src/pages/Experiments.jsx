import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { experimentService } from '../api/services';
import HtmlContent from '../components/HtmlContent';

function Experiments() {
  const { t } = useTranslation();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      const res = await experimentService.getAll();
      setExperiments(res.data.experiments);
      setLoading(false);
    } catch (error) {
      console.error('Error loading experiments:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl neon-text loading">{t('common.loading')}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 neon-text">{t('experiments.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {experiments.map((experiment) => (
          <Link key={experiment.id} to={`/experiments/${experiment.id}`} className="cyber-card rounded-lg overflow-hidden group">
            <div className="relative h-64 overflow-hidden">
              <img src={experiment.imageUrl} alt={experiment.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{experiment.title}</h3>
              <div className="text-gray-400 line-clamp-3">
                <HtmlContent html={experiment.description} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Experiments;
