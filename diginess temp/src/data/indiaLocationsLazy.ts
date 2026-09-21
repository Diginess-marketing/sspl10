// Lazy loading wrapper for India locations data
// This file provides async functions to load location data on demand

export const loadIndiaLocations = async () => {
  const module = await import('./indiaLocations');
  return module;
};

export const getAllStatesAsync = async (): Promise<string[]> => {
  const { getAllStates } = await loadIndiaLocations();
  return getAllStates();
};

export const getCitiesAndDistrictsForStateAsync = async (stateName: string): Promise<string[]> => {
  const { getCitiesAndDistrictsForState } = await loadIndiaLocations();
  return getCitiesAndDistrictsForState(stateName);
};
