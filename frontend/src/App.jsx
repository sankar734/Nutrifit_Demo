import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { DeviceModeProvider } from './context/DeviceModeContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import RoleRoute from './components/shared/RoleRoute';

// Customer pages
import Login from './pages/customer/Login';
import Home from './pages/customer/Home';
import Search from './pages/customer/Search';
import FoodDetails from './pages/customer/FoodDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderConfirmed from './pages/customer/OrderConfirmed';
import OrderTracking from './pages/customer/OrderTracking';
import NutritionDashboard from './pages/customer/NutritionDashboard';
import Profile from './pages/customer/Profile';
import MyOrders from './pages/customer/MyOrders';
import BecomeChef from './pages/customer/BecomeChef';
import BecomeDelivery from './pages/customer/BecomeDelivery';
import Settings from './pages/customer/settings/Settings';
import NotificationSettings from './pages/customer/settings/NotificationSettings';
import PaymentMethods from './pages/customer/settings/PaymentMethods';
import HelpSupport from './pages/customer/settings/HelpSupport';
import About from './pages/customer/settings/About';
import Privacy from './pages/customer/settings/Privacy';
import Language from './pages/customer/settings/Language';
import Appearance from './pages/customer/settings/Appearance';

// Chef & Delivery pages
import ChefDashboard from './pages/chef/ChefDashboard';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminChefs from './pages/admin/Chefs';
import AdminOrders from './pages/admin/Orders';
import AdminCoupons from './pages/admin/Coupons';

function App() {
  return (
    <BrowserRouter>
      <DeviceModeProvider>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <Routes>
                {/* Entry point: directly Home (protected) or Login */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />

                {/* Customer app */}
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/food/:id" element={<ProtectedRoute><FoodDetails /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-confirmed/:id" element={<ProtectedRoute><OrderConfirmed /></ProtectedRoute>} />
                <Route path="/order/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                <Route path="/nutrition" element={<ProtectedRoute><NutritionDashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/become-chef" element={<ProtectedRoute><BecomeChef /></ProtectedRoute>} />
                <Route path="/become-delivery" element={<ProtectedRoute><BecomeDelivery /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
                <Route path="/settings/payments" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
                <Route path="/settings/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
                <Route path="/settings/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
                <Route path="/settings/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
                <Route path="/settings/language" element={<ProtectedRoute><Language /></ProtectedRoute>} />
                <Route path="/settings/appearance" element={<ProtectedRoute><Appearance /></ProtectedRoute>} />

                {/* Chef app (role-gated) */}
                <Route path="/chef" element={<RoleRoute roles={['chef']}><ChefDashboard /></RoleRoute>} />

                {/* Delivery app (role-gated) */}
                <Route path="/delivery" element={<RoleRoute roles={['delivery']}><DeliveryDashboard /></RoleRoute>} />

                {/* Admin app (role-gated) */}
                <Route path="/admin" element={<RoleRoute roles={['admin', 'superadmin']}><AdminDashboard /></RoleRoute>} />
                <Route path="/admin/users" element={<RoleRoute roles={['admin', 'superadmin']}><AdminUsers /></RoleRoute>} />
                <Route path="/admin/chefs" element={<RoleRoute roles={['admin', 'superadmin']}><AdminChefs /></RoleRoute>} />
                <Route path="/admin/orders" element={<RoleRoute roles={['admin', 'superadmin']}><AdminOrders /></RoleRoute>} />
                <Route path="/admin/coupons" element={<RoleRoute roles={['admin', 'superadmin']}><AdminCoupons /></RoleRoute>} />
              </Routes>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </DeviceModeProvider>
    </BrowserRouter>
  );
}

export default App;
