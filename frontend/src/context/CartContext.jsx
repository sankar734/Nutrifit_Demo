import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'nutrichef_guest_cart';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const syncedRef = useRef(false);

  // Helper to persist only guest cart in localStorage
  const saveGuestCart = (newCart) => {
    setCart(newCart);
    try {
      if (!user) {
        if (!newCart?.items?.length) {
          localStorage.removeItem(GUEST_CART_KEY);
        } else {
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
        }
      }
    } catch (_) {}
  };

  const refresh = useCallback(async () => {
    if (!user) {
      try {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        setCart(saved ? JSON.parse(saved) : { items: [] });
      } catch {
        setCart({ items: [] });
      }
      return;
    }

    setLoading(true);
    try {
      // Sync guest cart items to backend exactly ONCE upon login, then remove guest cart immediately
      if (!syncedRef.current) {
        try {
          const guestRaw = localStorage.getItem(GUEST_CART_KEY);
          if (guestRaw) {
            const guestCart = JSON.parse(guestRaw);
            if (guestCart?.items?.length) {
              for (const item of guestCart.items) {
                const fId = item.food?._id || item.food?.id || item.food;
                if (fId) {
                  await cartApi.add(fId, item.quantity || 1, item.food).catch(() => {});
                }
              }
            }
            // CRUCIAL: Delete guest cart once synced so it never syncs or accumulates again!
            localStorage.removeItem(GUEST_CART_KEY);
          }
        } catch (_) {}
        syncedRef.current = true;
      }

      const { data } = await cartApi.get();
      if (data?.data?.cart) {
        setCart(data.data.cart);
      } else {
        setCart({ items: [] });
      }
    } catch {
      // If network fails for logged-in user, keep empty or current state rather than corrupting
      setCart((prev) => prev || { items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      syncedRef.current = false;
      setCart({ items: [] });
      try {
        localStorage.removeItem(GUEST_CART_KEY);
      } catch (_) {}
    }
  }, [user, refresh]);

  // Check current quantity of any food item in cart
  const getItemQuantity = useCallback((foodId, foodObj = null) => {
    if (!cart?.items?.length) return 0;
    const targetId = String(foodId || foodObj?._id || foodObj?.id || '');
    const targetName = (foodObj?.name || '').toLowerCase().trim();

    const matched = cart.items.find((i) => {
      if (!i?.food) return false;
      const fId = String(i.food._id || i.food.id || i.food);
      if (targetId && fId === targetId) return true;
      if (targetName && i.food.name && i.food.name.toLowerCase().trim() === targetName) return true;
      return false;
    });

    return matched ? matched.quantity || 0 : 0;
  }, [cart]);

  const addToCart = async (foodId, quantity = 1, foodObj = null) => {
    const foodData = foodObj || { _id: foodId, name: 'Healthy Dish', price: 169 };

    if (user) {
      try {
        const { data } = await cartApi.add(foodId, quantity, foodData);
        if (data?.data?.cart) {
          setCart(data.data.cart);
          return { success: true, cart: data.data.cart };
        }
      } catch (err) {
        console.warn('Backend cart add failed, falling back to local cart persistence', err);
      }
    }

    // Local / fallback cart storage
    const items = [...(cart.items || [])];
    const existingIndex = items.findIndex((i) => {
      const fId = i.food?._id || i.food?.id || i.food;
      return fId === foodId || (foodObj && i.food?.name === foodObj.name);
    });

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ food: foodData, quantity });
    }

    const newCart = { ...cart, items };
    saveGuestCart(newCart);
    return { success: true, cart: newCart };
  };

  const updateItem = async (foodId, quantity, foodObj = null) => {
    const newQty = parseInt(quantity);

    if (user) {
      try {
        const { data } = await cartApi.update(foodId, newQty);
        if (data?.data?.cart) {
          setCart(data.data.cart);
          return { success: true, cart: data.data.cart };
        }
      } catch (err) {
        console.warn('Backend cart update failed, using local update', err);
      }
    }

    // Local cart update
    let items = [...(cart.items || [])];
    const targetId = String(foodId || foodObj?._id || '');
    const targetName = (foodObj?.name || '').toLowerCase().trim();

    if (newQty <= 0) {
      items = items.filter((i) => {
        const fId = String(i.food?._id || i.food?.id || i.food);
        if (targetId && fId === targetId) return false;
        if (targetName && i.food?.name?.toLowerCase().trim() === targetName) return false;
        return true;
      });
    } else {
      const item = items.find((i) => {
        const fId = String(i.food?._id || i.food?.id || i.food);
        if (targetId && fId === targetId) return true;
        if (targetName && i.food?.name?.toLowerCase().trim() === targetName) return true;
        return false;
      });
      if (item) {
        item.quantity = newQty;
      } else if (foodObj) {
        items.push({ food: foodObj, quantity: newQty });
      }
    }

    const newCart = { ...cart, items };
    saveGuestCart(newCart);
    return { success: true, cart: newCart };
  };

  const removeFromCart = async (foodId, foodObj = null) => {
    return updateItem(foodId, 0, foodObj);
  };

  const clearCart = async () => {
    if (user) {
      try {
        await cartApi.clear();
      } catch (_) {}
    }
    try {
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (_) {}
    const emptyCart = { items: [] };
    setCart(emptyCart);
    return { success: true };
  };

  const totalUnits = cart.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;
  const itemCount = totalUnits;
  const totalItems = totalUnits;
  const subtotal =
    cart.items?.reduce(
      (sum, i) => sum + (i.food?.discountPrice || i.food?.price || 0) * (i.quantity || 1),
      0
    ) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateItem,
        removeFromCart,
        clearCart,
        refresh,
        getItemQuantity,
        itemCount,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
