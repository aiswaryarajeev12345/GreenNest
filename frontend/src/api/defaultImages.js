const base = (id, width = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

// Real, verified Unsplash photos (free license) — each one checked against
// its actual subject so the picture always matches the label using it.
//   hero        -> wide shot of a full home/community garden
//   garden      -> person tending a vegetable garden bed
//   community   -> several people planting together (matches the
//                  Community / "green planting" pages)
//   seedlings   -> gloved hands planting a seedling in soil
//   herbs       -> hands harvesting leafy greens from the garden
//   harvest     -> basket of fresh-picked vegetables
//   tools       -> gardener holding a garden fork
//   people      -> a young gardener holding a plant (used on Classes)
//   seeds       -> hands planting seeds/seedlings in garden soil
export const DEFAULT_IMAGES = {
  hero: base('photo-1641056709258-fbe799d88cdc', 1800),
  garden: base('photo-1601001815894-4bb6c81416d7'),
  community: base('photo-1524247108137-732e0f642303'),
  harvest: base('photo-1484848560771-c55afee65e0f'),
  people: base('photo-1581578017306-7334b15283df'),
  tomatoes: base('photo-1484848560771-c55afee65e0f'),
  seedlings: base('photo-1622383563227-04401ab4e5ea'),
  herbs: base('photo-1621460249485-4e4f92c9de5d'),
  tools: base('photo-1555955208-94f6fafea771'),
  seeds: base('photo-1611843467160-25afb8df1074'),
};

export function productImage(category) {
  const key = String(category || '').toLowerCase();
  if (key.includes('vegetable')) return DEFAULT_IMAGES.tomatoes;
  if (key.includes('fruit')) return DEFAULT_IMAGES.harvest;
  if (key.includes('herb')) return DEFAULT_IMAGES.herbs;
  if (key.includes('seed')) return DEFAULT_IMAGES.seeds;
  if (key.includes('plant')) return DEFAULT_IMAGES.seedlings;
  if (key.includes('tool') || key.includes('material') || key.includes('pot')) return DEFAULT_IMAGES.tools;
  if (key.includes('kit')) return DEFAULT_IMAGES.garden;
  return DEFAULT_IMAGES.garden;
}
