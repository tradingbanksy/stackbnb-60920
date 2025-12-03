// Restaurant images imports
import seafood1 from '@/assets/restaurants/seafood-1.jpg';
import seafood2 from '@/assets/restaurants/seafood-2.jpg';
import seafood3 from '@/assets/restaurants/seafood-3.jpg';
import seafood4 from '@/assets/restaurants/seafood-4.jpg';
import seafood5 from '@/assets/restaurants/seafood-5.jpg';
import seafood6 from '@/assets/restaurants/seafood-6.jpg';
import seafood7 from '@/assets/restaurants/seafood-7.jpg';
import seafood8 from '@/assets/restaurants/seafood-8.jpg';
import american1 from '@/assets/restaurants/american-1.jpg';
import american2 from '@/assets/restaurants/american-2.jpg';
import american3 from '@/assets/restaurants/american-3.jpg';
import italian1 from '@/assets/restaurants/italian-1.jpg';
import italian2 from '@/assets/restaurants/italian-2.jpg';
import italian3 from '@/assets/restaurants/italian-3.jpg';
import japanese1 from '@/assets/restaurants/japanese-1.jpg';
import japanese2 from '@/assets/restaurants/japanese-2.jpg';
import japanese3 from '@/assets/restaurants/japanese-3.jpg';
import japanese4 from '@/assets/restaurants/japanese-4.jpg';
import japanese5 from '@/assets/restaurants/japanese-5.jpg';
import japanese6 from '@/assets/restaurants/japanese-6.jpg';
import mexican1 from '@/assets/restaurants/mexican-1.jpg';
import mexican2 from '@/assets/restaurants/mexican-2.jpg';
import mexican4 from '@/assets/restaurants/mexican-4.jpg';
import mexican5 from '@/assets/restaurants/mexican-5.jpg';
import steakhouse1 from '@/assets/restaurants/steakhouse-1.jpg';
import steakhouse2 from '@/assets/restaurants/steakhouse-2.jpg';
import steakhouse3 from '@/assets/restaurants/steakhouse-3.jpg';
import mediterranean1 from '@/assets/restaurants/mediterranean-1.jpg';
import mediterranean2 from '@/assets/restaurants/mediterranean-2.jpg';
import mediterranean3 from '@/assets/restaurants/mediterranean-3.jpg';
import french1 from '@/assets/restaurants/french-1.jpg';
import french2 from '@/assets/restaurants/french-2.jpg';
import french3 from '@/assets/restaurants/french-3.jpg';
import pizza1 from '@/assets/restaurants/pizza-1.jpg';
import pizza2 from '@/assets/restaurants/pizza-2.jpg';
import pizza3 from '@/assets/restaurants/pizza-3.jpg';
import california1 from '@/assets/restaurants/california-1.jpg';
import california2 from '@/assets/restaurants/california-2.jpg';
import california3 from '@/assets/restaurants/california-3.jpg';
import bbq1 from '@/assets/restaurants/bbq-1.jpg';
import bbq3 from '@/assets/restaurants/bbq-3.jpg';
import vegan1 from '@/assets/restaurants/vegan-1.jpg';
import vegan2 from '@/assets/restaurants/vegan-2.jpg';
import vegan3 from '@/assets/restaurants/vegan-3.jpg';
import bakery1 from '@/assets/restaurants/bakery-1.jpg';
import bakery2 from '@/assets/restaurants/bakery-2.jpg';
import bakery3 from '@/assets/restaurants/bakery-3.jpg';
import sushi1 from '@/assets/restaurants/sushi-1.jpg';
import sushi2 from '@/assets/restaurants/sushi-2.jpg';
import interior1 from '@/assets/restaurants/interior-1.jpg';
import interior2 from '@/assets/restaurants/interior-2.jpg';

// Mock restaurant data with realistic information
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  address: string;
  neighborhood?: string;
  city: string;
  zipCode: string;
  phone?: string;
  website?: string;
  hours: {
    [key: string]: { open: string; close: string } | null;
  };
  description?: string;
  photos: string[];
  features?: string[];
  hasOutdoorSeating?: boolean;
  reservationUrl?: string;
  reservationPlatform?: 'opentable' | 'resy' | 'yelp' | null;
  coordinates?: { lat: number; lng: number };
  distance?: number; // Distance in meters from user location
  isFromApi?: boolean; // Flag to identify API-fetched restaurants
}

