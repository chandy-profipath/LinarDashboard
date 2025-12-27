export interface Truck {
  id: string;
  tuuid: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  engine_capacity: string;
  horsepower: number;
  color: string;
  vin: string;
  description: string;
  status: 'available' | 'sold' | 'reserved';
  main_image: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  image5: string;
  image6: string;
  image7: string;
  image8: string;
  image9: string;
  features?: string[];
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: 'truck_purchase' | 'parcel_delivery' | 'international_shipping';
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  admin_reply: string | null;
  replied_at: string | null;
  truck_id: string | null;
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  last_login: string | null;
}

export interface DashboardStats {
  totalTrucks: number;
  availableTrucks: number;
  soldTrucks: number;
  totalInquiries: number;
  pendingInquiries: number;
  totalRevenue: number;
}

export const TRUCK_BRANDS = [
  'Volvo',
  'Mercedes-Benz',
  'Scania',
  'MAN',
  'Freightliner',
  'Peterbilt',
  'Kenworth',
  'DAF',
  'IVECO',
  'Renault',
  'Mack',
  'International',
  'Western Star',
  'Hino',
  'Isuzu',
  'Custom'
] as const;

export const FUEL_TYPES = ['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'Natural Gas'] as const;
export const TRANSMISSIONS = ['Automatic', 'Manual', 'Semi-Automatic'] as const;
export const TRUCK_STATUS = ['available', 'sold', 'reserved'] as const;
export const SERVICE_TYPES = ['truck_purchase', 'parcel_delivery', 'international_shipping'] as const;
