export const dashboardStats = [
  { 
    label: "Total Earnings", 
    value: "$847", 
    icon: "DollarSign", 
    color: "text-primary" 
  },
  { 
    label: "Bookings", 
    value: "23", 
    icon: "Calendar", 
    color: "text-secondary" 
  },
  { 
    label: "Active Vendors", 
    value: "8", 
    icon: "Users", 
    color: "text-primary" 
  },
  { 
    label: "Avg Rating", 
    value: "4.8★", 
    icon: "Star", 
    color: "text-secondary" 
  },
];

export const vendorDashboardStats = [
  { 
    label: "Total Revenue", 
    value: "$3,240", 
    icon: "DollarSign", 
    color: "text-primary" 
  },
  { 
    label: "Bookings", 
    value: "47", 
    icon: "Calendar", 
    color: "text-secondary" 
  },
  { 
    label: "Active Hosts", 
    value: "12", 
    icon: "Users", 
    color: "text-primary" 
  },
  { 
    label: "Rating", 
    value: "4.9★", 
    icon: "Star", 
    color: "text-secondary" 
  },
];

export const recentBookings = [
  { 
    service: "Sunset Kayak Tour", 
    vendor: "Ocean Adventures", 
    date: "Aug 15, 2024", 
    amount: "$160" 
  },
  { 
    service: "Beach Bike Rental", 
    vendor: "Coastal Bikes", 
    date: "Aug 14, 2024", 
    amount: "$90" 
  },
  { 
    service: "Couples Massage", 
    vendor: "Relax Spa Team", 
    date: "Aug 12, 2024", 
    amount: "$360" 
  },
  { 
    service: "Surf Lessons", 
    vendor: "Surf School Pro", 
    date: "Aug 10, 2024", 
    amount: "$120" 
  },
];

export const upcomingBookings = [
  { 
    service: "Sunset Kayak Tour",
    date: "Aug 18 2024",
    time: "6:00 PM",
    guest: "Sarah Johnson",
    host: "Beach House Paradise"
  },
  { 
    service: "Snorkeling Adventure",
    date: "Aug 19 2024",
    time: "10:00 AM",
    guest: "Mike Chen",
    host: "Sunset Villa"
  },
  { 
    service: "Beach Photography Session",
    date: "Aug 20 2024",
    time: "4:30 PM",
    guest: "Emma Davis",
    host: "Ocean View Resort"
  },
];

export const vendorServices = [
  {
    id: 1,
    name: "Sunset Kayak Tour",
    duration: "2 hours",
    capacity: "Max 6 people",
    price: "$80.00",
    description: "Experience the beauty of sunset while kayaking along the coast"
  },
  {
    id: 2,
    name: "Snorkeling Adventure",
    duration: "3 hours",
    capacity: "Max 8 people",
    price: "$95.00",
    description: "Explore vibrant coral reefs and marine life"
  },
  {
    id: 3,
    name: "Beach Photography Session",
    duration: "1.5 hours",
    capacity: "Max 4 people",
    price: "$150.00",
    description: "Professional photography session at scenic beach locations"
  },
];

export const vendors = [
  {
    id: 1,
    name: "Ocean Adventures",
    description: "Kayaking, paddleboarding, and boat tours",
    commission: "20%",
    category: "Water Sports",
    email: "info@oceanadventures.com",
    phone: "(555) 111-2222"
  },
  {
    id: 2,
    name: "Beach Bike Rentals",
    description: "Premium bike rentals and guided tours",
    commission: "15%",
    category: "Transportation",
    email: "rentals@beachbikes.com",
    phone: "(555) 222-3333"
  },
  {
    id: 3,
    name: "Sunset Sailing Co",
    description: "Private sailing experiences at sunset",
    commission: "25%",
    category: "Water Sports",
    email: "sail@sunsetsailing.com",
    phone: "(555) 333-4444"
  },
  {
    id: 4,
    name: "Local Food Tours",
    description: "Curated culinary experiences",
    commission: "18%",
    category: "Food & Dining",
    email: "tours@localfood.com",
    phone: "(555) 444-5555"
  },
  {
    id: 5,
    name: "Spa by the Sea",
    description: "Relaxation and wellness treatments",
    commission: "22%",
    category: "Wellness",
    email: "relax@spabythesea.com",
    phone: "(555) 555-6666"
  },
  {
    id: 6,
    name: "Island Photography",
    description: "Professional vacation photoshoots",
    commission: "20%",
    category: "Photography",
    email: "photos@islandphoto.com",
    phone: "(555) 666-7777"
  },
  {
    id: 7,
    name: "Surf School Pro",
    description: "Surf lessons for all skill levels",
    commission: "17%",
    category: "Water Sports",
    email: "learn@surfschoolpro.com",
    phone: "(555) 777-8888"
  },
  {
    id: 8,
    name: "Private Chef Services",
    description: "In-home dining experiences",
    commission: "15%",
    category: "Food & Dining",
    email: "chef@privatechef.com",
    phone: "(555) 888-9999"
  },
];

