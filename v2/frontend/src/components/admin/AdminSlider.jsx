import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useSliderStore } from '../../store/sliderStore';

export default function AdminSlider() {
  const { t } = useTranslation();
  const { slides, fetchSlides, addSlide, updateSlide, deleteSlide } = useSliderStore();
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    cta_text: '',
    cta_url: ''
  });

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateSlide(editing.id, formData);
      setEditing(null);
    } else {
      await addSlide(formData);
    }
    setFormData({ title: '', description: '', image_url: '', cta_text: '', cta_url: '' });
  };

  const handleEdit = (slide) => {
    setEditing(slide);
    setFormData(slide);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este slide?')) {
      await deleteSlide(id);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4">{editing ? t('admin.edit') : t('admin.add')} Slide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="URL de imagen"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="px-4 py-2 border rounded-lg md:col-span-2"
            rows="3"
          />
          <input
            type="text"
            placeholder="Texto del botón"
            value={formData.cta_text}
            onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="URL del botón"
            value={formData.cta_url}
            onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn btn-primary">
            {editing ? t('admin.save') : t('admin.add')}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormData({ title: '', description: '', image_url: '', cta_text: '', cta_url: '' });
              }}
              className="btn btn-secondary"
            >
              {t('admin.cancel')}
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {slides.map((slide) => (
          <div key={slide.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
            <img src={slide.image_url} alt={slide.title} className="w-24 h-16 object-cover rounded" />
            <div className="flex-1">
              <h4 className="font-bold">{slide.title}</h4>
              <p className="text-sm text-gray-600">{slide.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(slide)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(slide.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
