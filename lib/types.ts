export type ID = string;

export type SectionKey =
  | "hero"
  | "story"
  | "rooms"
  | "experiences"
  | "dining"
  | "spa"
  | "offers"
  | "gallery"
  | "events"
  | "testimonials"
  | "location"
  | "faq"
  | "newsletter";

export interface NavLink {
  label: string;
  href: string;
  image: string;
}

export interface SiteSettings {
  brand: {
    name: string;
    tagline: string;
    established: string;
    location: string;
    coordinates: string;
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    mapEmbed: string;
    instagram: string;
    facebook: string;
    youtube: string;
    currency: string;
    checkIn: string;
    checkOut: string;
  };
  theme: {
    accent: string; // brass / highlight
    ink: string; // primary dark
    paper: string; // background
    lagoon: string; // secondary
  };
  intro: {
    enabled: boolean;
    style: "curtain" | "counter" | "letters";
    text: string;
    subtext: string;
    duration: number; // seconds
    oncePerSession: boolean;
    image: string;
  };
  navbar: {
    showClock: boolean;
    showWeather: boolean;
    ctaLabel: string;
    links: NavLink[];
  };
  announcement: { enabled: boolean; text: string; link: string };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    image: string;
    video: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  story: {
    eyebrow: string;
    heading: string;
    body: string;
    image: string;
    imageAlt: string;
    stats: { value: string; label: string }[];
  };
  spa: {
    eyebrow: string;
    heading: string;
    body: string;
    image: string;
    rituals: { name: string; duration: string; price: number }[];
  };
  events: {
    eyebrow: string;
    heading: string;
    body: string;
    image: string;
  };
  sections: { id: SectionKey; label: string; enabled: boolean }[];
  seo: { title: string; description: string };
  footer: { note: string };
}

export interface Room {
  id: ID;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  size: number;
  guests: number;
  beds: string;
  view: string;
  images: string[];
  amenities: string[];
  inventory: number;
  featured: boolean;
  active: boolean;
}

export interface Experience {
  id: ID;
  title: string;
  category: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  featured: boolean;
  active: boolean;
}

export interface Dining {
  id: ID;
  name: string;
  cuisine: string;
  description: string;
  hours: string;
  image: string;
  signature: string;
  active: boolean;
}

export interface Offer {
  id: ID;
  title: string;
  description: string;
  badge: string;
  code: string;
  discount: number; // percent
  validTill: string;
  image: string;
  active: boolean;
}

export interface GalleryItem {
  id: ID;
  src: string;
  caption: string;
  category: string;
}

export interface Testimonial {
  id: ID;
  name: string;
  location: string;
  quote: string;
  rating: number;
  stay: string;
  active: boolean;
}

export interface Faq {
  id: ID;
  question: string;
  answer: string;
  category: string;
}

export interface Venue {
  id: ID;
  name: string;
  capacity: number;
  description: string;
  image: string;
}

export type BookingStatus = "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface Booking {
  id: ID;
  ref: string;
  guestId: ID;
  guestName: string;
  email: string;
  phone: string;
  roomId: ID;
  roomName: string;
  checkIn: string; // yyyy-mm-dd
  checkOut: string;
  adults: number;
  children: number;
  nights: number;
  total: number;
  offerCode: string;
  status: BookingStatus;
  payment: PaymentStatus;
  source: "website" | "phone" | "walk-in" | "ota" | "agent";
  requests: string;
  createdAt: string;
}

export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export interface Inquiry {
  id: ID;
  guestId: ID;
  name: string;
  email: string;
  phone: string;
  type: "general" | "wedding" | "corporate" | "spa" | "dining" | "stay";
  subject: string;
  message: string;
  stage: LeadStage;
  value: number;
  assignee: string;
  notes: { text: string; at: string }[];
  createdAt: string;
}

export interface Guest {
  id: ID;
  name: string;
  email: string;
  phone: string;
  city: string;
  tags: string[];
  vip: boolean;
  notes: string;
  createdAt: string;
}

export interface Subscriber {
  id: ID;
  email: string;
  createdAt: string;
}

export interface Activity {
  id: ID;
  kind: "booking" | "inquiry" | "subscriber" | "cms" | "crm";
  message: string;
  at: string;
}

export interface Database {
  settings: SiteSettings;
  rooms: Room[];
  experiences: Experience[];
  dining: Dining[];
  offers: Offer[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  faqs: Faq[];
  venues: Venue[];
  bookings: Booking[];
  inquiries: Inquiry[];
  guests: Guest[];
  subscribers: Subscriber[];
  activity: Activity[];
}

export type CollectionKey = Exclude<keyof Database, "settings">;

export const COLLECTIONS: CollectionKey[] = [
  "rooms",
  "experiences",
  "dining",
  "offers",
  "gallery",
  "testimonials",
  "faqs",
  "venues",
  "bookings",
  "inquiries",
  "guests",
  "subscribers",
  "activity",
];
