export const DEFAULT_TABLES = [
  { id: 1, tableNumber: 'T-01', capacity: 2, location: 'Coffee Bar Corner', status: 'free' },
  { id: 2, tableNumber: 'T-02', capacity: 2, location: 'Window View', status: 'free' },
  { id: 3, tableNumber: 'T-03', capacity: 4, location: 'Main Dining Hall', status: 'free' },
  { id: 4, tableNumber: 'T-04', capacity: 4, location: 'Main Dining Hall', status: 'free' },
  { id: 5, tableNumber: 'T-05', capacity: 6, location: 'Garden Terrace', status: 'free' },
  { id: 6, tableNumber: 'T-06', capacity: 6, location: 'Garden Terrace', status: 'free' },
  { id: 7, tableNumber: 'T-07', capacity: 8, location: 'VIP Cultural Lounge', status: 'free' },
  { id: 8, tableNumber: 'T-08', capacity: 4, location: 'Main Dining Hall', status: 'free' },
];

export const getMatchingTables = (partySize = 2) => {
  const size = parseInt(partySize, 10) || 2;
  const minCap = size > 8 ? 6 : size;
  const matching = DEFAULT_TABLES.filter((t) => t.capacity >= minCap);
  return matching.length > 0 ? matching : DEFAULT_TABLES;
};