// Unique high-quality food images - each restaurant gets unique local images (NO DUPLICATES)
const uniqueRestaurantPhotos: Record<string, string[]> = {
  r1: [seafood1, seafood2, seafood3], // Ocean View Grill - Seafood
  r2: [american1, american2, american3], // Sunset Grill & Bar - American
  r3: [italian1, italian2, italian3], // La Bella Italia - Italian
  r4: [japanese1, japanese2, japanese3], // Sakura Garden - Japanese
  r5: [mexican1, mexican2, mexican4], // Casa del Sol - Mexican
  r6: [steakhouse1, steakhouse2, steakhouse3], // Prime 112 - Steakhouse
  r7: [seafood4, seafood5, seafood6], // Blue Marlin Fish House - Seafood
  r8: [mediterranean1, mediterranean2, mediterranean3], // Café Méditerranée - Mediterranean
  r9: [japanese4, japanese5, japanese6], // Nobu Malibu - Japanese
  r10: [seafood7, seafood8, interior1], // Neptune's Net - Seafood
  r11: [french1, french2, french3], // Le Bernardin - French Seafood
  r12: [pizza1, pizza2, pizza3], // Joe's Pizza - Italian
  r13: [california1, california2, california3], // George's at the Cove - California
  r14: [mexican5, vegan1, interior2], // Tacos El Gordo - Mexican
  r15: [bbq1, bbq3, sushi1], // Franklin Barbecue - BBQ
  r16: [sushi2, vegan2, vegan3], // Uchi - Japanese
};

