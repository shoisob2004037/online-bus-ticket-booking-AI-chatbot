import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Bus, Wifi, Zap, Wind, Coffee, ChevronDown, ChevronUp, Users, Star, ArrowRight } from 'lucide-react';

const amenityIcons = {
  'AC': Wind,
  'WiFi': Wifi,
  'Charging Port': Zap,
  'Snacks': Coffee
};

const BusCard = ({ bus, date, selectedTime }) => {
  const navigate = useNavigate();
  const [showAllTimes, setShowAllTimes] = useState(false);

  const handleSelectBus = (departureTime) => {
    if (!date) {
      alert('সিট নির্বাচন করতে আগে উপরের সার্চ ফর্ম থেকে তারিখ নির্বাচন করুন।');
      return;
    }

    navigate(`/select-seats/${bus.id}?date=${date}&time=${departureTime}`);
  };

  const departureTimes = bus.availableDepartureTimes || bus.departureTimes;
  const displayedTimes = showAllTimes ? departureTimes : departureTimes.slice(0, 4);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden">
      {/* Top Accent Bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
      
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Bus Info Section */}
          <div className="flex-1">
            {/* Header with Bus Name */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <Bus className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-xl text-gray-900">{bus.busName}</h3>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {bus.busType}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">{bus.busNumber}</p>
                {/* Rating */}
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-gray-700">4.5</span>
                  <span className="text-xs text-gray-400">(১২০ রিভিউ)</span>
                </div>
              </div>
            </div>

            {/* Route Display */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20"></div>
                  <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-secondary"></div>
                  <div className="w-3 h-3 bg-secondary rounded-full ring-4 ring-secondary/20"></div>
                </div>
                <div className="flex-1">
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">থেকে</p>
                    <p className="font-semibold text-gray-900">{bus.startPoint}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">পর্যন্ত</p>
                    <p className="font-semibold text-gray-900">{bus.destination}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{bus.duration}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex items-center gap-2 flex-wrap">
              {bus.amenities?.map((amenity) => {
                const Icon = amenityIcons[amenity] || Wind;
                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span>{amenity}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>{bus.totalSeats || 42} সিট</span>
              </div>
            </div>
          </div>

          {/* Divider for larger screens */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent self-stretch"></div>

          {/* Price & Time Selection */}
          <div className="lg:w-72">
            {/* Price Display */}
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 mb-4 text-center lg:text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">শুরু</p>
              <div className="flex items-baseline justify-center lg:justify-end gap-1">
                <span className="text-3xl font-bold text-secondary">৳{bus.ticketPrice}</span>
                <span className="text-sm text-gray-500">/সিট</span>
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                যাত্রার সময় নির্বাচন করুন
              </p>
              <div className="flex flex-wrap gap-2">
                {displayedTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleSelectBus(time)}
                    className={`group/btn relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                      selectedTime === time
                        ? 'bg-gradient-to-r from-secondary to-secondary/90 text-white shadow-lg shadow-secondary/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 hover:text-white hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'
                    }`}
                  >
                    {time}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-200" />
                  </button>
                ))}
              </div>
              
              {/* Show More/Less Button */}
              {departureTimes.length > 4 && (
                <button
                  onClick={() => setShowAllTimes(!showAllTimes)}
                  className="mt-3 w-full py-2 text-sm font-medium text-primary hover:text-white bg-primary/5 hover:bg-primary rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {showAllTimes ? (
                    <>
                      কম দেখান <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      আরও {departureTimes.length - 4}টি সময় দেখুন <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
