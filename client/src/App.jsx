import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Chatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import SelectSeats from './pages/SelectSeats';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import TicketPage from './pages/TicketPage';
import Profile from './pages/Profile';
import TakaDhukan from './pages/TakaDhukan';
import AdminRegister from './pages/AdminRegister';
import AdminTopupRequests from './pages/AdminTopupRequests';
import AdminDashboard from './pages/AdminDashboard';   // New Admin Homepage

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/select-seats/:busId" element={<SelectSeats />} />
              <Route path="/admin/register" element={<AdminRegister />} />

              {/* Payment Callbacks */}
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />

              {/* User Protected Routes */}
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/ticket/:bookingId" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/taka-dhukan" element={<ProtectedRoute><TakaDhukan /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/topup-requests" element={<AdminRoute><AdminTopupRequests /></AdminRoute>} />

              {/* 404 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-800">404</h1>
                    <p className="text-xl mt-4">Page not found</p>
                    <button onClick={() => window.location.href = '/'} className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg">
                      Go Home
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;