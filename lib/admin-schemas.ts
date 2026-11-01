import type { CollectionKey } from "./types";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "image" | "images" | "tags" | "date";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  hint?: string;
  half?: boolean;
  required?: boolean;
}

export interface ResourceSchema {
  key: CollectionKey;
  title: string;
  singular: string;
  subtitle: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  /** field toggled from the list ("active"/"featured") */
  toggleField?: string;
  priceField?: string;
  layout: "cards" | "list" | "grid";
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

export const SCHEMAS: Record<string, ResourceSchema> = {
  rooms: {
    key: "rooms",
    title: "Rooms & Villas",
    singular: "Room",
    subtitle: "Room types shown on the website and available for booking",
    titleField: "name",
    subtitleField: "tagline",
    imageField: "images",
    toggleField: "active",
    priceField: "price",
    layout: "cards",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "URL slug", type: "text", hint: "Auto-generated from the name", half: true },
      { key: "category", label: "Category", type: "select", options: ["Villa", "Suite", "Residence", "Room"], half: true },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "price", label: "Price / night (₹)", type: "number", half: true },
      { key: "inventory", label: "Units (keys)", type: "number", half: true },
      { key: "size", label: "Size (m²)", type: "number", half: true },
      { key: "guests", label: "Max guests", type: "number", half: true },
      { key: "beds", label: "Beds", type: "text", half: true },
      { key: "view", label: "View", type: "text", half: true },
      { key: "images", label: "Images", type: "images", hint: "First image is the cover" },
      { key: "amenities", label: "Amenities", type: "tags" },
      { key: "featured", label: "Featured on homepage", type: "boolean", half: true },
      { key: "active", label: "Visible & bookable", type: "boolean", half: true },
    ],
    defaults: { name: "", slug: "", category: "Villa", tagline: "", description: "", price: 20000, size: 60, guests: 2, beds: "1 King", view: "Garden", images: [], amenities: [], inventory: 4, featured: false, active: true },
  },
  experiences: {
    key: "experiences",
    title: "Experiences",
    singular: "Experience",
    subtitle: "Activities and excursions",
    titleField: "title",
    subtitleField: "category",
    imageField: "image",
    toggleField: "active",
    priceField: "price",
    layout: "cards",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "category", label: "Category", type: "select", options: ["Ocean", "Forest", "Wellness", "Culture", "Family"], half: true },
      { key: "duration", label: "Duration", type: "text", half: true },
      { key: "price", label: "Price (₹)", type: "number", half: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
      { key: "featured", label: "Featured", type: "boolean", half: true },
      { key: "active", label: "Visible", type: "boolean", half: true },
    ],
    defaults: { title: "", category: "Ocean", description: "", duration: "2 hrs", price: 0, image: "", featured: false, active: true },
  },
  dining: {
    key: "dining",
    title: "Dining",
    singular: "Restaurant",
    subtitle: "Restaurants, bars and cafés",
    titleField: "name",
    subtitleField: "cuisine",
    imageField: "image",
    toggleField: "active",
    layout: "cards",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "cuisine", label: "Cuisine", type: "text", half: true },
      { key: "hours", label: "Hours", type: "text", half: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "signature", label: "Signature dish", type: "text" },
      { key: "image", label: "Image", type: "image" },
      { key: "active", label: "Visible", type: "boolean" },
    ],
    defaults: { name: "", cuisine: "", description: "", hours: "", image: "", signature: "", active: true },
  },
  offers: {
    key: "offers",
    title: "Offers",
    singular: "Offer",
    subtitle: "Packages & promo codes — codes are validated at checkout",
    titleField: "title",
    subtitleField: "code",
    imageField: "image",
    toggleField: "active",
    layout: "cards",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "badge", label: "Badge", type: "text", half: true },
      { key: "code", label: "Promo code", type: "text", half: true },
      { key: "discount", label: "Discount %", type: "number", half: true },
      { key: "validTill", label: "Valid till", type: "date", half: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
      { key: "active", label: "Active", type: "boolean" },
    ],
    defaults: { title: "", description: "", badge: "", code: "", discount: 10, validTill: "", image: "", active: true },
  },
  gallery: {
    key: "gallery",
    title: "Gallery",
    singular: "Photo",
    subtitle: "Images for the gallery page & homepage mosaic",
    titleField: "caption",
    subtitleField: "category",
    imageField: "src",
    layout: "grid",
    fields: [
      { key: "src", label: "Image", type: "image", required: true },
      { key: "caption", label: "Caption", type: "text" },
      { key: "category", label: "Category", type: "select", options: ["Resort", "Rooms", "Dining", "Spa", "Experiences", "Events"] },
    ],
    defaults: { src: "", caption: "", category: "Resort" },
  },
  testimonials: {
    key: "testimonials",
    title: "Testimonials",
    singular: "Testimonial",
    subtitle: "Guest reviews shown on the homepage",
    titleField: "name",
    subtitleField: "quote",
    toggleField: "active",
    layout: "list",
    fields: [
      { key: "name", label: "Guest name", type: "text", required: true, half: true },
      { key: "location", label: "From", type: "text", half: true },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "stay", label: "Stayed in", type: "text", half: true },
      { key: "rating", label: "Rating (1–5)", type: "number", half: true },
      { key: "active", label: "Visible", type: "boolean" },
    ],
    defaults: { name: "", location: "", quote: "", rating: 5, stay: "", active: true },
  },
  faqs: {
    key: "faqs",
    title: "FAQs",
    singular: "Question",
    subtitle: "Frequently asked questions",
    titleField: "question",
    subtitleField: "answer",
    layout: "list",
    fields: [
      { key: "question", label: "Question", type: "text", required: true },
      { key: "answer", label: "Answer", type: "textarea" },
      { key: "category", label: "Category", type: "select", options: ["Stay", "Booking", "Travel", "Events", "Dining", "Spa"] },
    ],
    defaults: { question: "", answer: "", category: "Stay" },
  },
  venues: {
    key: "venues",
    title: "Venues",
    singular: "Venue",
    subtitle: "Wedding & event spaces",
    titleField: "name",
    subtitleField: "description",
    imageField: "image",
    layout: "cards",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "capacity", label: "Capacity", type: "number" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
    ],
    defaults: { name: "", capacity: 100, description: "", image: "" },
  },
};