export const mockRestaurants: Restaurant[] = [
  // Miami Beach restaurants
  {
    id: 'r1',
    name: "The Ocean View Grill",
    cuisine: "Seafood",
    rating: 4.8,
    reviewCount: 1247,
    priceRange: '$$$',
    address: "1234 Ocean Drive",
    neighborhood: "South Beach",
    city: "Miami Beach",
    zipCode: "33139",
    phone: "(305) 555-0101",
    hours: {
      monday: { open: "11:00 AM", close: "10:00 PM" },
      tuesday: { open: "11:00 AM", close: "10:00 PM" },
      wednesday: { open: "11:00 AM", close: "10:00 PM" },
      thursday: { open: "11:00 AM", close: "11:00 PM" },
      friday: { open: "11:00 AM", close: "12:00 AM" },
      saturday: { open: "10:00 AM", close: "12:00 AM" },
      sunday: { open: "10:00 AM", close: "10:00 PM" },
    },
    description: "Experience the finest seafood with breathtaking oceanfront views. Our award-winning chef creates daily specials using the freshest catch from local fishermen. Perfect for romantic dinners or celebrating special occasions.",
    photos: uniqueRestaurantPhotos.r1,
    features: ["Outdoor Seating", "Waterfront", "Full Bar", "Live Music Fri-Sat"],
    hasOutdoorSeating: true,
    reservationUrl: "https://www.opentable.com/r/ocean-view-grill",
    reservationPlatform: 'opentable',
    coordinates: { lat: 25.7825, lng: -80.1315 },
  },
  {
    id: 'r2',
    name: "Sunset Grill & Bar",
    cuisine: "American",
    rating: 4.6,
    reviewCount: 892,
    priceRange: '$$',
    address: "567 Collins Ave",
    neighborhood: "Mid Beach",
    city: "Miami Beach",
    zipCode: "33140",
    phone: "(305) 555-0102",
    hours: {
      monday: { open: "7:00 AM", close: "11:00 PM" },
      tuesday: { open: "7:00 AM", close: "11:00 PM" },
      wednesday: { open: "7:00 AM", close: "11:00 PM" },
      thursday: { open: "7:00 AM", close: "11:00 PM" },
      friday: { open: "7:00 AM", close: "12:00 AM" },
      saturday: { open: "7:00 AM", close: "12:00 AM" },
      sunday: { open: "7:00 AM", close: "10:00 PM" },
    },
    description: "A local favorite since 1985, Sunset Grill offers classic American comfort food with a modern twist. Famous for our all-day breakfast and craft cocktails. Dog-friendly patio available!",
    photos: uniqueRestaurantPhotos.r2,
    features: ["Outdoor Seating", "Pet Friendly", "All-Day Breakfast", "Craft Cocktails"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 25.8004, lng: -80.1287 },
  },
  {
    id: 'r3',
    name: "La Bella Italia",
    cuisine: "Italian",
    rating: 4.9,
    reviewCount: 2103,
    priceRange: '$$$$',
    address: "890 Lincoln Road",
    neighborhood: "South Beach",
    city: "Miami Beach",
    zipCode: "33139",
    phone: "(305) 555-0103",
    hours: {
      monday: null,
      tuesday: { open: "5:00 PM", close: "10:00 PM" },
      wednesday: { open: "5:00 PM", close: "10:00 PM" },
      thursday: { open: "5:00 PM", close: "10:00 PM" },
      friday: { open: "5:00 PM", close: "11:00 PM" },
      saturday: { open: "4:00 PM", close: "11:00 PM" },
      sunday: { open: "4:00 PM", close: "9:00 PM" },
    },
    description: "Authentic Northern Italian cuisine prepared by Chef Marco, who trained in Bologna. Our hand-made pasta and extensive wine list have earned us multiple culinary awards. Reservations highly recommended.",
    photos: uniqueRestaurantPhotos.r3,
    features: ["Romantic", "Wine Bar", "Private Dining", "Chef's Table"],
    hasOutdoorSeating: false,
    reservationUrl: "https://resy.com/cities/mia/la-bella-italia",
    reservationPlatform: 'resy',
    coordinates: { lat: 25.7905, lng: -80.1393 },
  },
  {
    id: 'r4',
    name: "Sakura Garden",
    cuisine: "Japanese",
    rating: 4.7,
    reviewCount: 756,
    priceRange: '$$$',
    address: "234 Washington Ave",
    neighborhood: "South Beach",
    city: "Miami Beach",
    zipCode: "33139",
    phone: "(305) 555-0104",
    hours: {
      monday: { open: "12:00 PM", close: "10:00 PM" },
      tuesday: { open: "12:00 PM", close: "10:00 PM" },
      wednesday: { open: "12:00 PM", close: "10:00 PM" },
      thursday: { open: "12:00 PM", close: "10:00 PM" },
      friday: { open: "12:00 PM", close: "11:00 PM" },
      saturday: { open: "12:00 PM", close: "11:00 PM" },
      sunday: { open: "1:00 PM", close: "9:00 PM" },
    },
    description: "Traditional Japanese cuisine featuring omakase, sushi, and robata grill. Our fish is flown in daily from Tokyo's Tsukiji market. Experience authentic Japan in the heart of Miami.",
    photos: uniqueRestaurantPhotos.r4,
    features: ["Omakase", "Sake Bar", "Private Tatami Rooms", "Vegan Options"],
    hasOutdoorSeating: false,
    reservationUrl: "https://www.opentable.com/r/sakura-garden",
    reservationPlatform: 'opentable',
    coordinates: { lat: 25.7789, lng: -80.1342 },
  },
  {
    id: 'r5',
    name: "Casa del Sol",
    cuisine: "Mexican",
    rating: 4.5,
    reviewCount: 1089,
    priceRange: '$$',
    address: "456 Española Way",
    neighborhood: "South Beach",
    city: "Miami Beach",
    zipCode: "33139",
    phone: "(305) 555-0105",
    hours: {
      monday: { open: "11:30 AM", close: "10:00 PM" },
      tuesday: { open: "11:30 AM", close: "10:00 PM" },
      wednesday: { open: "11:30 AM", close: "10:00 PM" },
      thursday: { open: "11:30 AM", close: "11:00 PM" },
      friday: { open: "11:30 AM", close: "12:00 AM" },
      saturday: { open: "10:00 AM", close: "12:00 AM" },
      sunday: { open: "10:00 AM", close: "10:00 PM" },
    },
    description: "Vibrant Mexican cantina serving authentic regional dishes and the best margaritas in town. Our tableside guacamole is legendary. Weekend brunch features live mariachi music!",
    photos: uniqueRestaurantPhotos.r5,
    features: ["Outdoor Seating", "Live Music", "Tequila Bar", "Weekend Brunch"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 25.7867, lng: -80.1301 },
  },
  {
    id: 'r6',
    name: "Prime 112",
    cuisine: "Steakhouse",
    rating: 4.8,
    reviewCount: 3456,
    priceRange: '$$$$',
    address: "112 Ocean Drive",
    neighborhood: "South Beach",
    city: "Miami Beach",
    zipCode: "33139",
    phone: "(305) 555-0106",
    hours: {
      monday: { open: "12:00 PM", close: "12:00 AM" },
      tuesday: { open: "12:00 PM", close: "12:00 AM" },
      wednesday: { open: "12:00 PM", close: "12:00 AM" },
      thursday: { open: "12:00 PM", close: "12:00 AM" },
      friday: { open: "12:00 PM", close: "1:00 AM" },
      saturday: { open: "12:00 PM", close: "1:00 AM" },
      sunday: { open: "12:00 PM", close: "11:00 PM" },
    },
    description: "The original South Beach steakhouse and celebrity hot-spot. USDA Prime dry-aged steaks, legendary side dishes, and an award-winning wine program. Where Miami's elite come to dine.",
    photos: uniqueRestaurantPhotos.r6,
    features: ["Celebrity Hotspot", "Private Dining", "Valet Parking", "Full Bar"],
    hasOutdoorSeating: true,
    reservationUrl: "https://resy.com/cities/mia/prime-112",
    reservationPlatform: 'resy',
    coordinates: { lat: 25.7785, lng: -80.1295 },
  },
  {
    id: 'r7',
    name: "Blue Marlin Fish House",
    cuisine: "Seafood",
    rating: 4.4,
    reviewCount: 567,
    priceRange: '$$',
    address: "2500 NE 163rd St",
    neighborhood: "North Miami Beach",
    city: "North Miami Beach",
    zipCode: "33160",
    phone: "(305) 555-0107",
    hours: {
      monday: { open: "11:00 AM", close: "9:00 PM" },
      tuesday: { open: "11:00 AM", close: "9:00 PM" },
      wednesday: { open: "11:00 AM", close: "9:00 PM" },
      thursday: { open: "11:00 AM", close: "9:00 PM" },
      friday: { open: "11:00 AM", close: "10:00 PM" },
      saturday: { open: "11:00 AM", close: "10:00 PM" },
      sunday: { open: "12:00 PM", close: "8:00 PM" },
    },
    description: "Casual waterfront dining with the freshest fish-of-the-day. Family-owned for 30 years, we pride ourselves on generous portions and friendly service. Best fish tacos in North Miami!",
    photos: uniqueRestaurantPhotos.r7,
    features: ["Outdoor Seating", "Waterfront", "Family Friendly", "Fish Market"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 25.9286, lng: -80.1417 },
  },
  {
    id: 'r8',
    name: "Café Méditerranée",
    cuisine: "Mediterranean",
    rating: 4.6,
    reviewCount: 834,
    priceRange: '$$',
    address: "789 Arthur Godfrey Rd",
    neighborhood: "Mid Beach",
    city: "Miami Beach",
    zipCode: "33140",
    phone: "(305) 555-0108",
    hours: {
      monday: { open: "8:00 AM", close: "10:00 PM" },
      tuesday: { open: "8:00 AM", close: "10:00 PM" },
      wednesday: { open: "8:00 AM", close: "10:00 PM" },
      thursday: { open: "8:00 AM", close: "10:00 PM" },
      friday: { open: "8:00 AM", close: "11:00 PM" },
      saturday: { open: "8:00 AM", close: "11:00 PM" },
      sunday: { open: "8:00 AM", close: "9:00 PM" },
    },
    description: "A charming bistro offering flavors from across the Mediterranean - from Greek to Lebanese to Spanish. Beautiful garden patio and impressive mezze selection. Perfect for leisurely weekend brunches.",
    photos: uniqueRestaurantPhotos.r8,
    features: ["Outdoor Seating", "Garden Patio", "Vegetarian Friendly", "Brunch"],
    hasOutdoorSeating: true,
    reservationUrl: "https://www.yelp.com/biz/cafe-mediterranee-miami-beach",
    reservationPlatform: 'yelp',
    coordinates: { lat: 25.8156, lng: -80.1298 },
  },
  // Los Angeles restaurants
  {
    id: 'r9',
    name: "Nobu Malibu",
    cuisine: "Japanese",
    rating: 4.7,
    reviewCount: 4521,
    priceRange: '$$$$',
    address: "22706 Pacific Coast Hwy",
    neighborhood: "Malibu",
    city: "Malibu",
    zipCode: "90265",
    phone: "(310) 555-0201",
    hours: {
      monday: { open: "5:00 PM", close: "10:00 PM" },
      tuesday: { open: "5:00 PM", close: "10:00 PM" },
      wednesday: { open: "5:00 PM", close: "10:00 PM" },
      thursday: { open: "5:00 PM", close: "10:00 PM" },
      friday: { open: "5:00 PM", close: "11:00 PM" },
      saturday: { open: "12:00 PM", close: "11:00 PM" },
      sunday: { open: "12:00 PM", close: "10:00 PM" },
    },
    description: "The iconic beachfront outpost of Chef Nobu Matsuhisa's empire. Watch the sunset over the Pacific while enjoying world-famous black cod miso and innovative Japanese-Peruvian fusion cuisine.",
    photos: uniqueRestaurantPhotos.r9,
    features: ["Oceanfront", "Celebrity Hotspot", "Sunset Views", "Valet Parking"],
    hasOutdoorSeating: true,
    reservationUrl: "https://resy.com/cities/la/nobu-malibu",
    reservationPlatform: 'resy',
    coordinates: { lat: 34.0378, lng: -118.6798 },
  },
  {
    id: 'r10',
    name: "Neptune's Net",
    cuisine: "Seafood",
    rating: 4.3,
    reviewCount: 2876,
    priceRange: '$',
    address: "42505 Pacific Coast Hwy",
    neighborhood: "Malibu",
    city: "Malibu",
    zipCode: "90265",
    phone: "(310) 555-0202",
    hours: {
      monday: { open: "10:30 AM", close: "8:00 PM" },
      tuesday: { open: "10:30 AM", close: "8:00 PM" },
      wednesday: { open: "10:30 AM", close: "8:00 PM" },
      thursday: { open: "10:30 AM", close: "8:00 PM" },
      friday: { open: "10:30 AM", close: "9:00 PM" },
      saturday: { open: "10:00 AM", close: "9:00 PM" },
      sunday: { open: "10:00 AM", close: "8:00 PM" },
    },
    description: "Legendary roadside seafood shack where bikers, surfers, and celebrities rub elbows over fresh clam chowder and fish and chips. A true Malibu institution since 1956.",
    photos: uniqueRestaurantPhotos.r10,
    features: ["Outdoor Seating", "Cash Only", "Biker Friendly", "Ocean Views"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 34.0512, lng: -118.9367 },
  },
  // New York restaurants
  {
    id: 'r11',
    name: "Le Bernardin",
    cuisine: "French Seafood",
    rating: 4.9,
    reviewCount: 5678,
    priceRange: '$$$$',
    address: "155 W 51st St",
    neighborhood: "Midtown",
    city: "New York",
    zipCode: "10019",
    phone: "(212) 555-0301",
    hours: {
      monday: { open: "12:00 PM", close: "2:30 PM" },
      tuesday: { open: "12:00 PM", close: "10:30 PM" },
      wednesday: { open: "12:00 PM", close: "10:30 PM" },
      thursday: { open: "12:00 PM", close: "10:30 PM" },
      friday: { open: "12:00 PM", close: "11:00 PM" },
      saturday: { open: "5:00 PM", close: "11:00 PM" },
      sunday: null,
    },
    description: "Three Michelin-starred temple of seafood by Chef Eric Ripert. Impeccable French technique meets the finest ingredients from around the world. The tasting menu is a transcendent culinary experience.",
    photos: uniqueRestaurantPhotos.r11,
    features: ["Michelin Star", "Tasting Menu", "Wine Pairing", "Private Dining"],
    hasOutdoorSeating: false,
    reservationUrl: "https://resy.com/cities/ny/le-bernardin",
    reservationPlatform: 'resy',
    coordinates: { lat: 40.7614, lng: -73.9815 },
  },
  {
    id: 'r12',
    name: "Joe's Pizza",
    cuisine: "Italian",
    rating: 4.5,
    reviewCount: 8934,
    priceRange: '$',
    address: "7 Carmine St",
    neighborhood: "Greenwich Village",
    city: "New York",
    zipCode: "10014",
    phone: "(212) 555-0302",
    hours: {
      monday: { open: "10:00 AM", close: "4:00 AM" },
      tuesday: { open: "10:00 AM", close: "4:00 AM" },
      wednesday: { open: "10:00 AM", close: "4:00 AM" },
      thursday: { open: "10:00 AM", close: "4:00 AM" },
      friday: { open: "10:00 AM", close: "5:00 AM" },
      saturday: { open: "10:00 AM", close: "5:00 AM" },
      sunday: { open: "10:00 AM", close: "4:00 AM" },
    },
    description: "The quintessential New York slice since 1975. No-frills counter service and the city's most perfect thin-crust pizza. Ask any local - this is the real deal.",
    photos: uniqueRestaurantPhotos.r12,
    features: ["Late Night", "Counter Service", "Cash Preferred", "Iconic NYC"],
    hasOutdoorSeating: false,
    reservationPlatform: null,
    coordinates: { lat: 40.7302, lng: -74.0023 },
  },
  // San Diego restaurants
  {
    id: 'r13',
    name: "George's at the Cove",
    cuisine: "California",
    rating: 4.7,
    reviewCount: 2345,
    priceRange: '$$$',
    address: "1250 Prospect St",
    neighborhood: "La Jolla",
    city: "San Diego",
    zipCode: "92037",
    phone: "(858) 555-0401",
    hours: {
      monday: { open: "11:00 AM", close: "10:00 PM" },
      tuesday: { open: "11:00 AM", close: "10:00 PM" },
      wednesday: { open: "11:00 AM", close: "10:00 PM" },
      thursday: { open: "11:00 AM", close: "10:00 PM" },
      friday: { open: "11:00 AM", close: "10:30 PM" },
      saturday: { open: "11:00 AM", close: "10:30 PM" },
      sunday: { open: "10:00 AM", close: "9:00 PM" },
    },
    description: "Award-winning California cuisine with spectacular views of La Jolla Cove. Three distinct dining experiences: Ocean Terrace, Level2, and the intimate California Modern downstairs.",
    photos: uniqueRestaurantPhotos.r13,
    features: ["Outdoor Seating", "Ocean Views", "Rooftop Terrace", "Local Produce"],
    hasOutdoorSeating: true,
    reservationUrl: "https://www.opentable.com/r/georges-at-the-cove",
    reservationPlatform: 'opentable',
    coordinates: { lat: 32.8499, lng: -117.2728 },
  },
  {
    id: 'r14',
    name: "Tacos El Gordo",
    cuisine: "Mexican",
    rating: 4.6,
    reviewCount: 3456,
    priceRange: '$',
    address: "689 H St",
    neighborhood: "Chula Vista",
    city: "San Diego",
    zipCode: "91910",
    phone: "(619) 555-0402",
    hours: {
      monday: { open: "10:00 AM", close: "2:00 AM" },
      tuesday: { open: "10:00 AM", close: "2:00 AM" },
      wednesday: { open: "10:00 AM", close: "2:00 AM" },
      thursday: { open: "10:00 AM", close: "2:00 AM" },
      friday: { open: "10:00 AM", close: "4:00 AM" },
      saturday: { open: "10:00 AM", close: "4:00 AM" },
      sunday: { open: "10:00 AM", close: "2:00 AM" },
    },
    description: "Tijuana-style street tacos that have achieved cult status. The adobada cooked on a vertical spit is legendary. Expect lines - they're worth it.",
    photos: uniqueRestaurantPhotos.r14,
    features: ["Late Night", "Counter Service", "Authentic Street Tacos", "Cash Preferred"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 32.6401, lng: -117.0842 },
  },
  // Austin restaurants
  {
    id: 'r15',
    name: "Franklin Barbecue",
    cuisine: "BBQ",
    rating: 4.9,
    reviewCount: 6789,
    priceRange: '$$',
    address: "900 E 11th St",
    neighborhood: "East Austin",
    city: "Austin",
    zipCode: "78702",
    phone: "(512) 555-0501",
    hours: {
      monday: null,
      tuesday: { open: "11:00 AM", close: "3:00 PM" },
      wednesday: { open: "11:00 AM", close: "3:00 PM" },
      thursday: { open: "11:00 AM", close: "3:00 PM" },
      friday: { open: "11:00 AM", close: "3:00 PM" },
      saturday: { open: "11:00 AM", close: "3:00 PM" },
      sunday: { open: "11:00 AM", close: "3:00 PM" },
    },
    description: "The most famous barbecue in America. Aaron Franklin's brisket has achieved legendary status. Get in line early (very early) or pre-order online. Worth every minute of the wait.",
    photos: uniqueRestaurantPhotos.r15,
    features: ["Outdoor Seating", "Pre-Order Available", "BYOB", "James Beard Winner"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 30.2702, lng: -97.7312 },
  },
  {
    id: 'r16',
    name: "Uchi",
    cuisine: "Japanese",
    rating: 4.8,
    reviewCount: 4123,
    priceRange: '$$$$',
    address: "801 S Lamar Blvd",
    neighborhood: "South Lamar",
    city: "Austin",
    zipCode: "78704",
    phone: "(512) 555-0502",
    hours: {
      monday: { open: "5:00 PM", close: "10:00 PM" },
      tuesday: { open: "5:00 PM", close: "10:00 PM" },
      wednesday: { open: "5:00 PM", close: "10:00 PM" },
      thursday: { open: "5:00 PM", close: "10:00 PM" },
      friday: { open: "5:00 PM", close: "11:00 PM" },
      saturday: { open: "5:00 PM", close: "11:00 PM" },
      sunday: { open: "5:00 PM", close: "10:00 PM" },
    },
    description: "Chef Tyson Cole's groundbreaking Japanese farmhouse dining. Innovative omakase and stunning individual dishes in a converted 1920s bungalow. Austin's ultimate special occasion restaurant.",
    photos: uniqueRestaurantPhotos.r16,
    features: ["Omakase", "James Beard Winner", "Sake Program", "Garden Patio"],
    hasOutdoorSeating: true,
    reservationUrl: "https://resy.com/cities/atx/uchi",
    reservationPlatform: 'resy',
    coordinates: { lat: 30.2512, lng: -97.7614 },
  },
];

