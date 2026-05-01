import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bus, AlertCircle } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import BusCard from '../components/BusCard';
import busService from '../services/busService';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  useEffect(() => {
    const fetchBuses = async () => {
      if (!from || !to) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await busService.searchBuses(from, to, date, time);
        setBuses(result.buses || []);
      } catch (err) {
        setError('বাস তথ্য আনা যায়নি। আবার চেষ্টা করুন।');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [from, to, date, time]);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <SearchForm className="mb-8" />

        {from && to && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">
              {from} থেকে {to} যাওয়ার বাস
            </h1>
            {date ? (
              <p className="text-gray-600">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {time && ` | পছন্দের সময়: ${time}`}
              </p>
            ) : (
              <p className="text-gray-600">
                এই রুটের সব বাস দেখানো হচ্ছে। উপরে তারিখ ও সময় নির্বাচন করে সার্চ করুন।
              </p>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">বাস খোঁজা হচ্ছে...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!from && !to && !loading && (
          <div className="text-center py-16">
            <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">বাস খুঁজুন</h2>
            <p className="text-gray-500">
              উপলভ্য বাস দেখতে উপরের কোথা থেকে ও কোথায় তথ্য দিন
            </p>
          </div>
        )}

        {!loading && !error && from && to && buses.length === 0 && (
          <div className="text-center py-16">
            <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">কোনো বাস পাওয়া যায়নি</h2>
            <p className="text-gray-500">
              এই রুটে কোনো বাস পাওয়া যায়নি। অন্য রুট দিয়ে চেষ্টা করুন।
            </p>
          </div>
        )}

        {!loading && !error && buses.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">{buses.length}টি বাস পাওয়া গেছে</p>
            {buses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                date={date}
                selectedTime={time}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
