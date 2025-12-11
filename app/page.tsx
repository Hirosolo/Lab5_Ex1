
'use client';

import { useState } from 'react';

// Define a simple type for the image data structure
interface ImageItem {
  image_id: string;
  filename: string;
  url: string;
  uploaded_at: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('users');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]); // NEW STATE for images

  const apiCall = async (url: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {}
      };
      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }
  
      const res = await fetch(url, options);
  
      let data;
      try {
        data = await res.json(); // Try JSON first
      } catch {
        data = await res.text(); // If fail, show raw text
      }
      
      // NEW LOGIC: Separate handling for image list retrieval
      if (url === '/api/images' && method === 'GET' && data.success) {
        setImages(data.data || []);
      } else {
        // Clear images if we switch tabs or make a non-image API call
        setImages([]);
      }
      
      setResponse({
        status: res.status,
        ok: res.ok,
        body: data
      });
  
    } catch (error: any) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };
  

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">Lab5_Ex1 API Test Client</h1>
        <p className="text-gray-600 mb-8">Next.js + Supabase (PostgreSQL)</p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b">
          {['users', 'products', 'carts', 'email', 'images', 'external'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab === 'carts' ? 'Shopping Carts' : tab === 'external' ? 'External Users' : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4 capitalize text-black">{activeTab} Actions</h2>
            
            {activeTab === 'users' && <UsersActions apiCall={apiCall} loading={loading} />}
            {activeTab === 'products' && <ProductsActions apiCall={apiCall} loading={loading} />}
            {activeTab === 'carts' && <CartsActions apiCall={apiCall} loading={loading} />}
            {activeTab === 'email' && <EmailActions apiCall={apiCall} loading={loading} />}
            {/* UPDATED: Pass images state to ImagesActions */}
            {activeTab === 'images' && <ImagesActions apiCall={apiCall} loading={loading} setLoading={setLoading} images={images} />}
            {activeTab === 'external' && <ExternalActions apiCall={apiCall} loading={loading} />}
          </div>

          {/* Right: Response */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4 text-black">Response</h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-[600px] text-sm">
                {response ? JSON.stringify(response, null, 2) : 'No response yet'}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersActions({ apiCall, loading }: any) {
  const [formData, setFormData] = useState({ full_name: '', address: '', user_id: '' });

  return (
    <div className="space-y-4">
      <button
        onClick={() => apiCall('/api/users')}
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        GET All Users
      </button>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2 text-black">Create User</h3>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <button
          onClick={() => apiCall('/api/users', 'POST', { full_name: formData.full_name, address: formData.address })}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          POST Create User
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2 text-black">Update/Delete User</h3>
        <input
          type="text"
          placeholder="User ID"
          value={formData.user_id}
          onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              apiCall(`/api/users?id=${formData.user_id}`, 'PUT', {
                full_name: formData.full_name,
                address: formData.address
              })
            }
            disabled={loading || !formData.user_id}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            PUT Update
          </button>
          <button
            onClick={() => apiCall(`/api/users?id=${formData.user_id}`, 'DELETE')}
            disabled={loading || !formData.user_id}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductsActions({ apiCall, loading }: any) {
  const [formData, setFormData] = useState({ product_name: '', price: '', manufacturing_date: '', product_id: '' });

  return (
    <div className="space-y-4">
      <button
        onClick={() => apiCall('/api/products','GET')}
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        GET All Products
      </button>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2 text-black">Create Product</h3>
        <input
          type="text"
          placeholder="Product Name"
          value={formData.product_name}
          onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <input
          type="date"
          placeholder="Manufacturing Date"
          value={formData.manufacturing_date}
          onChange={(e) => setFormData({ ...formData, manufacturing_date: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <button
          onClick={() => apiCall('/api/products', 'POST', {
            product_name: formData.product_name,
            price: formData.price,
            manufacturing_date: formData.manufacturing_date
          })}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 "
        >
          POST Create Product
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2 text-black">Update/Delete Product</h3>
        <input
          type="text"
          placeholder="Product ID"
          value={formData.product_id}
          onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => apiCall(`/api/products/${formData.product_id}`, 'PUT', {
              product_name: formData.product_name,
              price: parseFloat(formData.price)
            })}
            disabled={loading || !formData.product_id}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            PUT Update
          </button>
          <button
            onClick={() => apiCall(`/api/products?id=${formData.product_id}`, 'DELETE')}
            disabled={loading || !formData.product_id}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}

function CartsActions({ apiCall, loading }: any) {
  const [formData, setFormData] = useState({ user_id: '', product_id: '', quantity: '1', cart_id: '' });

  return (
    <div className="space-y-4">
      <button
        onClick={() => apiCall('/api/shopping-carts')}
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        GET All Shopping Carts
      </button>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2 text-black">Add to Cart</h3>
        <input
          type="text"
          placeholder="User ID"
          value={formData.user_id}
          onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <input
          type="text"
          placeholder="Product ID"
          value={formData.product_id}
          onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <button
          onClick={() => apiCall('/api/shopping-carts', 'POST', {
            user_id: formData.user_id,
            product_id: formData.product_id,
            quantity: parseInt(formData.quantity)
          })}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          POST Add to Cart
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2 text-black">Update/Delete Cart Item</h3>
        <input
          type="text"
          placeholder="Cart ID"
          value={formData.cart_id}
          onChange={(e) => setFormData({ ...formData, cart_id: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => apiCall(`/api/shopping-carts/${formData.cart_id}`, 'PUT', {
              quantity: parseInt(formData.quantity)
            })}
            disabled={loading || !formData.cart_id}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            PUT Update
          </button>
          <button
            onClick={() => apiCall(`/api/shopping-carts?id=${formData.cart_id}`, 'DELETE')}
            disabled={loading || !formData.cart_id}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailActions({ apiCall, loading }: any) {
  const [formData, setFormData] = useState({ email: '', subject: '', message: '' });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-black">Send Email</h3>
      <input
        type="email"
        placeholder="Recipient Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full border rounded px-3 py-2 text-black"
      />
      <input
        type="text"
        placeholder="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData , subject: e.target.value })}
        className="w-full border rounded px-3 py-2 text-black"
      />
      <textarea
        placeholder="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        className="w-full border rounded px-3 py-2 h-32 text-black"
      />
      <button
        onClick={() => apiCall('/api/send-email', 'POST', formData)}
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        POST Send Email
      </button>
    </div>
  );
}

function ImagesActions({ apiCall, loading, setLoading, images }: any) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    setLoading(true);
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      // --- DEBUGGING LOGGING REMAINS FOR 500 ERROR DIAGNOSIS ---
      console.log(`POST Response Status: ${res.status}`);
      const rawText = await res.text();
      console.log('POST Raw Response Body:', rawText);
      // --------------------------------------------------------
      
      if (res.ok) {
         // Trigger GET All Images after successful upload to refresh the list
         // This call will update the 'images' state in the Home component
         apiCall('/api/images'); 
      }
      
    } catch (error) {
      console.error("Fetch Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <button
        onClick={() => apiCall('/api/images')}
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        GET All Images
      </button>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2 text-black">Upload Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border rounded px-3 py-2 mb-2 text-black"
        />
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          POST Upload Image
        </button>
      </div>

      {/* NEW: Image Display Area */}
      {images.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4 text-black">Stored Images ({images.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image: any) => (
              <div key={image.image_id} className="border p-1 rounded overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.filename} 
                  className="w-full h-auto object-cover rounded" 
                />
                <p className="text-xs text-gray-500 truncate mt-1">{image.filename}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* END NEW: Image Display Area */}

    </div>
  );
}

function ExternalActions({ apiCall, loading }: any) {
  return (
    <div className="space-y-4">
      <button
        onClick={() => apiCall('/api/fetch-external-users')}
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        GET Saved External Users
      </button>

      <button
        onClick={() => apiCall('/api/fetch-external-users', 'POST')}
        disabled={loading}
        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        POST Fetch & Save from JSONPlaceholder
      </button>

      <button
        onClick={() => apiCall('/api/fetch-external-users', 'DELETE')}
        disabled={loading}
        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
      >
        DELETE All External Users
      </button>

      <div className="border-t pt-4 text-sm text-gray-600">
        <p>Source: https://jsonplaceholder.typicode.com/users</p>
      </div>
    </div>
  );
}