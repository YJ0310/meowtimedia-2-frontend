// Simple fun facts data for loading screens
// Migrated from backend to avoid API calls during loading

export const SIMPLE_FUNFACTS: Record<string, string[]> = {
  'japan': [
    'The news reports a daily forecast for cherry blossom season, just like the weather.',
    'The bottom box of New Year food is left empty to welcome good luck.',
    'Japan has millions of vending machines selling everything from hot coffee to fresh soup.',
    'Sleeping at work is socially accepted and shows that you are working very hard.',
  ],
  'indonesia': [
    'Authentic dry Rendang meat can last for three weeks without going bad.',
    "On Bali's Day of Silence, the entire island closes down, including the airport.",
    'Indonesia is the only place where you can see wild Komodo Dragons.',
    "Indonesia is home to the world's largest flower, which smells like rotting meat.",
  ],
  'malaysia': [
    'During Chinese New Year, tossing the salad higher brings you more luck and money.',
    'People love Nasi Lemak so much that a Miss Universe dress was designed like it.',
    "The world's largest cave chamber is here and could fit 40 large airplanes inside.",
    'This rainforest is 130 million years old, making it older than the Amazon jungle.',
  ],
  'south-korea': [
    'Kimchi is so important that the government sometimes flies in cabbage to control prices.',
    'People drink cold wine on the first full moon to hear good news all year.',
    'South Korea has the highest rate of cosmetic surgery per person in the world.',
    'About half of the entire population shares just three family names: Kim, Lee, and Park.',
  ],
  'thailand': [
    'Locals set up huge tables of food to feed thousands of monkeys at a festival.',
    'The Prime Minister created Pad Thai in the 1930s to help build a national identity.',
    'Bangkok holds the world record for having the longest official place name.',
    'Thailand is the only Southeast Asian country that was never colonized by European powers.',
  ],
};

// Get all fun facts as a flat array
export function getAllFunFacts(): string[] {
  return Object.values(SIMPLE_FUNFACTS).flat();
}

// Get fun facts for a specific country
export function getFunFactsForCountry(countrySlug: string): string[] {
  return SIMPLE_FUNFACTS[countrySlug] || [];
}

// Get a random fun fact
export function getRandomFunFact(countrySlug?: string): string {
  const allFacts = getAllFunFacts();
  
  if (countrySlug && SIMPLE_FUNFACTS[countrySlug]) {
    const countryFacts = SIMPLE_FUNFACTS[countrySlug];
    return countryFacts[Math.floor(Math.random() * countryFacts.length)];
  }
  
  return allFacts[Math.floor(Math.random() * allFacts.length)];
}
