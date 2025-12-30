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
    images: [],
    psdFileUrl: '',
    isActive: true
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingPSD, setUploadingPSD] = useState(false);
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
    const productImages = product.images || product.images || [];
    const coverImage = product.image_url || product.imageUrl || productImages[0] || '';
    setFormData({
      nameEs: product.name_es || product.name,
      descriptionEs: product.description_es || product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category_id || product.categoryId,
      imageUrl: coverImage,
      images: productImages,
      psdFileUrl: product.psdFileUrl || product.psd_file_url || '',
      isActive: product.is_active !== false
    });
    setImagePreview(coverImage || null);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Send both English and Spanish fields (use Spanish for both)
      const dataToSend = {
        ...formData,
        nameEn: formData.nameEs,
        descriptionEn: formData.descriptionEs
      };
      
      if (editingProduct) {
        await productService.update(editingProduct.id, dataToSend);
      } else {
        await productService.create(dataToSend);
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
      images: [],
      psdFileUrl: '',
      isActive: true
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const res = files.length > 1
        ? await uploadService.uploadMultiple(files, 'products')
        : await uploadService.uploadImage(files[0], 'products');

      const uploadedUrls = res.data.imageUrls || (res.data.imageUrl ? [res.data.imageUrl] : []);
      const nextImages = [...formData.images, ...uploadedUrls];
      const nextCover = formData.imageUrl || uploadedUrls[0] || null;

      setFormData({
        ...formData,
        images: nextImages,
        imageUrl: nextCover
      });
      setImagePreview(nextCover);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error subiendo imagen: ' + (error.response?.data?.error?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (url) => {
    const remaining = formData.images.filter((image) => image !== url);
    let nextCover = formData.imageUrl;
    if (url === formData.imageUrl) {
      nextCover = remaining[0] || '';
    }
    setFormData({
      ...formData,
      images: remaining,
      imageUrl: nextCover
    });
    setImagePreview(nextCover || null);
  };

  const handleSetCover = (url) => {
    setFormData({
      ...formData,
      imageUrl: url
    });
    setImagePreview(url);
  };

  const handlePSDUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.psd')) {
      alert('Solo se permiten archivos PSD');
      return;
    }

    setUploadingPSD(true);
    try {
      const res = await uploadService.uploadPSD(file, 'products/psd');
      setFormData({
        ...formData,
        psdFileUrl: res.data.psdUrl
      });
      alert('Archivo PSD subido exitosamente');
    } catch (error) {
      console.error('Error uploading PSD:', error);
      alert('Error subiendo archivo PSD: ' + (error.response?.data?.error?.message || error.message));
    } finally {
      setUploadingPSD(false);
    }
  };

  const handleRemovePSD = () => {
    setFormData({
      ...formData,
      psdFileUrl: ''
    });
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
                  <label className="block text-sm font-semibold mb-2">Imágenes</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex items-center gap-2 px-4 py-2 bg-cyber-blue text-black rounded cursor-pointer hover:bg-opacity-80 transition-colors">
                      {uploading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</>
                      ) : (
                        <><Upload className="w-5 h-5" /> Subir Imágenes</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded border border-cyber-blue" />
                    )}
                  </div>
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {formData.images.map((image) => (
                        <div key={image} className={`relative group rounded overflow-hidden border ${formData.imageUrl === image ? 'border-cyber-blue' : 'border-cyber-gray'}`}>
                          <img src={image} alt="Producto" className="w-full h-24 object-cover" />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex flex-col items-center justify-center gap-2 text-xs">
                            {formData.imageUrl !== image && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(image)}
                                className="px-2 py-1 bg-cyber-blue text-black rounded hover:bg-cyber-pink"
                              >
                                Portada
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image)}
                              className="px-2 py-1 bg-cyber-pink text-black rounded hover:bg-cyber-yellow"
                            >
                              Eliminar
                            </button>
                          </div>
                          {formData.imageUrl === image && (
                            <span className="absolute top-1 left-1 bg-cyber-blue text-black text-[10px] font-bold px-2 py-0.5 rounded">
                              Portada
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Archivo PSD (Solo Admin)</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex items-center gap-2 px-4 py-2 bg-cyber-yellow text-black rounded cursor-pointer hover:bg-opacity-80 transition-colors">
                      {uploadingPSD ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo PSD...</>
                      ) : (
                        <><Upload className="w-5 h-5" /> Subir PSD</>
                      )}
                      <input
                        type="file"
                        accept=".psd"
                        onChange={handlePSDUpload}
                        className="hidden"
                        disabled={uploadingPSD}
                      />
                    </label>
                    {formData.psdFileUrl && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-cyber-gray rounded">
                        <span className="text-xs text-gray-300 truncate max-w-[200px]">
                          {formData.psdFileUrl.split('/').pop()}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemovePSD}
                          className="text-cyber-pink hover:text-cyber-yellow"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {formData.psdFileUrl && (
                    <a
                      href={formData.psdFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyber-blue hover:text-cyber-pink mt-2 inline-block"
                    >
                      Descargar PSD →
                    </a>
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
