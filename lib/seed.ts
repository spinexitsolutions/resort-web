import type { Booking, Database, Guest, Inquiry, LeadStage } from "./types";

export const u = (id: string, w = 1800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const IMG = {
  heroPool: u("1520250497591-112f2f40a3f4", 2400),
  beachVilla: u("1499793983690-e29da59ef1c2"),
  lakeJetty: u("1439066615861-d1af74d74000"),
  rooftop: u("1445019980597-93fa8acb246c"),
  mountains: u("1464822759023-fed622ff2c3b"),
  lakeCabin: u("1470770841072-f978cf4d019e"),
  sunsetSea: u("1475924156734-496f6cac6ec1"),
  lagoonBoat: u("1501785888041-af3ef285b470"),
  classicBed: u("1505693416388-ac5ce068fe85"),
  cloudPeaks: u("1506905925346-21bda4d32df4"),
  beach: u("1507525428034-b723cf961d3e"),
  cove: u("1510414842594-a61c69b5ae57"),
  tableSetting: u("1511795409834-ef04bbd61622"),
  oilDrop: u("1515377905703-c4788e51af15"),
  bar: u("1517248135467-4c7edcad34c4"),
  ballroom: u("1519167758481-83f550bb49b3"),
  fineDining: u("1414235077428-338989a2e8c0"),
  brunch: u("1533777857889-4be7c70b33f7"),
  cliffResort: u("1540541338287-41700207dee6"),
  nightPool: u("1542314831-068cd1dbfeeb"),
  infinity: u("1543489822-c49534f3271f"),
  cafe: u("1544148103-0773bf10d330"),
  massage: u("1544161515-4ab6ce6db874"),
  duskPool: u("1551882547-ff40c63fe5fa"),
  seaTerrace: u("1559339352-11d035aa65de"),
  whiteVilla: u("1564501049412-61c2a3083791"),
  deckLodge: u("1566073771259-6a8506099945"),
  mosaicPool: u("1571896349842-33c89424de2d"),
  glassRoom: u("1578683010236-d716f9a3f461"),
  deckSea: u("1582719508461-905c673771fd"),
  infinityDeck: u("1584132967334-10e028bd69f7"),
  heritage: u("1590490360182-c33d57733427"),
  skyBed: u("1596394516093-501ba68a0ba6"),
  palmsPool: u("1600011689032-8b628b8a8747"),
  hotStone: u("1600334089648-b0d9d3028eb2"),
  overwater: u("1573843981267-be1999ff37cd"),
  overwaterInterior: u("1602002418082-a4443e081dd1"),
  jetty: u("1505881502353-a1986add3762", 2400),
  teakRoom: u("1611892440504-42a792e24d32"),
  modernRoom: u("1618773928121-c32242e63f39"),
  brightRoom: u("1631049307264-da0ec9d70304"),
};
export { IMG };

// deterministic PRNG so the seed is stable
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export function buildSeed(): Database {
  const now = new Date();
  const rand = rng(42);
  const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];

  const rooms: Database["rooms"] = [
    {
      id: "r1",
      slug: "lagoon-overwater-villa",
      name: "Lagoon Overwater Villa",
      category: "Villa",
      tagline: "Sleep above the tide.",
      description:
        "Suspended over a glass-clear lagoon, each villa opens onto a private deck with a ladder straight into the sea. Glass floor panels reveal reef life below, and an outdoor rain shower frames the horizon.",
      price: 48000,
      size: 120,
      guests: 2,
      beds: "1 King",
      view: "Lagoon",
      images: [IMG.overwater, IMG.beachVilla, IMG.lagoonBoat],
      amenities: ["Private plunge pool", "Glass floor", "Butler service", "Sunset deck", "Outdoor shower", "Snorkel kit"],
      inventory: 6,
      featured: true,
      active: true,
    },
    {
      id: "r2",
      slug: "forest-canopy-suite",
      name: "Forest Canopy Suite",
      category: "Suite",
      tagline: "A treehouse, re-imagined.",
      description:
        "Hand-built in reclaimed teak and stone, the Canopy Suite sits among century-old rain trees. Wake to birdsong, bathe in a copper tub and watch the mist lift from the forest floor.",
      price: 32000,
      size: 85,
      guests: 3,
      beds: "1 King + Daybed",
      view: "Rainforest",
      images: [IMG.teakRoom, IMG.glassRoom, IMG.deckLodge],
      amenities: ["Copper soaking tub", "Canopy balcony", "Record player", "Minibar", "Rain shower", "Yoga mat"],
      inventory: 8,
      featured: true,
      active: true,
    },
    {
      id: "r3",
      slug: "infinity-pool-residence",
      name: "Infinity Pool Residence",
      category: "Residence",
      tagline: "Your own edge of the world.",
      description:
        "Two bedrooms, a sprawling sun deck and a 14-metre infinity pool that seems to spill into the Andaman Sea. Ideal for families or friends travelling together, with a private chef on request.",
      price: 76000,
      size: 240,
      guests: 5,
      beds: "2 King",
      view: "Ocean",
      images: [IMG.deckSea, IMG.infinityDeck, IMG.duskPool],
      amenities: ["14m infinity pool", "Private chef", "Two bedrooms", "Media lounge", "Butler service", "Garden courtyard"],
      inventory: 3,
      featured: true,
      active: true,
    },
    {
      id: "r4",
      slug: "cliffside-sky-suite",
      name: "Cliffside Sky Suite",
      category: "Suite",
      tagline: "Clouds for neighbours.",
      description:
        "Perched on the headland, the Sky Suite has a bed that rolls out onto an open deck so you can sleep beneath the stars. Floor-to-ceiling glass on three sides keeps the view yours, all day.",
      price: 39000,
      size: 95,
      guests: 2,
      beds: "1 King",
      view: "Headland",
      images: [IMG.skyBed, IMG.rooftop, IMG.cloudPeaks],
      amenities: ["Star deck", "Telescope", "Fireplace", "Freestanding tub", "Espresso bar", "Bose audio"],
      inventory: 4,
      featured: false,
      active: true,
    },
    {
      id: "r5",
      slug: "garden-pavilion",
      name: "Garden Pavilion",
      category: "Room",
      tagline: "Quiet, light and green.",
      description:
        "Our most intimate room opens onto a frangipani garden. Linen, limestone and soft morning light — everything you need, nothing you don't.",
      price: 18500,
      size: 52,
      guests: 2,
      beds: "1 King or 2 Twin",
      view: "Garden",
      images: [IMG.brightRoom, IMG.modernRoom, IMG.classicBed],
      amenities: ["Garden terrace", "Rain shower", "Smart TV", "Minibar", "Work desk", "Daily breakfast"],
      inventory: 14,
      featured: false,
      active: true,
    },
    {
      id: "r6",
      slug: "heritage-planters-suite",
      name: "Heritage Planter's Suite",
      category: "Suite",
      tagline: "Colonial charm, island soul.",
      description:
        "Inspired by the old spice planters' bungalows, with four-poster beds, antique rosewood and a wraparound verandah — restored for the way we travel now.",
      price: 27500,
      size: 78,
      guests: 3,
      beds: "1 Four-poster King",
      view: "Courtyard",
      images: [IMG.heritage, IMG.classicBed, IMG.whiteVilla],
      amenities: ["Wraparound verandah", "Writing desk", "Clawfoot tub", "Afternoon tea", "Library", "Minibar"],
      inventory: 6,
      featured: false,
      active: true,
    },
  ];

  const guestsSeed = [
    ["Aarav Mehta", "Mumbai"],
    ["Ishita Kapoor", "Delhi"],
    ["Rohan Iyer", "Bengaluru"],
    ["Sara Thomas", "Kochi"],
    ["Kabir Singh", "Chandigarh"],
    ["Meera Nair", "Chennai"],
    ["Vihaan Shah", "Ahmedabad"],
    ["Ananya Rao", "Hyderabad"],
    ["Daniel Brooks", "London"],
    ["Emma Laurent", "Paris"],
    ["Arjun Malhotra", "Gurugram"],
    ["Priya Desai", "Pune"],
    ["Liam Chen", "Singapore"],
    ["Nikhil Verma", "Jaipur"],
    ["Zoya Khan", "Lucknow"],
    ["Tara Banerjee", "Kolkata"],
  ];
  const guests: Guest[] = guestsSeed.map(([name, city], i) => ({
    id: `g${i + 1}`,
    name,
    email: name.toLowerCase().replace(/[^a-z]+/g, ".") + "@example.com",
    phone: `+91 9${String(800000000 + Math.floor(rand() * 199999999)).slice(0, 9)}`,
    city,
    tags: i % 4 === 0 ? ["Repeat", "Honeymoon"] : i % 3 === 0 ? ["Family"] : i % 5 === 0 ? ["Corporate"] : [],
    vip: i % 4 === 0,
    notes: i % 4 === 0 ? "Prefers lagoon-facing villas. Allergic to shellfish." : "",
    createdAt: addDays(now, -120 + i * 5).toISOString(),
  }));

  const statuses: Booking["status"][] = ["confirmed", "confirmed", "pending", "checked-out", "checked-in", "cancelled"];
  const sources: Booking["source"][] = ["website", "website", "website", "phone", "ota", "agent", "walk-in"];
  const bookings: Booking[] = [];
  for (let i = 0; i < 78; i++) {
    const g = guests[i % guests.length];
    const room = pick(rooms);
    const offset = i < 16 ? -Math.floor(rand() * 3) : Math.floor(rand() * 230) - 170; // in-house now, or -170..+60 days
    const nights = 2 + Math.floor(rand() * 5);
    const checkIn = addDays(now, offset);
    const checkOut = addDays(checkIn, nights);
    let status: Booking["status"];
    if (offset + nights < 0) status = rand() > 0.1 ? "checked-out" : "cancelled";
    else if (offset <= 0) status = "checked-in";
    else status = pick(statuses.filter((s) => s !== "checked-in" && s !== "checked-out"));
    const adults = 1 + Math.floor(rand() * Math.min(2, room.guests));
    bookings.push({
      id: `b${i + 1}`,
      ref: `ARN-${(4210 + i * 7).toString(36).toUpperCase()}`,
      guestId: g.id,
      guestName: g.name,
      email: g.email,
      phone: g.phone,
      roomId: room.id,
      roomName: room.name,
      checkIn: iso(checkIn),
      checkOut: iso(checkOut),
      adults,
      children: rand() > 0.75 ? 1 : 0,
      nights,
      total: room.price * nights,
      offerCode: "",
      status,
      payment: status === "checked-out" ? "paid" : status === "pending" ? "unpaid" : rand() > 0.5 ? "paid" : "partial",
      source: pick(sources),
      requests: rand() > 0.7 ? "Airport transfer & late check-in" : "",
      createdAt: addDays(checkIn, -(5 + Math.floor(rand() * 40))).toISOString(),
    });
  }

  const stages: LeadStage[] = ["new", "new", "contacted", "qualified", "proposal", "won", "lost"];
  const inquiryTemplates: Pick<Inquiry, "type" | "subject" | "message" | "value">[] = [
    { type: "wedding", subject: "Beach wedding for 150 guests", message: "We're planning a sunset ceremony in February. Can you share venue and catering packages?", value: 2400000 },
    { type: "corporate", subject: "Leadership offsite — 40 pax", message: "Looking for 3 nights with a conference room and team activities.", value: 1800000 },
    { type: "stay", subject: "Honeymoon in December", message: "Is the overwater villa available 18–24 Dec? Any honeymoon inclusions?", value: 290000 },
    { type: "spa", subject: "Wellness retreat package", message: "Do you offer 5-day detox programmes with yoga?", value: 180000 },
    { type: "dining", subject: "Private dinner on the beach", message: "Anniversary dinner for two this Saturday — vegetarian menu please.", value: 28000 },
    { type: "general", subject: "Ferry & transfers", message: "How do we reach the resort from Port Blair airport?", value: 0 },
    { type: "wedding", subject: "Destination wedding — 80 guests", message: "Need the full property for 3 days in March. Please share a proposal.", value: 4200000 },
    { type: "corporate", subject: "Incentive trip for top sellers", message: "25 couples, 4 nights, scuba and island hopping.", value: 3600000 },
    { type: "stay", subject: "Family of five, Diwali week", message: "Need the Infinity Pool Residence + kids activities.", value: 460000 },
  ];
  const inquiries: Inquiry[] = inquiryTemplates.map((t, i) => {
    const g = guests[(i * 3 + 2) % guests.length];
    return {
      id: `q${i + 1}`,
      guestId: g.id,
      name: g.name,
      email: g.email,
      phone: g.phone,
      ...t,
      stage: stages[i % stages.length],
      assignee: pick(["Riya (Sales)", "Dev (Events)", "Front Office"]),
      notes: i % 2 === 0 ? [{ text: "Sent brochure over email.", at: addDays(now, -i).toISOString() }] : [],
      createdAt: addDays(now, -i * 3 - 1).toISOString(),
    };
  });

  return {
    settings: {
      brand: {
        name: "Aranya",
        tagline: "Where the forest meets the sea",
        established: "2011",
        location: "Havelock Island, Andaman",
        coordinates: "11.9761° N, 92.9876° E",
        phone: "+91 98765 43210",
        email: "stay@aranya.resort",
        whatsapp: "919876543210",
        address: "Beach No. 7, Radhanagar, Swaraj Dweep, Andaman & Nicobar Islands 744211",
        mapEmbed:
          "https://www.openstreetmap.org/export/embed.html?bbox=92.93%2C11.94%2C93.03%2C12.01&layer=mapnik&marker=11.9761%2C92.9876",
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        currency: "INR",
        checkIn: "2:00 PM",
        checkOut: "11:00 AM",
      },
      theme: { accent: "#FF5B2E", ink: "#121417", paper: "#F2EEE8", lagoon: "#0D4F4A" },
      intro: {
        enabled: true,
        style: "curtain",
        text: "Aranya",
        subtext: "Where the forest meets the sea",
        duration: 3.2,
        oncePerSession: true,
        image: IMG.lagoonBoat,
      },
      navbar: {
        showClock: true,
        showWeather: true,
        ctaLabel: "Reserve",
        links: [
          { label: "Stay", href: "/rooms", image: IMG.overwater },
          { label: "Experiences", href: "/experiences", image: IMG.lagoonBoat },
          { label: "Dining", href: "/dining", image: IMG.seaTerrace },
          { label: "Wellness", href: "/#spa", image: IMG.massage },
          { label: "Celebrations", href: "/#events", image: IMG.tableSetting },
          { label: "Gallery", href: "/gallery", image: IMG.infinity },
          { label: "Contact", href: "/contact", image: IMG.sunsetSea },
        ],
      },
      announcement: {
        enabled: true,
        text: "Monsoon Escape — stay 3 nights, pay for 2. Code: SLOWDOWN",
        link: "/offers",
      },
      hero: {
        eyebrow: "Swaraj Dweep · Andaman Islands",
        title: "Where the forest meets the sea",
        subtitle:
          "Forty-one villas hidden between a 600-year-old rainforest and the clearest water in the Bay of Bengal.",
        image: IMG.heroPool,
        image2: IMG.jetty,
        leftWord: "Forest",
        rightWord: "Sea",
        connector: "meets the",
        video: "",
        ctaPrimary: "Plan your stay",
        ctaSecondary: "Explore villas",
      },
      story: {
        eyebrow: "Our story",
        heading:
          "We built Aranya slowly, around the trees, so that the island would always feel like it was here first.",
        body:
          "Every villa was placed by hand to save a tree. Our kitchen grows half of what it serves. And our people — most of them born on this island — will show you the Andamans the way only locals can.",
        image: IMG.deckLodge,
        imageAlt: "Timber lodge and pool deck at Aranya",
        stats: [
          { value: "41", label: "Private villas" },
          { value: "600", label: "Year-old forest" },
          { value: "92%", label: "Locally staffed" },
          { value: "4.9", label: "Guest rating" },
        ],
      },
      spa: {
        eyebrow: "Wellness",
        heading: "Sola Spa — rituals rooted in the island",
        body:
          "Six treatment pavilions float above a lily pond. Our therapists blend Ayurvedic tradition with local botanicals — virgin coconut, pandanus and wild turmeric.",
        image: IMG.massage,
        rituals: [
          { name: "Abhyanga Four-Hand Massage", duration: "75 min", price: 9500 },
          { name: "Volcanic Hot Stone Ritual", duration: "90 min", price: 11000 },
          { name: "Sea Salt & Coconut Scrub", duration: "45 min", price: 5500 },
          { name: "Sunrise Yoga & Pranayama", duration: "60 min", price: 2500 },
        ],
      },
      events: {
        eyebrow: "Celebrations",
        heading: "Say yes with your toes in the sand",
        body:
          "From barefoot beach weddings for 200 to a candlelit table for two, our events team handles every detail — florals, music, menus and the moment.",
        image: IMG.tableSetting,
      },
      sections: [
        { id: "hero", label: "Hero", enabled: true },
        { id: "story", label: "Our Story", enabled: true },
        { id: "rooms", label: "Rooms & Villas", enabled: true },
        { id: "experiences", label: "Experiences", enabled: true },
        { id: "dining", label: "Dining", enabled: true },
        { id: "spa", label: "Spa & Wellness", enabled: true },
        { id: "offers", label: "Offers", enabled: true },
        { id: "gallery", label: "Gallery", enabled: true },
        { id: "events", label: "Weddings & Events", enabled: true },
        { id: "testimonials", label: "Testimonials", enabled: true },
        { id: "location", label: "Location", enabled: true },
        { id: "faq", label: "FAQ", enabled: true },
        { id: "newsletter", label: "Newsletter", enabled: true },
      ],
      seo: {
        title: "Aranya — Luxury Rainforest & Beach Resort, Andaman Islands",
        description:
          "Overwater villas, rainforest suites, a floating spa and barefoot dining on Havelock Island. Book direct for the best rates.",
      },
      footer: { note: "Crafted with care on Swaraj Dweep." },
    },
    rooms,
    experiences: [
      { id: "e1", title: "Sunrise Kayak to Elephant Beach", category: "Ocean", description: "Paddle through mangroves as the sky turns pink, then snorkel the reef before breakfast.", duration: "3 hrs", price: 4500, image: IMG.lakeJetty, featured: true, active: true },
      { id: "e2", title: "Private Lagoon Sailing", category: "Ocean", description: "A traditional dinghy, a skipper who knows every sandbar, and a cooler of fresh coconuts.", duration: "Half day", price: 18000, image: IMG.lagoonBoat, featured: true, active: true },
      { id: "e3", title: "Rainforest Night Walk", category: "Forest", description: "Bioluminescent fungi, sleeping kingfishers and the island's secret night sounds with a naturalist.", duration: "2 hrs", price: 3000, image: IMG.lakeCabin, featured: true, active: true },
      { id: "e4", title: "Hidden Cove Picnic", category: "Ocean", description: "We row you to a cove reachable only at low tide. Lunch, hammocks and nobody else.", duration: "5 hrs", price: 12000, image: IMG.cove, featured: true, active: true },
      { id: "e5", title: "Sunset Cliff Trek", category: "Forest", description: "A gentle climb to Kalapathar point for the best sunset in the Andamans.", duration: "2.5 hrs", price: 2500, image: IMG.sunsetSea, featured: true, active: true },
      { id: "e6", title: "PADI Discover Scuba", category: "Ocean", description: "Your first breath underwater with our PADI instructors, among parrotfish and soft corals.", duration: "4 hrs", price: 7500, image: IMG.beach, featured: false, active: true },
    ],
    dining: [
      { id: "d1", name: "Tamarind", cuisine: "Island Contemporary", description: "Our flagship. A seven-course tasting menu of reef fish, jungle greens and spice from our own garden.", hours: "7 PM – 11 PM", image: IMG.fineDining, signature: "Smoked reef snapper, raw mango, curry leaf", active: true },
      { id: "d2", name: "Driftwood", cuisine: "Sea-terrace Grill", description: "Fire-grilled catch of the day on a terrace that hangs over the water.", hours: "12 PM – 10 PM", image: IMG.seaTerrace, signature: "Charred lobster, kokum butter", active: true },
      { id: "d3", name: "The Copper Bar", cuisine: "Cocktails & Small Plates", description: "Low lights, island botanicals and a vinyl collection older than the resort.", hours: "5 PM – 1 AM", image: IMG.bar, signature: "Pandan & smoked palm-jaggery old fashioned", active: true },
      { id: "d4", name: "Banyan Café", cuisine: "All-day Café", description: "Sourdough, single-estate coffee from Coorg, and breakfast until 3 PM.", hours: "7 AM – 6 PM", image: IMG.brunch, signature: "Coconut-jaggery French toast", active: true },
    ],
    offers: [
      { id: "o1", title: "Monsoon Escape", description: "Stay three nights, pay for two. Includes daily breakfast and one spa ritual per guest.", badge: "3 for 2", code: "SLOWDOWN", discount: 33, validTill: iso(addDays(now, 60)), image: IMG.cloudPeaks, active: true },
      { id: "o2", title: "Honeymoon by the Lagoon", description: "Overwater villa, floating breakfast, private beach dinner and a couples' massage.", badge: "Romance", code: "FOREVER", discount: 15, validTill: iso(addDays(now, 120)), image: IMG.overwater, active: true },
      { id: "o3", title: "Book Early, Save More", description: "Reserve 60 days ahead and save 20% on any villa, with free cancellation.", badge: "-20%", code: "EARLY20", discount: 20, validTill: iso(addDays(now, 180)), image: IMG.infinity, active: true },
    ],
    gallery: [
      IMG.heroPool, IMG.overwater, IMG.lagoonBoat, IMG.fineDining, IMG.massage, IMG.infinity, IMG.teakRoom, IMG.cove,
      IMG.nightPool, IMG.seaTerrace, IMG.skyBed, IMG.duskPool, IMG.hotStone, IMG.beach, IMG.palmsPool, IMG.bar,
    ].map((src, i) => ({
      id: `p${i + 1}`,
      src,
      caption: ["Rainforest pool", "Overwater villas", "Lagoon sailing", "Tamarind", "Sola Spa", "Infinity edge", "Canopy Suite", "Hidden cove", "Pool at night", "Driftwood terrace", "Sky Suite", "Dusk", "Hot stone ritual", "Radhanagar beach", "Palm court", "The Copper Bar"][i],
      category: ["Resort", "Rooms", "Experiences", "Dining", "Spa", "Resort", "Rooms", "Experiences", "Resort", "Dining", "Rooms", "Resort", "Spa", "Experiences", "Resort", "Dining"][i],
    })),
    testimonials: [
      { id: "t1", name: "Ishita & Kabir", location: "New Delhi", quote: "We've stayed at a lot of beautiful places. Aranya is the first one that made us forget to take photos.", rating: 5, stay: "Lagoon Overwater Villa", active: true },
      { id: "t2", name: "Daniel Brooks", location: "London", quote: "The staff remembered how I took my coffee on day one and never asked again. Quietly perfect.", rating: 5, stay: "Cliffside Sky Suite", active: true },
      { id: "t3", name: "The Iyer family", location: "Bengaluru", quote: "Our kids still talk about the night walk with the glowing mushrooms. Already booked our next trip.", rating: 5, stay: "Infinity Pool Residence", active: true },
      { id: "t4", name: "Emma Laurent", location: "Paris", quote: "Tamarind is worth the flight alone. The most memorable meal of my year.", rating: 5, stay: "Forest Canopy Suite", active: true },
    ],
    faqs: [
      { id: "f1", question: "How do I reach Aranya?", answer: "Fly into Port Blair (IXZ), then take a 90-minute private ferry to Havelock. Our team meets you at the jetty — transfers can be added during booking.", category: "Travel" },
      { id: "f2", question: "What are the check-in and check-out times?", answer: "Check-in is from 2:00 PM and check-out is until 11:00 AM. Early check-in and late check-out are subject to availability.", category: "Stay" },
      { id: "f3", question: "Is the resort suitable for children?", answer: "Absolutely. Our Residences sleep up to five, and the Little Explorers club runs nature activities daily for ages 4–12.", category: "Stay" },
      { id: "f4", question: "What is your cancellation policy?", answer: "Free cancellation up to 14 days before arrival on flexible rates. Promotional rates may be non-refundable — the policy is shown before you pay.", category: "Booking" },
      { id: "f5", question: "Do you host weddings and private events?", answer: "Yes — from intimate ceremonies to full-property buyouts for 200 guests. Share your dates through the contact form and our events team will reply within 24 hours.", category: "Events" },
      { id: "f6", question: "Is Wi-Fi available?", answer: "High-speed Wi-Fi covers every villa and public area. Though we gently encourage a little disconnecting.", category: "Stay" },
    ],
    venues: [
      { id: "v1", name: "Radhanagar Beach Lawn", capacity: 200, description: "Ceremonies at sunset with the sea as your altar.", image: IMG.beach },
      { id: "v2", name: "The Banyan Courtyard", capacity: 120, description: "Fairy-lit dinners under a 300-year-old banyan tree.", image: IMG.tableSetting },
      { id: "v3", name: "Pavilion Hall", capacity: 250, description: "Our climate-controlled ballroom for receptions and conferences.", image: IMG.ballroom },
    ],
    bookings: bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    inquiries,
    guests,
    subscribers: ["hello@wanderlust.in", "neha.travels@example.com", "mark.d@example.com", "ritika.p@example.com"].map((email, i) => ({
      id: `s${i + 1}`,
      email,
      createdAt: addDays(now, -i * 6).toISOString(),
    })),
    activity: [
      { id: "a1", kind: "booking", message: "New website booking ARN-3AP · Lagoon Overwater Villa", at: addDays(now, 0).toISOString() },
      { id: "a2", kind: "inquiry", message: "Wedding inquiry from Ananya Rao (150 guests)", at: addDays(now, -1).toISOString() },
      { id: "a3", kind: "subscriber", message: "hello@wanderlust.in joined the newsletter", at: addDays(now, -2).toISOString() },
      { id: "a4", kind: "cms", message: "Homepage hero updated", at: addDays(now, -3).toISOString() },
    ],
  };
}
