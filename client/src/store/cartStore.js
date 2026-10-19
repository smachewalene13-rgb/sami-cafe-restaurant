import { create } from 'zustand';

const TAX_RATE = 0.15; // 15% VAT
const DEFAULT_DELIVERY_FEE = 120;

export const useCartStore = create((set, get) => {
  const savedCart = localStorage.getItem('sami_cafe_cart');
  const initial = savedCart
    ? JSON.parse(savedCart)
    : {
        items: [],
        orderType: 'dine_in', // 'dine_in', 'takeaway', 'delivery'
        tableId: null,
        tableNumber: '',
        deliveryAddress: '',
        notes: '',
        promoCode: null,
        discountAmount: 0,
        isDrawerOpen: false,
      };

  const persist = (state) => {
    const toSave = {
      items: state.items,
      orderType: state.orderType,
      tableId: state.tableId,
      tableNumber: state.tableNumber,
      deliveryAddress: state.deliveryAddress,
      notes: state.notes,
      promoCode: state.promoCode,
      discountAmount: state.discountAmount,
    };
    localStorage.setItem('sami_cafe_cart', JSON.stringify(toSave));
  };

  return {
    ...initial,
    isDrawerOpen: false,

    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),

    addItem: (item, quantity = 1, note = '') => {
      const { items } = get();
      const existingIndex = items.findIndex((i) => i.id === item.id && (i.note || '') === (note || ''));

      let newItems;
      if (existingIndex > -1) {
        newItems = [...items];
        newItems[existingIndex].quantity += quantity;
      } else {
        newItems = [...items, { ...item, quantity, note }];
      }

      const next = { ...get(), items: newItems };
      persist(next);
      set({ items: newItems, isDrawerOpen: true });
    },

    updateQuantity: (index, delta) => {
      const { items } = get();
      const nextItems = [...items];
      nextItems[index].quantity += delta;

      if (nextItems[index].quantity <= 0) {
        nextItems.splice(index, 1);
      }

      const next = { ...get(), items: nextItems };
      persist(next);
      set({ items: nextItems });
    },

    removeItem: (index) => {
      const { items } = get();
      const nextItems = items.filter((_, idx) => idx !== index);
      const next = { ...get(), items: nextItems };
      persist(next);
      set({ items: nextItems });
    },

    setOrderType: (orderType) => {
      const next = { ...get(), orderType };
      persist(next);
      set({ orderType });
    },

    setTable: (tableId, tableNumber) => {
      const next = { ...get(), tableId, tableNumber };
      persist(next);
      set({ tableId, tableNumber });
    },

    setDeliveryAddress: (deliveryAddress) => {
      const next = { ...get(), deliveryAddress };
      persist(next);
      set({ deliveryAddress });
    },

    setNotes: (notes) => {
      const next = { ...get(), notes };
      persist(next);
      set({ notes });
    },

    applyPromo: (code, discountAmount) => {
      const next = { ...get(), promoCode: code, discountAmount };
      persist(next);
      set({ promoCode: code, discountAmount });
    },

    removePromo: () => {
      const next = { ...get(), promoCode: null, discountAmount: 0 };
      persist(next);
      set({ promoCode: null, discountAmount: 0 });
    },

    clearCart: () => {
      const next = {
        items: [],
        orderType: 'dine_in',
        tableId: null,
        tableNumber: '',
        deliveryAddress: '',
        notes: '',
        promoCode: null,
        discountAmount: 0,
      };
      persist(next);
      set(next);
    },

    // Totals calculations
    getSubtotal: () => {
      const { items } = get();
      return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    getDeliveryFee: () => {
      const { orderType } = get();
      return orderType === 'delivery' ? DEFAULT_DELIVERY_FEE : 0;
    },

    getTax: () => {
      const subtotal = get().getSubtotal();
      const discount = get().discountAmount || 0;
      const taxable = Math.max(0, subtotal - discount);
      return Number((taxable * TAX_RATE).toFixed(2));
    },

    getTotal: () => {
      const subtotal = get().getSubtotal();
      const deliveryFee = get().getDeliveryFee();
      const discount = get().discountAmount || 0;
      const tax = get().getTax();
      return Number((Math.max(0, subtotal - discount) + tax + deliveryFee).toFixed(2));
    },

    getTotalItemCount: () => {
      const { items } = get();
      return items.reduce((sum, i) => sum + i.quantity, 0);
    },
  };
});
