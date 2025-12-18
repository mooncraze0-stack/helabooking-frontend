export type UserRole = 'USER' | 'AUDITOR' | 'ADMIN';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type RecurrencePattern = 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
export type TicketType = 'FREE' | 'PAID' | 'VIP' | 'GROUP';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: number;
  username: string;
  email: string;
  role?: UserRole;
  active?: boolean;
}

export interface AuthUser extends User {
  token: string;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  location: string;
  venue?: string;
  agenda?: string;
  categories?: string;
  eventDate: number[] | string;
  endDate?: number[] | string;
  capacity: number;
  availableSeats: number;
  status?: EventStatus;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  isMultiSession?: boolean;
}

export interface Booking {
  id: number;
  userId: number;
  eventId: number;
  numberOfTickets: number;
  ticketType?: TicketType;
  pricePerTicket?: number;
  totalPrice?: number;
  status: BookingStatus;
  createdAt: number[];
}

export interface EnrichedBooking extends Booking {
  event?: Event;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  bookingId: number;
  userId: number;
  eventId: number;
  qrCode?: string;
  barcode?: string;
  createdAt?: number[];
  ticketType?: TicketType;
  price?: number;
  isUsed?: boolean;
  usedAt?: number[];
}

declare global {
  interface Window {
    _env_?: {
      [key: string]: string;
    };
  }
}
