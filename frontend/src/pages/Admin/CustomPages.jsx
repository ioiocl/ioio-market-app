import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { customPageService, uploadService } from '../../api/services';
import useStore from '../../store/useStore';

function AdminCustomPages() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    slug: '',
    titleEn: '',
    titleEs: '',
    contentEn: '',
    contentEs: '',
    imageUrl: '',
    images: [],
    isActive: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadPages();
  }, [user, navigate]);

  const loadPages = async () => {
    try {
      const res = await customPageService.getAll();
      setPages(res.data.pages);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file, 'pages');
      setFormData({ ...formData, imageUrl: res.data.url });
      alert('Imagen subida exitosamente');
    } catch (error) {
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const res = await uploadService.uploadMultiple(files, 'pages');
      setFormData({ 
        ...formData, 
        images: [...formData.images, ...res.data.urls] 
      });
      alert(`${files.length} imágenes subidas exitosamente`);
    } catch (error) {
      alert('Error al subir imágenes: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPage) {
        await customPageService.update(editingPage.id, formData);
        alert('Página actualizada exitosamente');
      } else {
        await customPageService.create(formData);
        alert('Página creada exitosamente');
      }
      resetForm();
      loadPages();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      titleEn: page.titleEn,
      titleEs: page.titleEs,
      contentEn: page.contentEn || '',
      contentEs: page.contentEs || '',
      imageUrl: page.imageUrl || '',
      images: page.images || [],
      isActive: page.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta página?')) return;

    try {
      await customPageService.delete(id);
      alert('Página eliminada exitosamente');
      loadPages();
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      titleEn: '',
      titleEs: '',
      contentEn: '',
      contentEs: '',
      imageUrl: '',
      images: [],
      isActive: true
    });
    setEditingPage(null);
    setShowForm(false);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-2xl neon-text">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold neon-text">Páginas Personalizadas</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="cyber-button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Página
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="cyber-card rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-cyber-blue">
              {editingPage ? 'Editar Página' : 'Nueva Página'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                placeholder="servicios, actividades, etc."
                className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
              />
              <p className="text-xs text-gray-400 mt-1">
                Este será la URL: /servicios o /actividades
              </p>
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Título (Español) *
                </label>
                <input
                  type="text"
                  name="titleEs"
                  value={formData.titleEs}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Título (Inglés) *
                </label>
                <input
                  type="text"
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Contenido (Español)
                </label>
                <textarea
                  name="contentEs"
                  value={formData.contentEs}
                  onChange={handleInputChange}
                  rows="10"
                  placeholder="Puedes usar HTML aquí..."
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Contenido (Inglés)
                </label>
                <textarea
                  name="contentEn"
                  value={formData.contentEn}
                  onChange={handleInputChange}
                  rows="10"
                  placeholder="You can use HTML here..."
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink font-mono text-sm"
                />
              </div>
            </div>

            {/* Main Image */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Imagen Principal
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded"
              />
              {formData.imageUrl && (
                <div className="mt-4">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Galería de Imágenes
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleImagesUpload}
                disabled={uploading}
                className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded"
              />
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-semibold">Página Activa</label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="cyber-button flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingPage ? 'Actualizar' : 'Crear'} Página
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-600 rounded hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      <div className="space-y-4">
        {pages.length === 0 ? (
          <div className="cyber-card rounded-lg p-8 text-center">
            <p className="text-gray-400">No hay páginas creadas</p>
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="cyber-card rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{page.titleEs}</h3>
                    <span className="text-sm px-2 py-1 bg-cyber-blue text-cyber-black rounded">
                      /{page.slug}
                    </span>
                    {!page.isActive && (
                      <span className="text-sm px-2 py-1 bg-gray-600 rounded">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{page.titleEn}</p>
                  {page.imageUrl && (
                    <img
                      src={page.imageUrl}
                      alt={page.titleEs}
                      className="w-48 h-32 object-cover rounded mt-3"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className="p-2 bg-blue-600 rounded hover:bg-blue-700"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="p-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminCustomPages;
