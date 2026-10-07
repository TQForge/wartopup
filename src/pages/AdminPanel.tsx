import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Navigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  increment,
  limit
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingUp,
  UserPlus,
  DollarSign,
  Trash2,
  Edit2,
  Plus,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

type AdminTab = 'dashboard' | 'orders' | 'users' | 'add-money' | 'products' | 'banners' | 'deposits';

export default function AdminPanel() {
  const { profile, loading } = useAuth();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile || profile.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="bg-[#F3F7FF] min-h-screen pb-24 relative">
      {feedback && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-bounce">
          {feedback}
        </div>
      )}
      {/* Admin Header */}
      <div className="bg-linear-to-r from-primary-start to-primary-end text-white py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight uppercase">Admin Control Panel</h1>
          <p className="text-white/80 text-sm mt-1 opacity-80">Manage your store, users, and orders</p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'deposits', label: 'Deposits', icon: DollarSign },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'products', label: 'Products', icon: PlusCircle },
          { id: 'banners', label: 'Banners', icon: ImageIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex-1 min-w-[100px] py-4 px-2 flex flex-col items-center gap-1 transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'deposits' && <AdminDeposits />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'banners' && <AdminBanners />}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => setUserCount(snap.size), (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => setProductCount(snap.size), (err) => handleFirestoreError(err, OperationType.LIST, 'products'));
    
    // Only fetch the most recent 10 orders for the dashboard
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentOrders(orders);
      
      // Note: Revenue is only based on these 10 orders now for performance
      // In a real app, this should come from a summary document
      const revenue = orders
        .filter((o: any) => o.status === 'Completed')
        .reduce((acc: number, o: any) => acc + (o.price || 0), 0);
      setTotalRevenue(revenue);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    return () => {
      unsubUsers();
      unsubProducts();
      unsubOrders();
    };
  }, []);

  const stats = [
    { label: 'Total Revenue', value: `৳ ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Total Products', value: productCount.toString(), icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Total Users', value: userCount.toString(), icon: UserPlus, color: 'bg-purple-500' },
    { label: 'Approval Mode', value: 'Manual', icon: Clock, color: 'bg-orange-500' },
  ];

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100">
            <div className={`w-10 h-10 ${stat.color} text-white rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wider">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No recent activity</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">New order #{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-[11px] text-gray-500">
                    {formatTime(order.createdAt)} • {order.productTitle || 'Unknown Product'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">৳ {order.price}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminOrders() {
  const { showAlert } = useAlert();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { 
        status,
        completedAt: status === 'Completed' ? Timestamp.now() : null
      });
      showAlert(`অর্ডার স্ট্যাটাস ${status} এ আপডেট করা হয়েছে।`);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 uppercase tracking-wider">Order Management</h3>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-400">No orders found</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Order #{order.id.slice(-6).toUpperCase()}</p>
                  <h4 className="text-sm font-bold text-gray-900">{order.productTitle} - {order.optionLabel}</h4>
                  <p className="text-[10px] text-gray-500">Player ID: <span className="text-primary font-bold">{order.playerId}</span></p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  order.status === 'Completed' ? 'bg-green-100 text-green-600' :
                  order.status === 'Processing' ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {order.status}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Transaction ID</p>
                  <p className="text-xs font-bold text-gray-700">{order.trxId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase">Price</p>
                  <p className="text-sm font-bold text-primary">৳ {order.price}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => handleUpdateStatus(order.id, 'Completed')}
                  disabled={order.status === 'Completed'}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg text-[10px] font-bold uppercase disabled:opacity-50"
                >
                  Complete
                </button>
                <button 
                  onClick={() => handleUpdateStatus(order.id, 'Processing')}
                  disabled={order.status === 'Processing'}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-[10px] font-bold uppercase disabled:opacity-50"
                >
                  Process
                </button>
                <button 
                  onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                  disabled={order.status === 'Cancelled'}
                  className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-[10px] font-bold uppercase disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminDeposits() {
  const { showAlert } = useAlert();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDeposits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'deposits'));
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, userId: string, amount: number, status: string) => {
    try {
      if (status === 'Completed') {
        // Update user balance
        await updateDoc(doc(db, 'users', userId), {
          balance: increment(amount)
        });
      }
      
      await updateDoc(doc(db, 'deposits', id), { 
        status,
        completedAt: status === 'Completed' ? Timestamp.now() : null
      });
      showAlert(`ডিপোজিট অনুরোধ ${status} এ আপডেট করা হয়েছে।`);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, `deposits/${id}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading deposits...</div>;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 uppercase tracking-wider">Deposit Management</h3>
      <div className="space-y-3">
        {deposits.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-400">No deposits found</div>
        ) : (
          deposits.map((deposit) => (
            <div key={deposit.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Deposit #{deposit.id.slice(-6).toUpperCase()}</p>
                  <h4 className="text-sm font-bold text-gray-900">{deposit.userName}</h4>
                  <p className="text-[10px] text-gray-500">Method: <span className="text-primary font-medium uppercase">{deposit.method}</span></p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  deposit.status === 'Completed' ? 'bg-green-100 text-green-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {deposit.status}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Transaction ID</p>
                  <p className="text-xs font-bold text-gray-700">{deposit.trxId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase">Amount</p>
                  <p className="text-sm font-bold text-primary">৳ {deposit.amount}</p>
                </div>
              </div>

              {deposit.status === 'Pending' && (
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => handleUpdateStatus(deposit.id, deposit.userId, deposit.amount, 'Completed')}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg text-[10px] font-bold uppercase"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(deposit.id, deposit.userId, deposit.amount, 'Cancelled')}
                    className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-[10px] font-bold uppercase"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('displayName'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 uppercase tracking-wider">User Directory</h3>
      </div>
      <div className="space-y-3">
        {users.map((user, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-r from-primary-start to-primary-end text-white rounded-full flex items-center justify-center font-bold">
                {(user.displayName || user.email || 'U').charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{user.displayName || 'Unnamed User'}</h4>
                <p className="text-[10px] text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">৳ {user.balance || 0}</p>
              <span className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">{user.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminProducts() {
  const { showAlert } = useAlert();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    imageUrl: '',
    category: 'Free Fire',
    options: [{ id: 1, label: '', price: 0, icon: '💎' }]
  });

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));
    return () => unsubscribe();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), newProduct);
        showAlert('প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে');
      } else {
        await addDoc(collection(db, 'products'), {
          ...newProduct,
          createdAt: Timestamp.now(),
          order: products.length
        });
        showAlert('প্রোডাক্ট সফলভাবে যোগ করা হয়েছে');
      }
      
      setIsAdding(false);
      setEditingId(null);
      setNewProduct({
        title: '',
        imageUrl: '',
        category: 'Free Fire',
        options: [{ id: 1, label: '', price: 0, icon: '💎' }]
      });
    } catch (error: any) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `products/${editingId}` : 'products');
    }
  };

  const handleEditClick = (product: any) => {
    setNewProduct({
      title: product.title,
      imageUrl: product.imageUrl,
      category: product.category,
      options: product.options || []
    });
    setEditingId(product.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      showAlert('আবার ক্লিক করুন নিশ্চিত করতে');
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', id));
      showAlert('প্রোডাক্ট সফলভাবে ডিলিট করা হয়েছে');
      setConfirmDeleteId(null);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleFixProducts = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'asc')));
      let fixed = 0;
      for (let i = 0; i < snap.docs.length; i++) {
        const productDoc = snap.docs[i];
        const data = productDoc.data();
        const updates: any = {};
        if (!data.createdAt) updates.createdAt = Timestamp.now();
        if (data.order === undefined) updates.order = i;
        
        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, 'products', productDoc.id), updates);
          fixed++;
        }
      }
      showAlert(`${fixed} টি প্রোডাক্ট আপডেট করা হয়েছে।`);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, 'products');
    }
  };

  const handleMoveProduct = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const currentProduct = products[index];
    const targetProduct = products[targetIndex];

    try {
      const currentOrder = currentProduct.order !== undefined ? currentProduct.order : index;
      const targetOrder = targetProduct.order !== undefined ? targetProduct.order : targetIndex;

      await updateDoc(doc(db, 'products', currentProduct.id), { order: targetOrder });
      await updateDoc(doc(db, 'products', targetProduct.id), { order: currentOrder });
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, 'products');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-bold text-gray-900 uppercase tracking-wider">Manage Products</h3>
          <button 
            onClick={handleFixProducts}
            className="text-[10px] text-primary font-bold uppercase mt-1 hover:underline text-left"
          >
            Fix Sorting (Add Missing Timestamps)
          </button>
        </div>
        <button 
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingId(null);
              setNewProduct({
                title: '',
                imageUrl: '',
                category: 'Free Fire',
                options: [{ id: 1, label: '', price: 0, icon: '💎' }]
              });
            } else {
              setIsAdding(true);
            }
          }}
          className="bg-linear-to-r from-primary-start to-primary-end text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md hover:opacity-90 transition-opacity"
        >
          {isAdding ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Title</label>
              <input 
                required
                value={newProduct.title}
                onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                placeholder="e.g. UID Topup { BD }"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Category</label>
              <input 
                required
                value={newProduct.category}
                onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                placeholder="e.g. Free Fire"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Image URL</label>
            <input 
              required
              value={newProduct.imageUrl}
              onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase">Recharge Options</label>
            {newProduct.options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input 
                  placeholder="Label (e.g. 25 Diamond)"
                  className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
                  value={opt.label}
                  onChange={e => {
                    const opts = [...newProduct.options];
                    opts[i].label = e.target.value;
                    setNewProduct({...newProduct, options: opts});
                  }}
                />
                <input 
                  type="number"
                  placeholder="Price"
                  className="w-24 p-2 border border-gray-200 rounded-lg text-sm"
                  value={opt.price}
                  onChange={e => {
                    const opts = [...newProduct.options];
                    opts[i].price = Number(e.target.value);
                    setNewProduct({...newProduct, options: opts});
                  }}
                />
                <button 
                  type="button"
                  onClick={() => {
                    const opts = newProduct.options.filter((_, idx) => idx !== i);
                    setNewProduct({...newProduct, options: opts});
                  }}
                  className="p-2 text-primary"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => setNewProduct({...newProduct, options: [...newProduct.options, { id: Date.now(), label: '', price: 0, icon: '💎' }]})}
              className="text-xs font-bold text-blue-600 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Option
            </button>
          </div>

          <button type="submit" className="w-full bg-linear-to-r from-primary-start to-primary-end text-white py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity">
            {editingId ? 'Update Product' : 'Save Product'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {products.map((product, index) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <img src={product.imageUrl || null} alt={product.title} className="w-16 h-16 rounded-lg object-cover border border-gray-100" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900">{product.title}</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{product.category}</p>
              <p className="text-xs text-gray-400 mt-1">{product.options?.length || 0} Options</p>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1">
                <button 
                  disabled={index === 0}
                  onClick={() => handleMoveProduct(index, 'up')}
                  className="p-1 bg-gray-50 text-gray-400 rounded hover:text-primary disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button 
                  disabled={index === products.length - 1}
                  onClick={() => handleMoveProduct(index, 'down')}
                  className="p-1 bg-gray-50 text-gray-400 rounded hover:text-primary disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => handleEditClick(product)}
                className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-gray-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteProduct(product.id)}
                className={`p-2 rounded-lg transition-colors ${
                  confirmDeleteId === product.id 
                    ? 'bg-black text-white' 
                    : 'bg-primary/5 text-primary hover:text-primary-dark'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminBanners() {
  const { showAlert } = useAlert();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newBanner, setNewBanner] = useState({
    imageUrl: '',
    order: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'banners'));
    return () => unsubscribe();
  }, []);

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'banners'), newBanner);
      setIsAdding(false);
      setNewBanner({ imageUrl: '', order: 0 });
    } catch (error: any) {
      handleFirestoreError(error, OperationType.CREATE, 'banners');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      showAlert('আবার ক্লিক করুন নিশ্চিত করতে');
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }

    try {
      await deleteDoc(doc(db, 'banners', id));
      showAlert('ব্যানার সফলভাবে ডিলিট করা হয়েছে');
      setConfirmDeleteId(null);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.DELETE, `banners/${id}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading banners...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 uppercase tracking-wider">Manage Banners</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-linear-to-r from-primary-start to-primary-end text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md hover:opacity-90 transition-opacity"
        >
          {isAdding ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddBanner} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Banner Image URL</label>
            <input 
              required
              value={newBanner.imageUrl}
              onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Display Order</label>
            <input 
              type="number"
              required
              value={newBanner.order}
              onChange={e => setNewBanner({...newBanner, order: Number(e.target.value)})}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              placeholder="0"
            />
          </div>
          <button type="submit" className="w-full bg-linear-to-r from-primary-start to-primary-end text-white py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity">
            Save Banner
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-32 h-16 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
              <img src={banner.imageUrl || null} alt="Banner" className="w-full h-full object-fill" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order: {banner.order}</p>
              <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{banner.imageUrl}</p>
            </div>
            <button 
              onClick={() => handleDeleteBanner(banner.id)}
              className={`p-2 rounded-lg transition-colors ${
                confirmDeleteId === banner.id 
                  ? 'bg-black text-white' 
                  : 'bg-primary/5 text-primary hover:text-primary-dark'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
