import { forwardRef } from 'react';
import {
  Bus,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Ticket as TicketIcon,
  MapPin,
  CreditCard,
  CheckCircle
} from 'lucide-react';

const generateSeatLayout = () => {
  const seats = [];

  for (let row = 1; row <= 11; row++) {
    seats.push({ id: `${row}A`, row, col: 'A' });
    seats.push({ id: `${row}B`, row, col: 'B' });
    seats.push({ id: `${row}C`, row, col: 'C' });
    seats.push({ id: `${row}D`, row, col: 'D' });
  }

  return seats.slice(0, 42);
};

const Ticket = forwardRef(({ booking, bookedSeats = [] }, ref) => {
  const userSeats = booking.seats || [];
  const allBookedSeats = Array.from(new Set([...bookedSeats, ...userSeats]));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const seats = generateSeatLayout();
  const seatsByRow = [];

  for (let i = 0; i < seats.length; i += 4) {
    seatsByRow.push(seats.slice(i, i + 4));
  }

  const getSeatClass = (seatId) => {
    const baseClass =
      'h-9 w-9 sm:h-10 sm:w-10 rounded-t-lg rounded-b-sm border-2 flex items-center justify-center text-[10px] sm:text-xs font-bold';

    if (userSeats.includes(seatId)) {
      return `${baseClass} bg-orange-500 border-orange-600 text-white ring-2 ring-orange-200`;
    }

    if (allBookedSeats.includes(seatId)) {
      return `${baseClass} bg-red-500 border-red-600 text-white`;
    }

    return `${baseClass} bg-green-50 border-green-500 text-green-700`;
  };

  const details = [
    { label: 'Bus Name', value: booking.busName, icon: Bus },
    { label: 'Bus Number', value: booking.busNumber, icon: TicketIcon },
    { label: 'Journey Date', value: formatDate(booking.journeyDate), icon: Calendar },
    { label: 'Departure Time', value: booking.departureTime, icon: Clock },
    { label: 'Passenger', value: booking.passengerName, icon: User },
    { label: 'Phone', value: booking.passengerPhone, icon: Phone },
    { label: 'Email', value: booking.passengerEmail, icon: Mail },
    { label: 'Payment', value: `${booking.paymentStatus} (${booking.paymentMethod || 'wallet'})`, icon: CreditCard }
  ];

  return (
    <div ref={ref} className="mx-auto w-full max-w-xl bg-white print:max-w-full">
      <div className="overflow-hidden rounded-2xl border-2 border-primary shadow-xl print:shadow-none">
        <div className="bg-primary px-5 py-5 text-white sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Bus className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-white/70">BusGo E-Ticket</p>
                <h1 className="text-2xl font-bold">Confirmed Ticket</h1>
              </div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 sm:text-right">
              <p className="text-xs uppercase text-white/70">Ticket Number</p>
              <p className="break-all font-mono text-sm font-bold sm:text-base">{booking.ticketNumber}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-7">
          <div className="rounded-xl border border-dashed border-gray-300 p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="text-xl font-bold text-primary">{booking.startPoint}</p>
              </div>
              <div className="flex flex-col items-center text-secondary">
                <MapPin className="h-5 w-5" />
                <div className="mt-1 h-px w-10 bg-secondary sm:w-16"></div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">To</p>
                <p className="text-xl font-bold text-primary">{booking.destination}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-gray-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
                  <Icon className="h-4 w-4 text-secondary" />
                  {label}
                </div>
                <p className="break-words text-sm font-semibold text-gray-800">{value || 'N/A'}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-orange-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Your Seats</p>
                <p className="text-2xl font-bold text-secondary">{userSeats.join(', ')}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-secondary">৳{booking.totalAmount}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
                <TicketIcon className="h-5 w-5 text-secondary" />
                Seat Map
              </h2>
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-sm bg-green-50 ring-1 ring-green-500"></span>
                  Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-sm bg-red-500"></span>
                  Booked
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-sm bg-orange-500"></span>
                  Your seat
                </span>
              </div>
            </div>

            <div className="mx-auto max-w-sm rounded-2xl border-2 border-gray-200 bg-gray-50 p-3 sm:p-4">
              <div className="rounded-t-3xl bg-primary/10 p-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="rounded-lg bg-gray-500 px-2 py-2 font-bold text-white">DRV</div>
                  <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                  <div className="rounded-lg bg-gray-500 px-2 py-2 font-bold text-white">HLP</div>
                </div>
                <div className="mt-2 flex justify-center">
                  <div className="rounded-lg bg-gray-500 px-2 py-2 text-xs font-bold text-white">SUP</div>
                </div>
              </div>

              <div className="flex justify-end py-2">
                <span className="rounded bg-primary px-3 py-1 text-xs font-semibold text-white">Entrance</span>
              </div>

              <div className="rounded-xl bg-white p-3">
                <div className="space-y-2">
                  {seatsByRow.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center justify-center gap-2">
                      <div className="flex gap-1">
                        {row.slice(0, 2).map((seat) => (
                          <div key={seat.id} className={getSeatClass(seat.id)}>
                            {seat.id}
                          </div>
                        ))}
                      </div>

                      <div className="w-6 sm:w-8"></div>

                      <div className="flex gap-1">
                        {row.slice(2, 4).map((seat) => (
                          <div key={seat.id} className={getSeatClass(seat.id)}>
                            {seat.id}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-4 rounded-b-xl bg-gray-200"></div>
            </div>
          </div>
        </div>

        <div className="border-t bg-gray-50 px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-2 font-semibold text-green-700">
              <CheckCircle className="h-4 w-4" />
              {booking.bookingStatus?.toUpperCase()}
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Please bring a valid ID and arrive at least 15 minutes before departure.
          </p>
        </div>
      </div>
    </div>
  );
});

Ticket.displayName = 'Ticket';

export default Ticket;
