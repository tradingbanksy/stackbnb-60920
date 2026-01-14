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
  r1: [seafood1, seafood2, seafood3], // ARCA - Seafood/Mexican
  r2: [mexican1, mexican2, mexican4], // Hartwood - Mexican
  r3: [mexican5, mexican1, mexican2], // Burrito Amor - Mexican
  r4: [mexican4, mexican5, mexican1], // Taquería Honorio - Mexican
  r5: [italian1, italian2, italian3], // Posada Margherita - Italian
  r6: [seafood4, seafood5, seafood6], // Chamicos Tulum - Seafood
  r7: [mediterranean1, mediterranean2, mediterranean3], // Kitchen Table - Mediterranean
  r8: [vegan1, vegan2, vegan3], // Raw Love - Vegan
};

export const mockRestaurants: Restaurant[] = [
  // Tulum restaurants
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
    reservationPlatform: 'opentable',
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
];

// Location suggestions for autocomplete
export const locationSuggestions = [
  { type: 'city', value: 'Tulum', state: 'QR', zipCode: '77780' },
  { type: 'city', value: 'Tulum Centro', state: 'QR', zipCode: '77760' },
  { type: 'city', value: 'Tulum Beach', state: 'QR', zipCode: '77780' },
  { type: 'zip', value: '77780', city: 'Tulum Beach', state: 'QR' },
  { type: 'zip', value: '77760', city: 'Tulum Centro', state: 'QR' },
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
