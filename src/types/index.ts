// =============================================
// FULLSHINE - Tipos TypeScript
// =============================================

export type UserRole = 'admin' | 'staff'
export type BookingStatus = 'pending' | 'payment_sent' | 'payment_received' | 'confirmed' | 'in_progress' | 'completed' | 'review_sent' | 'cancelled'
export type VehicleType = 'hatch_sedan' | 'suv_camioneta' | 'pickup_xl'
export type ServiceCategory = 'exterior' | 'interior' | 'full' | 'premium' | 'add_on'

// --- DATABASE TYPES ---

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string
  created_at: string
}

export interface Customer {
  id: string
  full_name: string
  email?: string
  phone: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  customer_id: string
  make: string
  model: string
  year: number
  color?: string
  license_plate?: string
  vehicle_type: VehicleType
  notes?: string
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface Service {
  id: string
  name: string
  description?: string
  category: ServiceCategory
  duration_minutes: number
  is_active: boolean
  created_at: string
  prices?: ServicePrice[]
}

export interface ServicePrice {
  id: string
  service_id: string
  vehicle_type: VehicleType
  price_clp: number
  promo_price_clp?: number
  promo_expires_at?: string
  created_at: string
  updated_at?: string
}

export interface Booking {
  id: string
  customer_id: string
  vehicle_id: string
  service_id: string
  assigned_to?: string
  status: BookingStatus
  scheduled_at: string
  estimated_end_at: string
  total_price: number
  notes?: string
  gcal_event_id?: string
  created_at: string
  updated_at: string
  customer?: Customer
  vehicle?: Vehicle
  service?: Service
  assigned_user?: User
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
  spots_left?: number
}

// --- FORM TYPES ---

export interface BookingFormData {
  // Step 1 - Customer
  customer_name: string
  customer_phone: string
  customer_email?: string
  // Step 2 - Vehicle
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_color?: string
  vehicle_license_plate?: string
  vehicle_type: VehicleType
  // Step 3 - Service
  service_id: string
  // Step 4 - Date/Time
  scheduled_date: string
  scheduled_time: string
  // Extra
  notes?: string
}

export interface CreateBookingInput {
  customer: {
    full_name: string
    phone: string
    email?: string
  }
  vehicle: {
    make: string
    model: string
    year: number
    color?: string
    license_plate?: string
    vehicle_type: VehicleType
  }
  service_id: string
  scheduled_at: string
  notes?: string
}

// --- API RESPONSE TYPES ---

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface AvailableSlotsResult {
  date: string
  slots: TimeSlot[]
}

// --- ADMIN TYPES ---

export interface DashboardStats {
  bookings_today: number
  bookings_week: number
  revenue_month: number
  finalized_month: number
  avg_ticket_month: number
  pending_bookings: number
  confirmed_bookings: number
}

export interface BookingWithRelations extends Booking {
  customer: Customer
  vehicle: Vehicle
  service: Service
}
