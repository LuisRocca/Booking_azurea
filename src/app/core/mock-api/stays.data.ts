import type { Stay } from '../models.ts';

/** The fake API's table of stays. Edit freely: nothing else hardcodes these. */
export const STAYS: readonly Stay[] = [
  {
    id: 'lisbon-alfama',
    name: 'Loft en Alfama',
    city: 'Lisboa',
    country: 'Portugal',
    pricePerNight: 95,
    rating: 4.8,
    maxGuests: 2,
    imageUrl: 'https://picsum.photos/seed/alfama/800/500',
    description:
      'Un loft luminoso en el barrio más antiguo de Lisboa, a dos calles del tranvía 28 y con vistas al Tajo.',
    amenities: ['Wifi', 'Cocina', 'Aire acondicionado', 'Vistas al río'],
  },
  {
    id: 'barcelona-gracia',
    name: 'Piso con terraza en Gràcia',
    city: 'Barcelona',
    country: 'España',
    pricePerNight: 130,
    rating: 4.6,
    maxGuests: 4,
    imageUrl: 'https://picsum.photos/seed/gracia/800/500',
    description:
      'Dos habitaciones y una terraza privada en el corazón de Gràcia, rodeado de plazas y cafés.',
    amenities: ['Wifi', 'Terraza', 'Lavadora', 'Cocina'],
  },
  {
    id: 'cusco-sanblas',
    name: 'Casa colonial en San Blas',
    city: 'Cusco',
    country: 'Perú',
    pricePerNight: 70,
    rating: 4.9,
    maxGuests: 5,
    imageUrl: 'https://picsum.photos/seed/sanblas/800/500',
    description:
      'Patio de piedra, vigas de madera y chimenea, a cinco minutos a pie de la Plaza de Armas.',
    amenities: ['Wifi', 'Chimenea', 'Desayuno disponible', 'Patio'],
  },
  {
    id: 'cdmx-roma',
    name: 'Estudio en la Roma Norte',
    city: 'Ciudad de México',
    country: 'México',
    pricePerNight: 60,
    rating: 4.5,
    maxGuests: 2,
    imageUrl: 'https://picsum.photos/seed/romanorte/800/500',
    description:
      'Estudio de diseño en un edificio art déco, a pasos de los mejores restaurantes de la ciudad.',
    amenities: ['Wifi', 'Escritorio', 'Gimnasio', 'Cocina'],
  },
  {
    id: 'cartagena-centro',
    name: 'Casa en el Centro Histórico',
    city: 'Cartagena',
    country: 'Colombia',
    pricePerNight: 150,
    rating: 4.7,
    maxGuests: 6,
    imageUrl: 'https://picsum.photos/seed/cartagena/800/500',
    description:
      'Casa restaurada dentro de la ciudad amurallada, con piscina en la azotea y balcones de madera.',
    amenities: ['Wifi', 'Piscina', 'Aire acondicionado', 'Azotea'],
  },
  {
    id: 'bariloche-lago',
    name: 'Cabaña frente al lago',
    city: 'Bariloche',
    country: 'Argentina',
    pricePerNight: 110,
    rating: 4.9,
    maxGuests: 4,
    imageUrl: 'https://picsum.photos/seed/bariloche/800/500',
    description:
      'Cabaña de madera con salida directa al Nahuel Huapi, estufa a leña y un muelle propio.',
    amenities: ['Wifi', 'Estufa a leña', 'Muelle', 'Estacionamiento'],
  },
];
