import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { experimentService } from '../api/services';
import HtmlContent from '../components/HtmlContent';

function ExperimentDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiment();
  }, [id]);

  const loadExperiment = async () => {
    try {
      const res = await experimentService.getById(id);
      setExperiment(res.data.experiment);
      setLoading(false);
    } catch (error) {
      console.error('Error loading experiment:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl neon-text loading">{t('common.loading')}</div></div>;
  if (!experiment) return <div className="container mx-auto px-4 py-20 text-center"><h1 className="text-2xl text-gray-400">Experiment not found</h1></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="cyber-card rounded-lg overflow-hidden">
        <img src={experiment.imageUrl} alt={experiment.title} className="w-full h-96 object-cover" />
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4 neon-text">{experiment.title}</h1>
          <div className="text-xl text-gray-400 mb-6">
            <HtmlContent html={experiment.description} />
          </div>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <HtmlContent html={experiment.content} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExperimentDetail;
