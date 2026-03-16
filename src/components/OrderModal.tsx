import { useState } from 'react';
import { X, ShoppingBag, Utensils, RefreshCw } from 'lucide-react';
import { supabase, MenuItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type OrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cart: { item: MenuItem; quantity: number }[];
  onOrderComplete: () => void;
};

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const answer = num1 + num2;
  return { num1, num2, answer };
}

export function OrderModal({ isOpen, onClose, cart, onOrderComplete }: OrderModalProps) {
  const [step, setStep] = useState<'type' | 'room-age' | 'confirm'>('type');
  const [orderType, setOrderType] = useState<'takeaway' | 'dine-in'>('takeaway');
  const [roomNumber, setRoomNumber] = useState('');
  const [age, setAge] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleRefreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaAnswer('');
  };

  if (!isOpen) return null;

  const totalPrice = cart.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);

  const handleOrderTypeSelect = (type: 'takeaway' | 'dine-in') => {
    setOrderType(type);
    setStep('room-age');
  };

  const handleSubmitOrder = async () => {
    if (!user) return;

    if (parseInt(captchaAnswer) !== captcha.answer) {
      setError('CAPTCHA שגוי');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const deliveryAddress = {
        room_number: roomNumber,
        age: parseInt(age),
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_type: orderType,
          total_price: totalPrice,
          delivery_address: deliveryAddress,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(({ item, quantity }) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      onOrderComplete();
      onClose();
      resetForm();
    } catch (err) {
      setError('אירעה שגיאה בשליחת ההזמנה. אנא נסה שנית.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setOrderType('takeaway');
    setRoomNumber('');
    setAge('');
    setCaptchaAnswer('');
    setCaptcha(generateCaptcha());
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            onClose();
            resetForm();
          }}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-center mb-6" dir="rtl">
          השלמת הזמנה
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center" dir="rtl">
            {error}
          </div>
        )}

        {step === 'type' && (
          <div className="space-y-4">
            <p className="text-center text-lg mb-6" dir="rtl">
              איך תרצה לקבל את ההזמנה?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleOrderTypeSelect('takeaway')}
                className="p-8 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition flex flex-col items-center gap-4"
              >
                <ShoppingBag size={48} className="text-orange-500" />
                <span className="text-xl font-bold">איסוף עצמי</span>
              </button>
              <button
                onClick={() => handleOrderTypeSelect('dine-in')}
                className="p-8 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition flex flex-col items-center gap-4"
              >
                <Utensils size={48} className="text-orange-500" />
                <span className="text-xl font-bold">ישיבה במקום</span>
              </button>
            </div>
          </div>
        )}

        {step === 'room-age' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-right mb-4" dir="rtl">
              {orderType === 'dine-in' ? 'פרטים לישיבה' : 'פרטים להזמנה'}
            </h3>
            <div>
              <label className="block text-right mb-2 font-medium" dir="rtl">
                מספר חדר
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                dir="rtl"
                placeholder="לדוגמה: 42"
              />
            </div>
            <div>
              <label className="block text-right mb-2 font-medium" dir="rtl">
                גיל
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="1"
                max="120"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                dir="rtl"
              />
            </div>
            <button
              onClick={() => setStep('confirm')}
              disabled={!roomNumber || !age}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50"
            >
              המשך לאישור
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6" dir="rtl">
              <h3 className="text-xl font-bold mb-4">סיכום הזמנה</h3>
              <div className="space-y-2 mb-4">
                {cart.map(({ item, quantity }) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x{quantity}</span>
                    <span>₪{(item.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>סה"כ</span>
                  <span>₪{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium">
                  סוג הזמנה: {orderType === 'takeaway' ? 'משלוח לחדר' : 'ישיבה במקום'}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>מספר חדר: {roomNumber}</p>
                  <p>גיל: {age}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="הכנס תשובה"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'שולח הזמנה...' : 'אשר הזמנה'}
            </button>
            <button
              onClick={() => setStep('room-age')}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
            >
              חזור
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
