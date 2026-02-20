import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2 } from 'lucide-react';
import { useProductsStore } from '../../store/productsStore';

export default function AdminProducts() {
  const { t } = useTranslation();
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductsStore();
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price: '',
    sku: '',
    quantity: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity)
    };
    if (editing) {
      await updateProduct(editing.id, data);
      setEditing(null);
    } else {
      await addProduct(data);
    }
    setFormData({ name: '', description: '', image_url: '', price: '', sku: '', quantity: '' });
  };

  const handleEdit = (product) => {
    setEditing(product);
    setFormData(product);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4">{editing ? t('admin.edit') : t('admin.add')} Producto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            type="number"
            placeholder="Precio"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
            step="0.01"
          />
          <input
            type="text"
            placeholder="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Cantidad en stock"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="px-4 py-2 border rounded-lg"
            required
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
                setFormData({ name: '', description: '', image_url: '', price: '', sku: '', quantity: '' });
              }}
              className="btn btn-secondary"
            >
              {t('admin.cancel')}
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
            <img src={product.image_url} alt={product.name} className="w-24 h-16 object-cover rounded" />
            <div className="flex-1">
              <h4 className="font-bold">{product.name}</h4>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-xs text-gray-500">
                ${product.price} | SKU: {product.sku} | Stock: {product.quantity}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
