import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Download, Printer, CheckCircle, Home, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Ticket from '../components/Ticket';
import bookingService from '../services/bookingService';
import busService from '../services/busService';

const TicketPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const ticketRef = useRef(null);

  const [booking, setBooking] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBooking = async () => {
      try {
        const result = await bookingService.getBooking(bookingId);
        const bookingData = result.booking || result;
        setBooking(bookingData);

        if (bookingData.busId && bookingData.journeyDate && bookingData.departureTime) {
          const seatsResult = await busService.getBookedSeats(
            bookingData.busId,
            bookingData.journeyDate,
            bookingData.departureTime
          );
          setBookedSeats(seatsResult.bookedSeats || []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load ticket. It may not exist or you don't have permission.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, isAuthenticated, navigate]);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !booking) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`BusGo-Ticket-${booking.ticketNumber || bookingId}.pdf`);
    } catch (err) {
      console.error('PDF Error:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-red-600 mb-6">{error || 'Ticket not found'}</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/profile')} className="flex-1 py-3 border border-gray-300 rounded-xl">
              Back to Profile
            </button>
            <button onClick={() => navigate('/')} className="flex-1 py-3 bg-orange-500 text-white rounded-xl">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (booking.paymentStatus !== 'completed' || booking.bookingStatus !== 'confirmed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Ticket Not Ready</h2>
          <p className="text-gray-600 mb-6">
            This booking is not yet confirmed. Please complete payment first.
          </p>
          <button onClick={() => navigate(`/payment/${bookingId}`)} className="w-full py-3 bg-orange-500 text-white rounded-xl mb-3">
            Go to Payment
          </button>
          <button onClick={() => navigate('/profile')} className="w-full py-3 border border-gray-300 rounded-xl">
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800">Booking Confirmed Successfully!</h1>
          <p className="text-green-700 mt-2">Your ticket is ready. You can download or print it below.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10 print:hidden">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-medium disabled:opacity-70"
          >
            {downloading ? 'Downloading...' : 'Download PDF'}
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-2xl font-medium"
          >
            Print Ticket
            <Printer className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-10">
          <Ticket ref={ticketRef} booking={booking} bookedSeats={bookedSeats} />
        </div>

        <div className="flex justify-center gap-6 print:hidden">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <User className="w-5 h-5" />
            View All Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