export const categories = [
  "Water Sports",
  "Transportation",
  "Food & Dining",
  "Wellness",
  "Photography",
  "Entertainment",
  "Tours & Activities"
];

export const experiences = [
  {
    id: 1,
    name: "Sunset Kayak Tour",
    vendor: "Ocean Adventures",
    vendorId: 1,
    category: "Water Sports",
    categoryIcon: "🌊",
    price: 80,
    duration: "2 hours",
    maxGuests: 6,
    rating: 4.9,
    reviewCount: 124,
    description: "Experience the beauty of sunset while kayaking along the pristine coastline. Perfect for beginners and experienced paddlers alike.",
    included: [
      "Professional kayak equipment",
      "Safety gear and instruction",
      "Sunset snacks and beverages",
      "Professional photos",
      "Small group (max 6 people)"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Beach Bike Rental",
    vendor: "Coastal Bikes",
    vendorId: 2,
    category: "Transportation",
    categoryIcon: "🚴",
    price: 45,
    duration: "Full day",
    maxGuests: 4,
    rating: 4.7,
    reviewCount: 89,
    description: "Explore the coastal town at your own pace with our premium beach cruisers. Includes helmet, lock, and a local's guide to the best spots.",
    included: [
      "Premium beach cruiser bike",
      "Helmet and lock",
      "Basket for belongings",
      "Local attractions map",
      "24-hour support"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Snorkeling Adventure",
    vendor: "Ocean Adventures",
    vendorId: 1,
    category: "Water Sports",
    categoryIcon: "🌊",
    price: 95,
    duration: "3 hours",
    maxGuests: 8,
    rating: 5.0,
    reviewCount: 156,
    description: "Discover vibrant coral reefs and tropical fish in crystal-clear waters. Our expert guides ensure a safe and unforgettable underwater adventure.",
    included: [
      "All snorkeling equipment",
      "Wetsuit if needed",
      "Underwater camera rental",
      "Light refreshments",
      "Marine life guide"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 4,
    name: "Beach Photography Session",
    vendor: "Island Photography",
    vendorId: 6,
    category: "Photography",
    categoryIcon: "📸",
    price: 150,
    duration: "1.5 hours",
    maxGuests: 4,
    rating: 4.8,
    reviewCount: 67,
    description: "Capture your vacation memories with a professional photography session at the most beautiful beach locations.",
    included: [
      "1.5 hour session",
      "50+ edited photos",
      "Online gallery",
      "Print-ready files",
      "Location scouting"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 5,
    name: "Couples Spa Experience",
    vendor: "Spa by the Sea",
    vendorId: 5,
    category: "Wellness",
    categoryIcon: "💆",
    price: 180,
    duration: "90 minutes",
    maxGuests: 2,
    rating: 4.9,
    reviewCount: 201,
    description: "Indulge in a relaxing couples massage with ocean views. Includes aromatherapy, hot stones, and champagne.",
    included: [
      "90-minute couples massage",
      "Aromatherapy oils",
      "Hot stone therapy",
      "Champagne and chocolates",
      "Private treatment room"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 6,
    name: "Food & Wine Tour",
    vendor: "Local Food Tours",
    vendorId: 4,
    category: "Food & Dining",
    categoryIcon: "🍷",
    price: 120,
    duration: "4 hours",
    maxGuests: 10,
    rating: 4.8,
    reviewCount: 143,
    description: "Taste the best local cuisine and wines while exploring the charming downtown area with our expert food guide.",
    included: [
      "5 food stops",
      "3 wine tastings",
      "Local guide",
      "Historical walking tour",
      "Recipe cards"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 7,
    name: "ATV Jungle Adventure",
    vendor: "Adventure Seekers",
    vendorId: 9,
    category: "Tours & Activities",
    categoryIcon: "🏍️",
    price: 135,
    duration: "3 hours",
    maxGuests: 8,
    rating: 4.9,
    reviewCount: 178,
    description: "Ride through lush jungle trails on powerful ATVs. Experience muddy tracks, river crossings, and breathtaking mountain views.",
    included: [
      "ATV and safety gear",
      "Professional guide",
      "Safety briefing",
      "Refreshments and snacks",
      "Action photos"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 8,
    name: "Private Boat Rental",
    vendor: "Marina Bay Charters",
    vendorId: 10,
    category: "Water Sports",
    categoryIcon: "🚤",
    price: 250,
    duration: "4 hours",
    maxGuests: 10,
    rating: 5.0,
    reviewCount: 92,
    description: "Charter your own private boat for island hopping, fishing, or coastal exploration. Captain and fuel included.",
    included: [
      "Private boat with captain",
      "Fuel and equipment",
      "Snorkeling gear",
      "Cooler with ice",
      "Bluetooth sound system"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 9,
    name: "Jungle Zip Line & Canopy Tour",
    vendor: "Canopy Adventures",
    vendorId: 11,
    category: "Tours & Activities",
    categoryIcon: "🌳",
    price: 110,
    duration: "2.5 hours",
    maxGuests: 12,
    rating: 4.9,
    reviewCount: 234,
    description: "Soar through the jungle canopy on 8 zip lines with platforms offering stunning forest views. Perfect for thrill-seekers!",
    included: [
      "8 zip line courses",
      "All safety equipment",
      "Professional guides",
      "Jungle nature walk",
      "Photo opportunities"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 10,
    name: "Horseback Riding on Beach",
    vendor: "Coastal Stables",
    vendorId: 12,
    category: "Tours & Activities",
    categoryIcon: "🐴",
    price: 90,
    duration: "2 hours",
    maxGuests: 6,
    rating: 4.7,
    reviewCount: 145,
    description: "Experience the magic of riding gentle horses along pristine beaches at sunset. Perfect for all experience levels.",
    included: [
      "Well-trained horses",
      "Riding helmets",
      "Professional instructor",
      "Beach sunset views",
      "Photo session"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 11,
    name: "Scuba Diving Certification",
    vendor: "Deep Blue Dive School",
    vendorId: 13,
    category: "Water Sports",
    categoryIcon: "🤿",
    price: 450,
    duration: "2 days",
    maxGuests: 4,
    rating: 5.0,
    reviewCount: 88,
    description: "Get PADI certified with our expert instructors. Includes classroom, pool training, and 4 open water dives.",
    included: [
      "PADI certification",
      "All diving equipment",
      "Digital learning materials",
      "4 open water dives",
      "Certification card"
    ],
    image: "/placeholder.svg"
  },
  {
    id: 12,
    name: "Mountain Hiking Expedition",
    vendor: "Peak Adventures",
    vendorId: 14,
    category: "Tours & Activities",
    categoryIcon: "⛰️",
    price: 85,
    duration: "5 hours",
    maxGuests: 10,
    rating: 4.8,
    reviewCount: 167,
    description: "Hike to stunning viewpoints with panoramic ocean and mountain views. Includes lunch at a scenic overlook.",
    included: [
      "Experienced hiking guide",
      "Hiking poles if needed",
      "Packed lunch",
      "Water and snacks",
      "First aid support"
    ],
    image: "/placeholder.svg"
  }
];

export const activeHosts = [
  {
    id: 1,
    name: "Sarah Martinez",
    propertyName: "Beach House Paradise",
    email: "sarah@beachhouse.com",
    phone: "(555) 123-4567"
  },
  {
    id: 2,
    name: "John Davis",
    propertyName: "Sunset Villa",
    email: "john@sunsetvilla.com",
    phone: "(555) 234-5678"
  },
  {
    id: 3,
    name: "Emily Chen",
    propertyName: "Ocean View Resort",
    email: "emily@oceanview.com",
    phone: "(555) 345-6789"
  },
  {
    id: 4,
    name: "Michael Brown",
    propertyName: "Coastal Retreat",
    email: "michael@coastalretreat.com",
    phone: "(555) 456-7890"
  },
  {
    id: 5,
    name: "Amanda Wilson",
    propertyName: "Seabreeze Cottage",
    email: "amanda@seabreeze.com",
    phone: "(555) 567-8901"
  },
  {
    id: 6,
    name: "David Thompson",
    propertyName: "Palm Paradise",
    email: "david@palmparadise.com",
    phone: "(555) 678-9012"
  },
  {
    id: 7,
    name: "Lisa Garcia",
    propertyName: "Tropical Escape",
    email: "lisa@tropicalescape.com",
    phone: "(555) 789-0123"
  },
  {
    id: 8,
    name: "Robert Anderson",
    propertyName: "Marina Bay House",
    email: "robert@marinabay.com",
    phone: "(555) 890-1234"
  },
  {
    id: 9,
    name: "Jennifer Lee",
    propertyName: "Sandcastle Villa",
    email: "jennifer@sandcastle.com",
    phone: "(555) 901-2345"
  },
  {
    id: 10,
    name: "Chris Taylor",
    propertyName: "Island Oasis",
    email: "chris@islandoasis.com",
    phone: "(555) 012-3456"
  },
  {
    id: 11,
    name: "Michelle White",
    propertyName: "Coral Cove Resort",
    email: "michelle@coralcove.com",
    phone: "(555) 123-4568"
  },
  {
    id: 12,
    name: "James Rodriguez",
    propertyName: "Shoreline Suites",
    email: "james@shoreline.com",
    phone: "(555) 234-5679"
  }
];

export const revenueBreakdown = [
  {
    id: 1,
    service: "Sunset Kayak Tour",
    bookings: 18,
    amount: 1440
  },
  {
    id: 2,
    service: "Snorkeling Adventure",
    bookings: 12,
    amount: 1140
  },
  {
    id: 3,
    service: "Beach Photography Session",
    bookings: 5,
    amount: 750
  },
  {
    id: 4,
    service: "Private Sailing Charter",
    bookings: 3,
    amount: 900
  },
  {
    id: 5,
    service: "Surf Lessons",
    bookings: 8,
    amount: 640
  },
  {
    id: 6,
    service: "Stand-Up Paddleboard",
    bookings: 6,
    amount: 360
  }
];
