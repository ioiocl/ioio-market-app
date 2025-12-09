import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { productService, categoryService } from '../../api/services';

function AdminProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameEs: '',
    descriptionEn: '',
    descriptionEs: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
    isActive: true
  });

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
      nameEn: product.name_en || product.name,
      nameEs: product.name_es || product.name,
      descriptionEn: product.description_en || product.description,
      descriptionEs: product.description_es || product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category_id || product.categoryId,
      imageUrl: product.image_url || product.imageUrl || '',
      isActive: product.is_active !== false
    });
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
      nameEn: '',
      nameEs: '',
      descriptionEn: '',
      descriptionEs: '',
      price: '',
      stock: '',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      isActive: true
    });
    setShowModal(true);
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
          <div className="cyber-card rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyber-blue">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name (English)</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Name (Spanish)</label>
                <input
                  type="text"
                  value={formData.nameEs}
                  onChange={(e) => setFormData({ ...formData, nameEs: e.target.value })}
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description (English)</label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description (Spanish)</label>
                <textarea
                  value={formData.descriptionEs}
                  onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price ($)</label>
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
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-cyber-gray border border-cyber-blue rounded focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-semibold">Active</label>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button onClick={handleSave} className="cyber-button flex-1">
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
