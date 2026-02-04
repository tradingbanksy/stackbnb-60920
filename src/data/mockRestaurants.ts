// Restaurant images imports - Tulum restaurants
import arcaTulum from '@/assets/restaurants/arca-tulum.jpg';
import hartwoodTulum from '@/assets/restaurants/hartwood-tulum.jpg';
import burritoAmorTulum from '@/assets/restaurants/burrito-amor-tulum.jpg';
import taqueriaHonorioTulum from '@/assets/restaurants/taqueria-honorio-tulum.jpg';
import posadaMargheritaTulum from '@/assets/restaurants/posada-margherita-tulum.jpg';
import chamicosTulum from '@/assets/restaurants/chamicos-tulum.jpg';
import kitchenTableTulum from '@/assets/restaurants/kitchen-table-tulum.jpg';
import rawLoveTulum from '@/assets/restaurants/raw-love-tulum.jpg';

// Generic images for other cities
import seafood1 from '@/assets/restaurants/seafood-1.jpg';
import seafood2 from '@/assets/restaurants/seafood-2.jpg';
import seafood3 from '@/assets/restaurants/seafood-3.jpg';
import steakhouse1 from '@/assets/restaurants/steakhouse-1.jpg';
import mexican1 from '@/assets/restaurants/mexican-1.jpg';
import mexican2 from '@/assets/restaurants/mexican-2.jpg';
import fineDining1 from '@/assets/restaurants/fine-dining-1.jpg';
import french1 from '@/assets/restaurants/french-1.jpg';
import mediterranean1 from '@/assets/restaurants/mediterranean-1.jpg';

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

// Unique restaurant photos for each Tulum restaurant
const uniqueRestaurantPhotos: Record<string, string[]> = {
  r1: [arcaTulum], // ARCA
  r2: [hartwoodTulum], // Hartwood
  r3: [burritoAmorTulum], // Burrito Amor
  r4: [taqueriaHonorioTulum], // Taquería Honorio
  r5: [posadaMargheritaTulum], // Posada Margherita
  r6: [chamicosTulum], // Chamicos Tulum
  r7: [kitchenTableTulum], // Kitchen Table
  r8: [rawLoveTulum], // Raw Love
};

