export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  preparing: { label: 'Preparing in Kitchen', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  ready: { label: 'Ready for Pickup / Serving', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-300' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-300' }
};

export const TABLE_STATUSES = {
  free: { label: 'Available', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  occupied: { label: 'Occupied', color: 'bg-rose-50 text-rose-700 border-rose-300' },
  reserved: { label: 'Reserved', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  cleaning: { label: 'Cleaning', color: 'bg-slate-50 text-slate-700 border-slate-300' }
};

export const USER_ROLES = ['admin', 'manager', 'waiter', 'kitchen', 'cashier', 'customer'];
