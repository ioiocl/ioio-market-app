import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Loader2 } from 'lucide-react';
import { productService, categoryService, uploadService } from '../../api/services';

function AdminProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nameEs: '',
    descriptionEs: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
    isActive: true
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(res.data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nameEs: product.name_es || product.name,
      descriptionEs: product.description_es || product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category_id || product.categoryId,
      imageUrl: product.image_url || product.imageUrl || '',
      isActive: product.is_active !== false
    });
    setImagePreview(product.image_url || product.imageUrl || null);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
      } else {
        await productService.create(formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productService.delete(id);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleNew = () => {
    setEditingProduct(null);
    setFormData({
      nameEs: '',
      descriptionEs: '',
      price: '',
      stock: '',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      isActive: true
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to GCS
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file, 'products');
      setFormData({ ...formData, imageUrl: res.data.imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error subiendo imagen: ' + (error.response?.data?.error?.message || error.message));
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl neon-text loading">{t('common.loading')}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold neon-text">{t('admin.products')}</h1>
        <button onClick={handleNew} className="cyber-button">{t('admin.addNew')}</button>
      </div>
      <div className="cyber-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-cyber-gray">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Stock</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-cyber-gray">
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">${product.price}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">{product.isActive ? 'Active' : 'Inactive'}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="text-cyber-blue hover:text-cyber-pink mr-4"
                  >
                    {t('admin.edit')}
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="text-cyber-pink hover:text-cyber-yellow"
                  >
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cyber-card rounded-lg max-w-2xl w-full h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-cyber-gray">
              <h2 className="text-2xl font-bold text-cyber-blue">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.nameEs}
                    onChange={(e) => setFormData({ ...formData, nameEs: e.target.value })}
                    className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Descripción</label>
                  <textarea
                    value={formData.descriptionEs}
                    onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Precio ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Categoría</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Imagen</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-cyber-blue text-black rounded cursor-pointer hover:bg-opacity-80 transition-colors">
                      {uploading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</>
                      ) : (
                        <><Upload className="w-5 h-5" /> Subir Imagen</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                    )}
                  </div>
                  {formData.imageUrl && (
                    <p className="text-xs text-gray-400 mt-2 truncate">{formData.imageUrl}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-semibold">Activo</label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 p-6 border-t border-cyber-gray bg-cyber-dark">
              <button onClick={handleSave} className="cyber-button flex-1" disabled={uploading}>
                {t('admin.save')}
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-cyber-gray hover:bg-opacity-80 rounded transition-colors"
              >
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
