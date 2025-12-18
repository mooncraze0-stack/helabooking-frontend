
import React, { useState, useEffect } from 'react';
import { Ticket as TicketIcon, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { getBookingsByUserId, getEventById, getTicketsByBooking } from '../services/api';
import type { EnrichedBooking, Booking, Event, Ticket } from '../types';
import { useAuth } from '../hooks/useAuth';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import QRCode from 'react-qr-code';

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingTickets, setSelectedBookingTickets] = useState<Ticket[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const bookingData = await getBookingsByUserId(user.id);
        
        // Fetch event details for each booking
        const enrichedBookings = await Promise.all(
          bookingData.map(async (booking: Booking) => {
            try {
              const event: Event = await getEventById(String(booking.eventId));
              return { ...booking, event };
            } catch (eventError) {
              console.error(`Failed to fetch event ${booking.eventId}`, eventError);
              return { ...booking, event: undefined };
            }
          })
        );
        
        setBookings(enrichedBookings);
      } catch (err) {
        setError('Failed to fetch your bookings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const handleViewTickets = async (bookingId: number) => {
    setLoadingTickets(true);
    try {
      const tickets = await getTicketsByBooking(bookingId);
      setSelectedBookingTickets(tickets);
      setIsTicketModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
      alert('Failed to load tickets. Please try again.');
    } finally {
      setLoadingTickets(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 mb-4">
          <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
        </div>
        <p className="text-lg font-medium text-red-800 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 animate-fade-in">
      {/* Header Section */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-50 mb-2 sm:mb-3">My Bookings</h1>
        <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400">
          Manage your event tickets and bookings in one place
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-neutral-800 rounded-lg sm:rounded-xl shadow-elevation-1 border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <TicketIcon size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {bookings.filter((b) => b.status === 'CONFIRMED').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Total Tickets</p>
                  <p className="text-3xl font-bold text-primary dark:text-primary-light">
                    {bookings.reduce((sum, b) => sum + b.numberOfTickets, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light">
                  <TicketIcon size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Grid */}
          {bookings.map((booking) => (
            <div key={booking.id} className="group">
              <BookingCard booking={booking} />
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleViewTickets(booking.id)}
                  disabled={loadingTickets}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primary-light text-white dark:text-neutral-900 font-semibold rounded-lg hover:bg-primary-dark dark:hover:bg-primary/90 transition-all duration-200 shadow-elevation-1 hover:shadow-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TicketIcon size={16} />
                  {loadingTickets ? 'Loading...' : 'View Tickets'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-neutral-50 to-primary/5 dark:from-neutral-900 dark:to-primary/10 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-6">
            <AlertCircle className="text-neutral-600 dark:text-neutral-400" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">No Bookings Yet</h3>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
            You haven't booked any events yet. Start exploring and book your first event now!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary dark:bg-primary-light text-white dark:text-neutral-900 font-semibold rounded-lg hover:bg-primary-dark dark:hover:bg-primary/90 transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3"
          >
            <ExternalLink size={18} />
            Explore Events
          </Link>
        </div>
      )}

      {/* Tickets Modal */}
      <Modal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
        title="Your Tickets"
      >
        {selectedBookingTickets.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedBookingTickets.map((ticket) => (
              <div key={ticket.id} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg text-neutral-900 dark:text-neutral-50">{ticket.ticketNumber}</p>
                    {ticket.ticketType && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Type: {ticket.ticketType}</p>
                    )}
                    {ticket.price !== undefined && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Price: Rs. {ticket.price.toFixed(2)}</p>
                    )}
                  </div>
                  {ticket.isUsed && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs rounded-full font-semibold border border-green-300 dark:border-green-800">
                      <CheckCircle2 size={14} />
                      Used
                    </span>
                  )}
                </div>
                {ticket.qrCode && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">QR Code</p>
                    <div className="flex flex-col items-center">
                      {/* If backend returns a data URI, render it as an image; otherwise render a generated QR code */}
                      {ticket.qrCode.startsWith && ticket.qrCode.startsWith('data:') ? (
                        <img src={ticket.qrCode} alt={`${ticket.ticketNumber} QR`} className="w-40 h-40 object-contain" />
                      ) : (
                        <div className="p-2 bg-white rounded-md">
                          <QRCode value={ticket.qrCode} size={128} />
                        </div>
                      )}
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 break-all text-center">{ticket.qrCode}</p>
                    </div>
                  </div>
                )}
                {ticket.barcode && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 text-center">
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Barcode</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 break-all">{ticket.barcode}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-600 dark:text-neutral-400">No tickets available for this booking.</p>
        )}
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
