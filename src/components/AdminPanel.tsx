import { useState, useEffect } from 'react';
import { X, Check, Trash2, Ban, RefreshCw } from 'lucide-react';
import { supabase, Order, OrderItem, MenuItem } from '../lib/supabase';

type OrderWithItems = Order & {
  items: (OrderItem & { menu_item: MenuItem })[];
};

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const answer = num1 + num2;
  return { num1, num2, answer };
}

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const ADMIN_PASSWORD = 'Biz111222';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaAnswer) !== captcha.answer) {
      setError('CAPTCHA שגוי');
      return;
    }
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      setPassword('');
      setCaptchaAnswer('');
      loadOrders();
    } else {
      setError('סיסמה שגויה');
    }
  };

  const handleRefreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaAnswer('');
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select(`
              *,
              menu_item:menu_item_id (
                id,
                name,
                description,
                price,
                category,
                image_url,
                available,
                created_at
              )
            `)
            .eq('order_id', order.id);

          return {
            ...order,
            items: (itemsData || []).map((item: any) => ({
              ...item,
              menu_item: item.menu_item,
            })),
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, blocked: boolean = false) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, blocked })
        .eq('id', orderId);

      if (error) throw error;
      await loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = (orderId: string) => {
    updateOrderStatus(orderId, 'confirmed', false);
  };

  const handleReject = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled', false);
  };

  const handleBlock = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled', true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition z-40"
        title="Admin Panel"
      >
        ⚙️
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>

          <h2 className="text-3xl font-bold text-center mb-6" dir="rtl">
            פאנל ניהול
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center" dir="rtl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-right mb-2 font-medium" dir="rtl">
                סיסמה
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-right mb-3 font-medium" dir="rtl">
                אימות אדם: {captcha.num1} + {captcha.num2} = ?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  title="רענן CAPTCHA"
                >
                  <RefreshCw size={20} />
                </button>
                <input
                  type="number"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="הכנס תשובה"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
              כניסה
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-center mb-8" dir="rtl">
          פאנל ניהול הזמנות
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">טוען הזמנות...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500" dir="rtl">
            אין הזמנות
          </p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-6"
                dir="rtl"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'pending' && 'ממתינה'}
                      {order.status === 'confirmed' && 'אושרה'}
                      {order.status === 'cancelled' && order.blocked ? 'חסומה' : 'דחויה'}
                      {order.status === 'ready' && 'מוכנה'}
                      {order.status === 'completed' && 'הושלמה'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleString('he-IL')}
                    </span>
                  </div>
                  <p className="text-lg font-bold">
                    סה"כ: ₪{order.total_price.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-bold mb-3">פריטים:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.menu_item?.name || 'פריט לא ידוע'} x{item.quantity}
                        </span>
                        <span>₪{(item.price_at_time * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.delivery_address && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-bold mb-2">כתובת משלוח:</h4>
                    <p>שם משפחה: {order.delivery_address.family_name}</p>
                    <p>קיבוץ: {order.delivery_address.kibbutz}</p>
                    {order.delivery_address.neighborhood && (
                      <p>שכונה: {order.delivery_address.neighborhood}</p>
                    )}
                    <p>מספר בית: {order.delivery_address.house_number}</p>
                  </div>
                )}

                {order.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(order.id)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 font-bold"
                    >
                      <Check size={20} />
                      אישור
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 font-bold"
                    >
                      <Trash2 size={20} />
                      דחיה
                    </button>
                    <button
                      onClick={() => handleBlock(order.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-bold"
                    >
                      <Ban size={20} />
                      חסימה
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
