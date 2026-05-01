import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search, ArrowRightLeft } from 'lucide-react';

const locations = [
  'Dhaka',
  'Chittagong',
  'Sylhet',
  "Cox's Bazar",
  'Rajshahi',
  'Khulna',
  'Rangpur'
];

const SearchForm = ({ className = '' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [time, setTime] = useState(searchParams.get('time') || '');

  const handleSwapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) {
      alert('অনুগ্রহ করে কোথা থেকে, কোথায় এবং তারিখ ঘর পূরণ করুন');
      return;
    }
    navigate(`/search?from=${from}&to=${to}&date=${date}&time=${time}`);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* From */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">কোথা থেকে</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition text-gray-900 bg-white appearance-none cursor-pointer"
              required
            >
              <option value="" className="text-gray-500">যাত্রা শুরুর স্থান নির্বাচন করুন</option>
              {locations.map((loc) => (
                <option key={loc} value={loc} disabled={loc === to} className="text-gray-900">
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <button
          type="button"
          onClick={handleSwapLocations}
          className="hidden lg:flex items-center justify-center w-10 h-10 bg-secondary text-white rounded-full hover:bg-orange-600 transition-colors mx-auto mb-1"
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>

        {/* To */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">কোথায়</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition text-gray-900 bg-white appearance-none cursor-pointer"
              required
            >
              <option value="" className="text-gray-500">গন্তব্য নির্বাচন করুন</option>
              {locations.map((loc) => (
                <option key={loc} value={loc} disabled={loc === from} className="text-gray-900">
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">তারিখ</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition text-gray-900 bg-white"
              required
              placeholder="mm/dd/yyyy"
            />
          </div>
        </div>

        {/* Time (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">পছন্দের সময়</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="w-full mt-6 bg-secondary text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        বাস খুঁজুন
      </button>
    </form>
  );
};

export default SearchForm;
