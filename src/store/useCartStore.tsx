import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface UserInfo {
  phoneCode: string;
  phone: string;
  fullName: string;
  email: string;
  birthDate: string;
}

interface CartState {
  items: Record<string, CartItem>;
  userInfo: UserInfo | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addItem: (id: string, name: number | any, price: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number, name?: string, price?: number) => void;
  setUserInfo: (info: UserInfo) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      userInfo: null,

      addItem: (id, name, price) => set((state) => {
        const current = state.items[id];
        return {
          items: {
            ...state.items,
            [id]: { id, name, price, quantity: (current?.quantity || 0) + 1 }
          }
        };
      }),

      removeItem: (id) => set((state) => {
        const newItems = { ...state.items };
        delete newItems[id];
        return { items: newItems };
      }),

      updateQuantity: (id, quantity, name, price) => set((state) => {
        if (quantity <= 0) {
          const newItems = { ...state.items };
          delete newItems[id];
          return { items: newItems };
        }
        return {
          items: {
            ...state.items,
            [id]: {
              id,
              name: name || state.items[id]?.name || "Bilhete",
              price: price !== undefined ? price : (state.items[id]?.price || 0),
              quantity
            }
          }
        };
      }),

      setUserInfo: (userInfo) => set({ userInfo }),
      clearCart: () => set({ items: {}, userInfo: null }),

      getTotalPrice: () => {
        return Object.values(get().items).reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        return Object.values(get().items).reduce((acc, item) => acc + item.quantity, 0);
      }
    }),
    { name: "traiados-cart-storage" }
  )
);