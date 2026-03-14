<<<<<<< HEAD:frontend/src/pages/Products.jsx
import { useState } from 'react';
import api from '../api/axios';
import { Plus } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', category: '', uom: '', stock: 0 });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', formData);
      setProducts([...products, res.data]);
      setIsModalOpen(false);
    } catch (err) { console.error("Create failed", err); }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18}/> New Product
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Stock (Edit)</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-gray-500">{p.sku}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">
                  <input type="number" defaultValue={p.stock} className="w-20 border rounded px-2"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Product</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input placeholder="Product Name" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, name: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="SKU" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, sku: e.target.value})}/>
                <input placeholder="Category" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, category: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="UOM (e.g. kg, pcs)" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, uom: e.target.value})}/>
                <input type="number" placeholder="Initial Stock" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, stock: e.target.value})}/>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

=======
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', category: '', uom: '', cost_per_unit: 0 });

  // Load products when page opens
  useEffect(() => {
    api.get('/products/').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/', formData);
      // Reload full list after create
      const res = await api.get('/products/');
      setProducts(res.data);
      setIsModalOpen(false);
    } catch (err) { console.error("Create failed", err); }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18}/> New Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">UOM</th>
              <th className="p-4">On Hand</th>
              <th className="p-4">Cost/Unit</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">No products yet</td></tr>
            )}
            {products.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-gray-500">{p.sku}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">{p.uom}</td>
                <td className="p-4">
                  <span className={p.low_stock ? 'text-red-600 font-bold' : ''}>{p.on_hand}</span>
                  {p.low_stock && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Low</span>}
                </td>
                <td className="p-4">₹{p.cost_per_unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Product</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input placeholder="Product Name" required className="w-full border p-2 rounded"
                onChange={e => setFormData({...formData, name: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="SKU" required className="w-full border p-2 rounded"
                  onChange={e => setFormData({...formData, sku: e.target.value})}/>
                <input placeholder="Category" className="w-full border p-2 rounded"
                  onChange={e => setFormData({...formData, category: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="UOM (e.g. kg, pcs)" className="w-full border p-2 rounded"
                  onChange={e => setFormData({...formData, uom: e.target.value})}/>
                <input type="number" placeholder="Cost per unit" className="w-full border p-2 rounded"
                  onChange={e => setFormData({...formData, cost_per_unit: parseFloat(e.target.value)})}/>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

>>>>>>> a6c281ca7deb3f1660ca29e4576ab04d335cbe31:src/pages/Products.jsx
export default Products;