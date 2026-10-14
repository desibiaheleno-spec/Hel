// Coordenadas aproximadas das principais regiões e capitais do Brasil para cálculo rápido e preciso
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  'são paulo': { lat: -23.5505, lng: -46.6333 },
  'sao bernardo do campo': { lat: -23.6944, lng: -46.5654 },
  'são bernardo do campo': { lat: -23.6944, lng: -46.5654 },
  'santo andre': { lat: -23.6639, lng: -46.5383 },
  'santo andré': { lat: -23.6639, lng: -46.5383 },
  'sao caetano do sul': { lat: -23.6229, lng: -46.5546 },
  'são caetano do sul': { lat: -23.6229, lng: -46.5546 },
  'diadema': { lat: -23.6865, lng: -46.6228 },
  'osasco': { lat: -23.5329, lng: -46.792 },
  'guarulhos': { lat: -23.4542, lng: -46.5333 },
  'campinas': { lat: -22.9056, lng: -47.0608 },
  'jundiai': { lat: -23.1857, lng: -46.8978 },
  'jundiaí': { lat: -23.1857, lng: -46.8978 },
  'sorocaba': { lat: -23.5015, lng: -47.4526 },
  'santos': { lat: -23.9608, lng: -46.3336 },
  'sao jose dos campos': { lat: -23.2237, lng: -45.9009 },
  'são josé dos campos': { lat: -23.2237, lng: -45.9009 },
  'ribeirao preto': { lat: -21.1775, lng: -47.8103 },
  'ribeirão preto': { lat: -21.1775, lng: -47.8103 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  'belo horizonte': { lat: -19.9167, lng: -43.9345 },
  'curitiba': { lat: -25.4297, lng: -49.2711 },
  'porto alegre': { lat: -30.0346, lng: -51.2177 },
  'florianopolis': { lat: -27.5954, lng: -48.548 },
  'florianópolis': { lat: -27.5954, lng: -48.548 },
  'brasilia': { lat: -15.7975, lng: -47.8919 },
  'brasília': { lat: -15.7975, lng: -47.8919 },
  'goiania': { lat: -16.6869, lng: -49.2648 },
  'goiânia': { lat: -16.6869, lng: -49.2648 },
  'salvador': { lat: -12.9777, lng: -38.5016 },
  'recife': { lat: -8.0476, lng: -34.877 },
  'fortaleza': { lat: -3.7172, lng: -38.5433 },
  'manaus': { lat: -3.119, lng: -60.0217 },
  'joinville': { lat: -26.3045, lng: -48.8487 },
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Fórmula de Haversine para cálculo de distância em linha reta na Terra
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface DistanceCalculationResult {
  oneWayKm: number; // Distância só ida
  roundTripKm: number; // Distância ida e volta (2x)
  suggestedPrice: number; // Valor calculado com base na taxa de km
  origin: string;
  destination: string;
}

/**
 * Calcula ou estima a quilometragem entre o endereço da empresa e o cliente
 */
export function estimateDistanceKm(
  originCity: string,
  originCep: string,
  destCity: string,
  destCep: string
): number {
  const normOrigin = normalize(originCity || 'São Paulo');
  const normDest = normalize(destCity || 'São Paulo');

  // Mesma cidade: calcula estimativa interna por diferença de CEP ou distância urbana média
  if (normOrigin === normDest) {
    if (originCep && destCep) {
      const cleanOriginCep = parseInt(originCep.replace(/\D/g, '').slice(0, 5), 10);
      const cleanDestCep = parseInt(destCep.replace(/\D/g, '').slice(0, 5), 10);
      if (!isNaN(cleanOriginCep) && !isNaN(cleanDestCep)) {
        const diff = Math.abs(cleanOriginCep - cleanDestCep);
        // Em capitais, cada 1.000 no prefixo de CEP equivale a ~3 a 7 km urbanos
        const estimated = Math.max(5, Math.min(45, Math.round(diff * 0.015 + 8)));
        return estimated;
      }
    }
    return 12; // Média de deslocamento dentro do mesmo município
  }

  // Cidades diferentes: busca no banco de coordenadas
  const coordOrigin = CITY_COORDINATES[normOrigin];
  const coordDest = CITY_COORDINATES[normDest];

  if (coordOrigin && coordDest) {
    const straightLine = haversineDistance(
      coordOrigin.lat,
      coordOrigin.lng,
      coordDest.lat,
      coordDest.lng
    );
    // Coeficiente de sinuosidade rodoviária no Brasil é em média 1.25x a linha reta
    return Math.max(8, Math.round(straightLine * 1.25));
  }

  // Fallback baseado em CEPs interestaduais ou intermunicipais
  if (originCep && destCep) {
    const cleanOriginCep = parseInt(originCep.replace(/\D/g, '').slice(0, 5), 10);
    const cleanDestCep = parseInt(destCep.replace(/\D/g, '').slice(0, 5), 10);
    if (!isNaN(cleanOriginCep) && !isNaN(cleanDestCep)) {
      const diff = Math.abs(cleanOriginCep - cleanDestCep);
      const estimated = Math.max(15, Math.round(diff * 0.05 + 10));
      return Math.min(300, estimated);
    }
  }

  return 25; // Padrão se não conseguir calcular
}

/**
 * Calcula o custo total de deslocamento
 */
export function calculateTravelCost(
  distanceOneWayKm: number,
  kmRate: number,
  roundTrip: boolean = true
): {
  totalKm: number;
  totalCost: number;
} {
  const totalKm = roundTrip ? distanceOneWayKm * 2 : distanceOneWayKm;
  const totalCost = totalKm * (kmRate > 0 ? kmRate : 2.5);
  return {
    totalKm: Math.round(totalKm * 10) / 10,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}
