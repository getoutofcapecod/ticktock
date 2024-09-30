const LIFE_EXPECTANCY_DATA = {
  USA: { male: 76.1, female: 81.1 },
  GBR: { male: 79.4, female: 83.1 },
  CAN: { male: 79.9, female: 84.1 },
  AUS: { male: 80.9, female: 85.0 },
  JPN: { male: 81.6, female: 87.5 },
};

export async function fetchLifeExpectancy(country, gender) {
  if (!country || !gender) {
    throw new Error('Country and gender must be provided');
  }
  return LIFE_EXPECTANCY_DATA[country][gender];
}