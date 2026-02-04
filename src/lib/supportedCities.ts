export interface SupportedCity {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const SUPPORTED_CITIES: SupportedCity[] = [
  { id: "tulum", name: "Tulum", lat: 20.2114, lng: -87.4654 },
  { id: "cancun", name: "Cancún", lat: 21.1619, lng: -86.8515 },
  { id: "playa-del-carmen", name: "Playa del Carmen", lat: 20.6296, lng: -87.0739 },
];

export const DEFAULT_CITY = SUPPORTED_CITIES[0]; // Tulum

export const getCityByName = (name: string): SupportedCity | undefined => {
  return SUPPORTED_CITIES.find(
    (city) => city.name.toLowerCase() === name.toLowerCase()
  );
};

export const getCityById = (id: string): SupportedCity | undefined => {
  return SUPPORTED_CITIES.find((city) => city.id === id);
};