export const mockRestaurants: Restaurant[] = [
  // ==================== TULUM RESTAURANTS ====================
  {
    id: 'r1',
    name: "ARCA",
    cuisine: "Mexican",
    rating: 4.9,
    reviewCount: 2847,
    priceRange: '$$$$',
    address: "Carr. Tulum-Boca Paila km 7.6",
    neighborhood: "Tulum Beach",
    city: "Tulum",
    zipCode: "77780",
    phone: "+52 984 147 0084",
    hours: {
      monday: { open: "Closed", close: "Closed" },
      tuesday: { open: "6:00 PM", close: "11:00 PM" },
      wednesday: { open: "6:00 PM", close: "11:00 PM" },
      thursday: { open: "6:00 PM", close: "11:00 PM" },
      friday: { open: "6:00 PM", close: "11:00 PM" },
      saturday: { open: "6:00 PM", close: "11:00 PM" },
      sunday: { open: "6:00 PM", close: "11:00 PM" },
    },
    description: "Michelin-recommended contemporary Mexican by Chef Jose Luis Hinostroza. Open-fire cooking with complex small plates like softshell crab tacos and seared octopus. On Latin America's 50 Best list.",
    photos: uniqueRestaurantPhotos.r1,
    features: ["Outdoor Seating", "Open-Fire Cooking", "Fine Dining", "Reservations Required"],
    hasOutdoorSeating: true,
    reservationPlatform: 'resy',
    reservationUrl: 'https://resy.com/cities/tulum-mx/arca',
    coordinates: { lat: 20.2048, lng: -87.4312 },
  },
  {
    id: 'r2',
    name: "Hartwood",
    cuisine: "Mexican",
    rating: 4.8,
    reviewCount: 3247,
    priceRange: '$$$$',
    address: "Carr. Tulum-Boca Paila km 7.6",
    neighborhood: "Tulum Beach",
    city: "Tulum",
    zipCode: "77780",
    phone: "+52 984 115 4270",
    hours: {
      monday: { open: "Closed", close: "Closed" },
      tuesday: { open: "6:00 PM", close: "10:30 PM" },
      wednesday: { open: "6:00 PM", close: "10:30 PM" },
      thursday: { open: "6:00 PM", close: "10:30 PM" },
      friday: { open: "6:00 PM", close: "10:30 PM" },
      saturday: { open: "6:00 PM", close: "10:30 PM" },
      sunday: { open: "6:00 PM", close: "10:30 PM" },
    },
    description: "Michelin-recommended wood-fired restaurant serving sustainable Yucatecan cuisine. Daily changing menu based on local harvests, cooked over open flames. Solar-powered and off-grid. Reservations essential.",
    photos: uniqueRestaurantPhotos.r2,
    features: ["Outdoor Seating", "Wood-Fired Cooking", "Farm-to-Table", "Reservations Required"],
    hasOutdoorSeating: true,
    reservationPlatform: 'resy',
    reservationUrl: 'https://resy.com/cities/tulum-mx/hartwood',
    coordinates: { lat: 20.2047, lng: -87.4313 },
  },
  {
    id: 'r3',
    name: "Burrito Amor",
    cuisine: "Mexican",
    rating: 4.7,
    reviewCount: 4521,
    priceRange: '$',
    address: "Av. Tulum Pte. Mz 3 Lote 51",
    neighborhood: "Tulum Centro",
    city: "Tulum",
    zipCode: "77760",
    phone: "+52 984 871 2959",
    hours: {
      monday: { open: "8:00 AM", close: "10:00 PM" },
      tuesday: { open: "8:00 AM", close: "10:00 PM" },
      wednesday: { open: "8:00 AM", close: "10:00 PM" },
      thursday: { open: "8:00 AM", close: "10:00 PM" },
      friday: { open: "8:00 AM", close: "10:00 PM" },
      saturday: { open: "8:00 AM", close: "10:00 PM" },
      sunday: { open: "8:00 AM", close: "10:00 PM" },
    },
    description: "Beloved healthy Mexican spot famous for gourmet burritos wrapped in banana leaves. Fresh juices, bowls, and clean eating in the heart of Tulum Pueblo. A local and tourist favorite.",
    photos: uniqueRestaurantPhotos.r3,
    features: ["Outdoor Seating", "Healthy Options", "Vegetarian Friendly", "Quick Service"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 20.2114, lng: -87.4656 },
  },
  {
    id: 'r4',
    name: "Taquería Honorio",
    cuisine: "Mexican",
    rating: 4.8,
    reviewCount: 3892,
    priceRange: '$',
    address: "Satélite Sur s/n",
    neighborhood: "Tulum Centro",
    city: "Tulum",
    zipCode: "77760",
    phone: "+52 984 134 5621",
    hours: {
      monday: { open: "7:00 AM", close: "2:00 PM" },
      tuesday: { open: "7:00 AM", close: "2:00 PM" },
      wednesday: { open: "7:00 AM", close: "2:00 PM" },
      thursday: { open: "7:00 AM", close: "2:00 PM" },
      friday: { open: "7:00 AM", close: "2:00 PM" },
      saturday: { open: "7:00 AM", close: "2:00 PM" },
      sunday: { open: "7:00 AM", close: "2:00 PM" },
    },
    description: "The best tacos in Tulum. Famous for authentic cochinita pibil and lechón tacos. A no-frills local favorite serving breakfast and lunch only. Get there early before they sell out!",
    photos: uniqueRestaurantPhotos.r4,
    features: ["Authentic Yucatecan", "Breakfast", "Cash Only", "Local Favorite"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 20.2089, lng: -87.4612 },
  },
  {
    id: 'r5',
    name: "Posada Margherita",
    cuisine: "Italian",
    rating: 4.6,
    reviewCount: 2156,
    priceRange: '$$$',
    address: "Carr. Tulum-Boca Paila km 4.5",
    neighborhood: "Tulum Beach",
    city: "Tulum",
    zipCode: "77780",
    phone: "+52 984 801 8493",
    hours: {
      monday: { open: "8:00 AM", close: "10:00 PM" },
      tuesday: { open: "8:00 AM", close: "10:00 PM" },
      wednesday: { open: "8:00 AM", close: "10:00 PM" },
      thursday: { open: "8:00 AM", close: "10:00 PM" },
      friday: { open: "8:00 AM", close: "11:00 PM" },
      saturday: { open: "8:00 AM", close: "11:00 PM" },
      sunday: { open: "8:00 AM", close: "10:00 PM" },
    },
    description: "Authentic Italian beachfront dining with homemade pasta and wood-fired pizzas. Beautiful jungle setting with candlelit tables. No electricity, just romance and incredible food.",
    photos: uniqueRestaurantPhotos.r5,
    features: ["Beachfront", "Romantic", "Homemade Pasta", "Candlelit"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 20.1987, lng: -87.4289 },
  },
  {
    id: 'r6',
    name: "Chamicos Tulum",
    cuisine: "Seafood",
    rating: 4.5,
    reviewCount: 1834,
    priceRange: '$$',
    address: "Carr. Tulum-Boca Paila km 10",
    neighborhood: "Tulum Beach",
    city: "Tulum",
    zipCode: "77780",
    phone: "+52 984 157 4523",
    hours: {
      monday: { open: "11:00 AM", close: "7:00 PM" },
      tuesday: { open: "11:00 AM", close: "7:00 PM" },
      wednesday: { open: "11:00 AM", close: "7:00 PM" },
      thursday: { open: "11:00 AM", close: "7:00 PM" },
      friday: { open: "11:00 AM", close: "7:00 PM" },
      saturday: { open: "11:00 AM", close: "7:00 PM" },
      sunday: { open: "11:00 AM", close: "7:00 PM" },
    },
    description: "Fresh seafood right on the beach with your feet in the sand. Famous ceviche, grilled fish, and cold beers. The ultimate laid-back Tulum beach dining experience.",
    photos: uniqueRestaurantPhotos.r6,
    features: ["Beachfront", "Fresh Seafood", "Casual Dining", "Great for Groups"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 20.1923, lng: -87.4267 },
  },
  {
    id: 'r7',
    name: "Kitchen Table",
    cuisine: "Mediterranean",
    rating: 4.7,
    reviewCount: 1567,
    priceRange: '$$$',
    address: "Calle Centauro Sur",
    neighborhood: "Tulum Centro",
    city: "Tulum",
    zipCode: "77760",
    phone: "+52 984 871 2067",
    hours: {
      monday: { open: "Closed", close: "Closed" },
      tuesday: { open: "6:00 PM", close: "10:30 PM" },
      wednesday: { open: "6:00 PM", close: "10:30 PM" },
      thursday: { open: "6:00 PM", close: "10:30 PM" },
      friday: { open: "6:00 PM", close: "10:30 PM" },
      saturday: { open: "6:00 PM", close: "10:30 PM" },
      sunday: { open: "6:00 PM", close: "10:30 PM" },
    },
    description: "Intimate farm-to-table Mediterranean dining in a beautiful garden setting. Seasonal tasting menus with wine pairings. One of Tulum's best-kept secrets for a special evening out.",
    photos: uniqueRestaurantPhotos.r7,
    features: ["Garden Setting", "Tasting Menu", "Wine Pairing", "Reservations Recommended"],
    hasOutdoorSeating: true,
    reservationPlatform: 'resy',
    reservationUrl: 'https://resy.com/cities/tulum-mx/kitchen-table',
    coordinates: { lat: 20.2098, lng: -87.4623 },
  },
  {
    id: 'r8',
    name: "Raw Love",
    cuisine: "Vegan",
    rating: 4.6,
    reviewCount: 2134,
    priceRange: '$$',
    address: "Carr. Tulum-Boca Paila km 7",
    neighborhood: "Tulum Beach",
    city: "Tulum",
    zipCode: "77780",
    phone: "+52 984 130 5782",
    hours: {
      monday: { open: "8:00 AM", close: "6:00 PM" },
      tuesday: { open: "8:00 AM", close: "6:00 PM" },
      wednesday: { open: "8:00 AM", close: "6:00 PM" },
      thursday: { open: "8:00 AM", close: "6:00 PM" },
      friday: { open: "8:00 AM", close: "6:00 PM" },
      saturday: { open: "8:00 AM", close: "6:00 PM" },
      sunday: { open: "8:00 AM", close: "6:00 PM" },
    },
    description: "Stunning beachfront vegan café with raw food, smoothie bowls, and fresh juices. Yoga vibes and ocean views make this the perfect healthy breakfast or lunch spot in Tulum.",
    photos: uniqueRestaurantPhotos.r8,
    features: ["Beachfront", "Vegan", "Raw Food", "Smoothie Bowls"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 20.2034, lng: -87.4298 },
  },

  // ==================== CANCÚN RESTAURANTS ====================
  {
    id: 'c1',
    name: "Lorenzillo's",
    cuisine: "Seafood",
    rating: 4.6,
    reviewCount: 4521,
    priceRange: '$$$$',
    address: "Blvd. Kukulcan Km 10.5, Zona Hotelera",
    neighborhood: "Hotel Zone",
    city: "Cancún",
    zipCode: "77500",
    phone: "+52 998 883 1254",
    hours: {
      monday: { open: "1:00 PM", close: "11:00 PM" },
      tuesday: { open: "1:00 PM", close: "11:00 PM" },
      wednesday: { open: "1:00 PM", close: "11:00 PM" },
      thursday: { open: "1:00 PM", close: "11:00 PM" },
      friday: { open: "1:00 PM", close: "11:30 PM" },
      saturday: { open: "1:00 PM", close: "11:30 PM" },
      sunday: { open: "1:00 PM", close: "11:00 PM" },
    },
    description: "World-famous lobster house since 1983. Live lobster tanks where you choose your own. Stunning lagoon-side setting with Caribbean views. A Cancún institution for seafood lovers.",
    photos: [seafood1],
    features: ["Waterfront", "Live Lobster Tank", "Fine Dining", "Romantic"],
    hasOutdoorSeating: true,
    reservationPlatform: 'opentable',
    reservationUrl: 'https://www.opentable.com/r/lorenzillos-cancun',
    coordinates: { lat: 21.1021, lng: -86.7709 },
  },
  {
    id: 'c2',
    name: "Harry's Prime Steakhouse",
    cuisine: "Steakhouse",
    rating: 4.7,
    reviewCount: 2834,
    priceRange: '$$$$',
    address: "Blvd. Kukulcan Km 14.2, Zona Hotelera",
    neighborhood: "Hotel Zone",
    city: "Cancún",
    zipCode: "77500",
    phone: "+52 998 840 6550",
    hours: {
      monday: { open: "1:00 PM", close: "12:00 AM" },
      tuesday: { open: "1:00 PM", close: "12:00 AM" },
      wednesday: { open: "1:00 PM", close: "12:00 AM" },
      thursday: { open: "1:00 PM", close: "12:00 AM" },
      friday: { open: "1:00 PM", close: "1:00 AM" },
      saturday: { open: "1:00 PM", close: "1:00 AM" },
      sunday: { open: "1:00 PM", close: "12:00 AM" },
    },
    description: "Upscale steakhouse featuring USDA Prime and Japanese Wagyu beef. Elegant ambiance with impeccable service. Perfect for special occasions and business dinners.",
    photos: [steakhouse1],
    features: ["Fine Dining", "Wagyu Beef", "Wine Cellar", "Private Rooms"],
    hasOutdoorSeating: false,
    reservationPlatform: 'opentable',
    reservationUrl: 'https://www.opentable.com/r/harrys-prime-steakhouse-cancun',
    coordinates: { lat: 21.0876, lng: -86.7634 },
  },
  {
    id: 'c3',
    name: "Puerto Madero",
    cuisine: "Seafood",
    rating: 4.5,
    reviewCount: 3156,
    priceRange: '$$$',
    address: "Blvd. Kukulcan Km 14.1, Zona Hotelera",
    neighborhood: "Hotel Zone",
    city: "Cancún",
    zipCode: "77500",
    phone: "+52 998 885 2829",
    hours: {
      monday: { open: "12:00 PM", close: "11:30 PM" },
      tuesday: { open: "12:00 PM", close: "11:30 PM" },
      wednesday: { open: "12:00 PM", close: "11:30 PM" },
      thursday: { open: "12:00 PM", close: "11:30 PM" },
      friday: { open: "12:00 PM", close: "12:00 AM" },
      saturday: { open: "12:00 PM", close: "12:00 AM" },
      sunday: { open: "12:00 PM", close: "11:30 PM" },
    },
    description: "Argentinian-style seafood and steakhouse overlooking the lagoon. Known for excellent cuts of meat and fresh seafood. Live music on weekends adds to the festive atmosphere.",
    photos: [seafood2],
    features: ["Lagoon Views", "Live Music", "Seafood & Steaks", "Great Wine List"],
    hasOutdoorSeating: true,
    reservationPlatform: 'opentable',
    reservationUrl: 'https://www.opentable.com/r/puerto-madero-cancun',
    coordinates: { lat: 21.0889, lng: -86.7641 },
  },
  {
    id: 'c4',
    name: "La Habichuela Sunset",
    cuisine: "Yucatecan",
    rating: 4.6,
    reviewCount: 2678,
    priceRange: '$$$',
    address: "Blvd. Kukulcan Km 12.6, Zona Hotelera",
    neighborhood: "Hotel Zone",
    city: "Cancún",
    zipCode: "77500",
    phone: "+52 998 840 6280",
    hours: {
      monday: { open: "12:00 PM", close: "11:00 PM" },
      tuesday: { open: "12:00 PM", close: "11:00 PM" },
      wednesday: { open: "12:00 PM", close: "11:00 PM" },
      thursday: { open: "12:00 PM", close: "11:00 PM" },
      friday: { open: "12:00 PM", close: "11:30 PM" },
      saturday: { open: "12:00 PM", close: "11:30 PM" },
      sunday: { open: "12:00 PM", close: "11:00 PM" },
    },
    description: "Gourmet Yucatecan cuisine in a romantic garden setting. Famous for cochinita pibil and Mayan-inspired dishes. Family-owned since 1977 with authentic regional flavors.",
    photos: [mexican1],
    features: ["Garden Setting", "Traditional Yucatecan", "Romantic", "Family-Owned"],
    hasOutdoorSeating: true,
    reservationPlatform: 'opentable',
    reservationUrl: 'https://www.opentable.com/r/la-habichuela-sunset-cancun',
    coordinates: { lat: 21.0945, lng: -86.7678 },
  },
  {
    id: 'c5',
    name: "Thai Lounge",
    cuisine: "Thai",
    rating: 4.4,
    reviewCount: 1523,
    priceRange: '$$',
    address: "Blvd. Kukulcan Km 9.5, Zona Hotelera",
    neighborhood: "Hotel Zone",
    city: "Cancún",
    zipCode: "77500",
    phone: "+52 998 176 8070",
    hours: {
      monday: { open: "1:00 PM", close: "11:00 PM" },
      tuesday: { open: "1:00 PM", close: "11:00 PM" },
      wednesday: { open: "1:00 PM", close: "11:00 PM" },
      thursday: { open: "1:00 PM", close: "11:00 PM" },
      friday: { open: "1:00 PM", close: "11:30 PM" },
      saturday: { open: "1:00 PM", close: "11:30 PM" },
      sunday: { open: "1:00 PM", close: "11:00 PM" },
    },
    description: "Authentic Thai cuisine with a modern twist overlooking the lagoon. Fresh ingredients and bold flavors. Great for a change of pace from Mexican food.",
    photos: [mediterranean1],
    features: ["Lagoon Views", "Asian Fusion", "Craft Cocktails", "Outdoor Terrace"],
    hasOutdoorSeating: true,
    reservationPlatform: 'yelp',
    reservationUrl: 'https://www.yelp.com/biz/thai-lounge-cancun',
    coordinates: { lat: 21.1067, lng: -86.7732 },
  },
  {
    id: 'c6',
    name: "Tacos Rigo",
    cuisine: "Mexican",
    rating: 4.5,
    reviewCount: 2834,
    priceRange: '$',
    address: "Av. Cobá 30, SM 22",
    neighborhood: "Downtown",
    city: "Cancún",
    zipCode: "77500",
    phone: "+52 998 884 4047",
    hours: {
      monday: { open: "6:00 PM", close: "3:00 AM" },
      tuesday: { open: "6:00 PM", close: "3:00 AM" },
      wednesday: { open: "6:00 PM", close: "3:00 AM" },
      thursday: { open: "6:00 PM", close: "3:00 AM" },
      friday: { open: "6:00 PM", close: "4:00 AM" },
      saturday: { open: "6:00 PM", close: "4:00 AM" },
      sunday: { open: "6:00 PM", close: "3:00 AM" },
    },
    description: "Legendary late-night taco spot beloved by locals and visitors alike. Al pastor and suadero tacos are the stars. Perfect after a night out in downtown Cancún.",
    photos: [mexican2],
    features: ["Late Night", "Local Favorite", "Authentic Tacos", "Casual"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 21.1619, lng: -86.8282 },
  },

  // ==================== PLAYA DEL CARMEN RESTAURANTS ====================
  {
    id: 'p1',
    name: "Alux Restaurant",
    cuisine: "Mexican",
    rating: 4.7,
    reviewCount: 3456,
    priceRange: '$$$$',
    address: "Av. Juárez, Mz. 217",
    neighborhood: "Downtown",
    city: "Playa del Carmen",
    zipCode: "77710",
    phone: "+52 984 206 0713",
    hours: {
      monday: { open: "6:00 PM", close: "12:00 AM" },
      tuesday: { open: "6:00 PM", close: "12:00 AM" },
      wednesday: { open: "6:00 PM", close: "12:00 AM" },
      thursday: { open: "6:00 PM", close: "12:00 AM" },
      friday: { open: "6:00 PM", close: "1:00 AM" },
      saturday: { open: "6:00 PM", close: "1:00 AM" },
      sunday: { open: "6:00 PM", close: "12:00 AM" },
    },
    description: "Dine inside a 10,000-year-old natural cave cenote. One of the most unique dining experiences in Mexico. Contemporary Mexican cuisine in an unforgettable underground setting.",
    photos: [fineDining1],
    features: ["Cave Dining", "Unique Experience", "Contemporary Mexican", "Romantic"],
    hasOutdoorSeating: false,
    reservationPlatform: 'opentable',
    reservationUrl: 'https://www.opentable.com/r/alux-restaurant-playa-del-carmen',
    coordinates: { lat: 20.6210, lng: -87.0778 },
  },
  {
    id: 'p2',
    name: "Catch Playa",
    cuisine: "Seafood",
    rating: 4.5,
    reviewCount: 1876,
    priceRange: '$$$',
    address: "Calle 38 Norte",
    neighborhood: "Playacar",
    city: "Playa del Carmen",
    zipCode: "77710",
    phone: "+52 984 803 3714",
    hours: {
      monday: { open: "12:00 PM", close: "11:00 PM" },
      tuesday: { open: "12:00 PM", close: "11:00 PM" },
      wednesday: { open: "12:00 PM", close: "11:00 PM" },
      thursday: { open: "12:00 PM", close: "11:00 PM" },
      friday: { open: "12:00 PM", close: "11:30 PM" },
      saturday: { open: "12:00 PM", close: "11:30 PM" },
      sunday: { open: "12:00 PM", close: "11:00 PM" },
    },
    description: "Contemporary seafood restaurant with beachfront views. Fresh ceviche, whole grilled fish, and creative cocktails. Perfect for sunset dining on the Caribbean.",
    photos: [seafood3],
    features: ["Beachfront", "Fresh Seafood", "Sunset Views", "Craft Cocktails"],
    hasOutdoorSeating: true,
    reservationPlatform: 'opentable',
    reservationUrl: 'https://www.opentable.com/r/catch-playa-del-carmen',
    coordinates: { lat: 20.6312, lng: -87.0698 },
  },
  {
    id: 'p3',
    name: "La Cueva del Chango",
    cuisine: "Mexican",
    rating: 4.6,
    reviewCount: 4123,
    priceRange: '$$',
    address: "Calle 38 entre 5ta Av. y la Playa",
    neighborhood: "Centro",
    city: "Playa del Carmen",
    zipCode: "77710",
    phone: "+52 984 147 0271",
    hours: {
      monday: { open: "8:00 AM", close: "11:00 PM" },
      tuesday: { open: "8:00 AM", close: "11:00 PM" },
      wednesday: { open: "8:00 AM", close: "11:00 PM" },
      thursday: { open: "8:00 AM", close: "11:00 PM" },
      friday: { open: "8:00 AM", close: "11:00 PM" },
      saturday: { open: "8:00 AM", close: "11:00 PM" },
      sunday: { open: "8:00 AM", close: "11:00 PM" },
    },
    description: "Jungle-themed breakfast and brunch spot famous for chilaquiles and fresh juices. Lush garden setting with monkeys in nearby trees. A Playa del Carmen institution.",
    photos: [mexican1],
    features: ["Garden Setting", "Famous Breakfast", "Fresh Juices", "Pet Friendly"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 20.6298, lng: -87.0712 },
  },
  {
    id: 'p4',
    name: "El Fogón",
    cuisine: "Mexican",
    rating: 4.7,
    reviewCount: 5234,
    priceRange: '$',
    address: "Av. Constituyentes entre 30 y 35",
    neighborhood: "Downtown",
    city: "Playa del Carmen",
    zipCode: "77710",
    phone: "+52 984 803 0274",
    hours: {
      monday: { open: "6:00 PM", close: "2:00 AM" },
      tuesday: { open: "6:00 PM", close: "2:00 AM" },
      wednesday: { open: "6:00 PM", close: "2:00 AM" },
      thursday: { open: "6:00 PM", close: "2:00 AM" },
      friday: { open: "6:00 PM", close: "3:00 AM" },
      saturday: { open: "6:00 PM", close: "3:00 AM" },
      sunday: { open: "6:00 PM", close: "2:00 AM" },
    },
    description: "The best al pastor tacos in Playa del Carmen, hands down. Locals queue up nightly for perfectly marinated pork carved from the trompo. Cheap, authentic, and delicious.",
    photos: [mexican2],
    features: ["Al Pastor", "Local Favorite", "Late Night", "Authentic"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 20.6278, lng: -87.0756 },
  },
  {
    id: 'p5',
    name: "Carboncitos",
    cuisine: "Mexican",
    rating: 4.5,
    reviewCount: 2345,
    priceRange: '$',
    address: "Calle 4 Norte",
    neighborhood: "Centro",
    city: "Playa del Carmen",
    zipCode: "77710",
    phone: "+52 984 873 1382",
    hours: {
      monday: { open: "7:00 AM", close: "12:00 AM" },
      tuesday: { open: "7:00 AM", close: "12:00 AM" },
      wednesday: { open: "7:00 AM", close: "12:00 AM" },
      thursday: { open: "7:00 AM", close: "12:00 AM" },
      friday: { open: "7:00 AM", close: "1:00 AM" },
      saturday: { open: "7:00 AM", close: "1:00 AM" },
      sunday: { open: "7:00 AM", close: "12:00 AM" },
    },
    description: "Popular local spot for tacos, tortas, and Mexican classics. Open from breakfast to late night. Great value and consistently good food loved by expats and tourists.",
    photos: [mexican2],
    features: ["All Day", "Great Value", "Casual", "Family Friendly"],
    hasOutdoorSeating: true,
    reservationPlatform: null,
    coordinates: { lat: 20.6289, lng: -87.0734 },
  },
  {
    id: 'p6',
    name: "Oh La La",
    cuisine: "French",
    rating: 4.6,
    reviewCount: 1567,
    priceRange: '$$$',
    address: "Calle 14 Norte",
    neighborhood: "Centro",
    city: "Playa del Carmen",
    zipCode: "77710",
    phone: "+52 984 879 0226",
    hours: {
      monday: { open: "Closed", close: "Closed" },
      tuesday: { open: "6:00 PM", close: "11:00 PM" },
      wednesday: { open: "6:00 PM", close: "11:00 PM" },
      thursday: { open: "6:00 PM", close: "11:00 PM" },
      friday: { open: "6:00 PM", close: "11:30 PM" },
      saturday: { open: "6:00 PM", close: "11:30 PM" },
      sunday: { open: "6:00 PM", close: "11:00 PM" },
    },
    description: "Charming French bistro with a romantic courtyard. Classic dishes like duck confit and bouillabaisse. Excellent wine selection and attentive service. Perfect for date night.",
    photos: [french1],
    features: ["French Cuisine", "Romantic", "Courtyard Dining", "Wine Selection"],
    hasOutdoorSeating: true,
    reservationPlatform: 'opentable',
    reservationUrl: 'https://www.opentable.com/r/oh-la-la-playa-del-carmen',
    coordinates: { lat: 20.6301, lng: -87.0723 },
  },
];

// Location suggestions for autocomplete
export const locationSuggestions = [
  { type: 'city', value: 'Tulum', state: 'QR', zipCode: '77780' },
  { type: 'city', value: 'Tulum Centro', state: 'QR', zipCode: '77760' },
  { type: 'city', value: 'Tulum Beach', state: 'QR', zipCode: '77780' },
  { type: 'zip', value: '77780', city: 'Tulum Beach', state: 'QR' },
  { type: 'zip', value: '77760', city: 'Tulum Centro', state: 'QR' },
  { type: 'city', value: 'Cancún', state: 'QR', zipCode: '77500' },
  { type: 'city', value: 'Playa del Carmen', state: 'QR', zipCode: '77710' },
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
        (r.neighborhood && r.neighborhood.toLowerCase().includes(cityLower))
      );
    }
    return false;
  });
};
