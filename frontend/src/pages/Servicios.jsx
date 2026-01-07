import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { customPageService } from '../api/services';

function Servicios() {
  const { i18n } = useTranslation();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      const res = await customPageService.getBySlug('servicios');
      setPageData(res.data.page);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-2xl neon-text">Cargando...</div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4 neon-text">Servicios</h1>
        <p className="text-gray-400">Contenido no disponible</p>
      </div>
    );
  }

  const title = i18n.language === 'es' ? pageData.titleEs : pageData.titleEn;
  const content = i18n.language === 'es' ? pageData.contentEs : pageData.contentEn;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {pageData.imageUrl && (
        <section className="relative h-96 overflow-hidden mb-8">
          <img
            src={pageData.imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
            <h1 className="text-5xl md:text-7xl font-bold neon-text">{title}</h1>
          </div>
        </section>
      )}

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {!pageData.imageUrl && (
          <h1 className="text-5xl font-bold mb-8 neon-text text-center">{title}</h1>
        )}

        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Additional Images Gallery */}
          {pageData.images && pageData.images.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageData.images.map((image, index) => (
                <div key={index} className="cyber-card rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${title} ${index + 1}`}
                    className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Servicios;