// Location suggestions for autocomplete
export const locationSuggestions = [
  { type: 'city', value: 'Miami Beach', state: 'FL', zipCode: '33139' },
  { type: 'city', value: 'Miami', state: 'FL', zipCode: '33101' },
  { type: 'city', value: 'North Miami Beach', state: 'FL', zipCode: '33160' },
  { type: 'city', value: 'Malibu', state: 'CA', zipCode: '90265' },
  { type: 'city', value: 'Los Angeles', state: 'CA', zipCode: '90001' },
  { type: 'city', value: 'Santa Monica', state: 'CA', zipCode: '90401' },
  { type: 'city', value: 'New York', state: 'NY', zipCode: '10001' },
  { type: 'city', value: 'Brooklyn', state: 'NY', zipCode: '11201' },
  { type: 'city', value: 'San Diego', state: 'CA', zipCode: '92101' },
  { type: 'city', value: 'La Jolla', state: 'CA', zipCode: '92037' },
  { type: 'city', value: 'Austin', state: 'TX', zipCode: '78701' },
  { type: 'zip', value: '33139', city: 'Miami Beach', state: 'FL' },
  { type: 'zip', value: '33140', city: 'Miami Beach', state: 'FL' },
  { type: 'zip', value: '33160', city: 'North Miami Beach', state: 'FL' },
  { type: 'zip', value: '90265', city: 'Malibu', state: 'CA' },
  { type: 'zip', value: '90401', city: 'Santa Monica', state: 'CA' },
  { type: 'zip', value: '10019', city: 'New York', state: 'NY' },
  { type: 'zip', value: '10014', city: 'New York', state: 'NY' },
  { type: 'zip', value: '92037', city: 'La Jolla', state: 'CA' },
  { type: 'zip', value: '78702', city: 'Austin', state: 'TX' },
];

// Helper function to check if restaurant is open
export const isRestaurantOpen = (restaurant: Restaurant): boolean => {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const hours = restaurant.hours[currentDay];
  
  if (!hours) return false;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const parseTime = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };
  
  const openTime = parseTime(hours.open);
  let closeTime = parseTime(hours.close);
  
  // Handle overnight hours (e.g., closes at 2 AM)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime < closeTime;
  }
  
  return currentTime >= openTime && currentTime < closeTime;
};

// Filter restaurants by location
export const filterRestaurantsByLocation = (
  restaurants: Restaurant[],
  city?: string,
  zipCode?: string
): Restaurant[] => {
  if (!city && !zipCode) return restaurants;
  
  return restaurants.filter(r => {
    if (zipCode && r.zipCode === zipCode) return true;
    if (city) {
      const cityLower = city.toLowerCase();
      return (
        r.city.toLowerCase().includes(cityLower) ||
        r.neighborhood.toLowerCase().includes(cityLower)
      );
    }
    return false;
  });
};
