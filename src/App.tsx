import { useEffect, useState } from 'react';
import { Menu, ShoppingCart, User, Facebook, Instagram, Twitter, Phone, Mail, MapPin, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { OrderModal } from './components/OrderModal';
import { AdminPanel } from './components/AdminPanel';
import { supabase, MenuItem } from './lib/supabase';

function App() {
  const { user, signOut } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category');

    if (!error && data) {
      setMenuItems(data);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prev =>
        prev.map(c => (c.item.id === itemId ? { ...c, quantity } : c))
      );
    }
  };

  const handleOrder = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowOrderModal(true);
    }
  };

  const handleOrderComplete = () => {
    setCart([]);
    setShowCart(false);
    alert('ההזמנה נשלחה בהצלחה!');
  };

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const categories = ['ציפס', 'שניצלים', 'ארטיקים', 'משקאות'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  <User size={20} />
                  <span>התנתק</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition"
                >
                  <User size={20} />
                  <span>התחבר</span>
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-8" dir="rtl">
              <a href="#contact" className="hover:text-orange-500 transition font-medium">
                צור קשר
              </a>
              <a href="#about" className="hover:text-orange-500 transition font-medium">
                אודות
              </a>
              <a href="#menu" className="hover:text-orange-500 transition font-medium">
                תפריט
              </a>
              <a href="#home" className="hover:text-orange-500 transition font-medium">
                בית
              </a>
            </div>

            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-orange-500" dir="rtl">
                סנק בר
              </h1>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4" dir="rtl">
              <nav className="flex flex-col gap-3">
                <a
                  href="#home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-orange-500 transition font-medium"
                >
                  בית
                </a>
                <a
                  href="#menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-orange-500 transition font-medium"
                >
                  תפריט
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-orange-500 transition font-medium"
                >
                  אודות
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-orange-500 transition font-medium"
                >
                  צור קשר
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {showCart && (
        <div className="fixed top-20 left-4 bg-white shadow-2xl rounded-2xl p-6 z-50 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setShowCart(false)}>
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold" dir="rtl">
              העגלה שלי
            </h3>
          </div>

          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-8" dir="rtl">
              העגלה ריקה
            </p>
          ) : (
            <div className="space-y-4">
              {cart.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex-1 text-right" dir="rtl">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600">₪{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-xl font-bold mb-4" dir="rtl">
                  <span>סה"כ: ₪{totalPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleOrder}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition"
                >
                  המשך להזמנה
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <section id="home" className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-5xl md:text-7xl font-bold mb-6" dir="rtl">
            ברוכים הבאים לסנק בר
          </h2>
          <p className="text-xl md:text-2xl mb-8" dir="rtl">
            האוכל הכי טעים בקיבוץ
          </p>
          <a
            href="#menu"
            className="inline-block bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-600 transition transform hover:scale-105"
          >
            לתפריט המלא
          </a>
        </div>
      </section>

      <section id="menu" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4" dir="rtl">
            התפריט שלנו
          </h2>
          <p className="text-center text-gray-600 text-lg mb-12" dir="rtl">
            כדי להזמין, יש קודם כל להירשם לחשבון סנק בר
          </p>

          {menuItems.length === 0 ? (
            <p className="text-center text-gray-500 text-xl" dir="rtl">
              טוען תפריט...
            </p>
          ) : (
            <div className="space-y-12">
              {categories.map(category => {
                const items = menuItems.filter(item => item.category === category);
                if (items.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-3xl font-bold mb-6 text-right" dir="rtl">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
                        >
                          {item.image_url && (
                            <div className="h-48 overflow-hidden">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-6" dir="rtl">
                            <h4 className="text-xl font-bold mb-2">{item.name}</h4>
                            {item.description && (
                              <p className="text-gray-600 mb-4">{item.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => {
                                  if (!user) {
                                    setShowAuthModal(true);
                                  } else {
                                    addToCart(item);
                                  }
                                }}
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                              >
                                הוסף לעגלה
                              </button>
                              <span className="text-2xl font-bold text-orange-500">
                                ₪{item.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="about" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12" dir="rtl">
            אודותינו
          </h2>
          <div className="text-lg leading-relaxed space-y-6" dir="rtl">
            <p>
              סנק בר הוא המקום המושלם לאוכל מהיר וטעים בקיבוץ. אנחנו מתמחים במנות מטוגנות
              טריות, ארטיקים קרים ומשקאות מרעננים.
            </p>
            <p>
              כל המוצרים שלנו עשויים מחומרי גלם איכותיים ומוכנים בזמן אמת כדי להבטיח טריות
              וטעם מעולה.
            </p>
            <p>
              אנחנו פועלים בקיבוץ כבר שנים רבות ומחויבים לספק לכם את חוויית האוכל הטובה
              ביותר. ניתן להזמין לאיסוף עצמי או לשבת אצלנו ליהנות מהאווירה.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12" dir="rtl">
            צור קשר
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <Phone size={48} className="mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-bold mb-2" dir="rtl">
                טלפון
              </h3>
              <a href="tel:972-58-778-7665" className="text-orange-600 hover:text-orange-700 font-semibold" dir="ltr">
                972-58-778-7665
              </a>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <Mail size={48} className="mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-bold mb-2" dir="rtl">
                אימייל
              </h3>
              <a href="mailto:snekdar17@gmail.com" className="text-orange-600 hover:text-orange-700 font-semibold" dir="ltr">
                snekdar17@gmail.com
              </a>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <MapPin size={48} className="mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-bold mb-2" dir="rtl">
                מיקום
              </h3>
              <a
                href="https://maps.google.com/?q=Kealia+Kibbutz+pool"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-semibold"
                dir="rtl"
              >
                בתוך בריכת השחייה של קיבוץ קליה
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-3xl font-bold" dir="rtl">
              סנק בר
            </h3>
            <div className="flex gap-6">
              <a
                href="#"
                className="hover:text-orange-500 transition"
                aria-label="Facebook"
              >
                <Facebook size={32} />
              </a>
              <a
                href="#"
                className="hover:text-orange-500 transition"
                aria-label="Instagram"
              >
                <Instagram size={32} />
              </a>
              <a
                href="#"
                className="hover:text-orange-500 transition"
                aria-label="Twitter"
              >
                <Twitter size={32} />
              </a>
            </div>
            <p className="text-gray-400" dir="rtl">
              © 2024 סנק בר. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          if (cart.length > 0) {
            setShowOrderModal(true);
          }
        }}
      />

      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        cart={cart}
        onOrderComplete={handleOrderComplete}
      />

      <AdminPanel />
    </div>
  );
}

export default App;
