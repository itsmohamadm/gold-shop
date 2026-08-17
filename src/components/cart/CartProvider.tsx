'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

export type CartProduct = {
  id: number;
  name: string;
  weight: number;
  karat: number;
  price: number;
  stock: number;
  image?: string | null;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type SyncCartProduct = {
  id: number;
  stock: number;
  price: number;
  active: boolean;
};

type CartContextType = {
  items: CartItem[];
  hydrated: boolean;

  addToCart: (
    product: CartProduct
  ) => boolean;

  removeFromCart: (
    id: number
  ) => void;

  increaseQuantity: (
    id: number
  ) => boolean;

  decreaseQuantity: (
    id: number
  ) => void;

  clearCart: () => void;

  syncCartProducts: (
    products: SyncCartProduct[]
  ) => void;

  totalItems: number;
  totalPrice: number;
};

const CartContext =
  createContext<CartContextType | null>(
    null
  );

const STORAGE_KEY =
  'gold-shop-cart';

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [hydrated, setHydrated] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load cart
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed)
        ) {
          setItems(
            parsed.filter(
              (item) =>
                item &&
                Number(
                  item.quantity
                ) > 0
            )
          );
        }
      }
    } catch (error) {
      console.error(
        'CART LOAD ERROR:',
        error
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Save cart
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        'CART SAVE ERROR:',
        error
      );
    }
  }, [items, hydrated]);

  /*
  |--------------------------------------------------------------------------
  | Add
  |--------------------------------------------------------------------------
  */

  function addToCart(
    product: CartProduct
  ): boolean {
    if (product.stock <= 0) {
      alert(
        'این محصول موجود نیست'
      );

      return false;
    }

    const existing =
      items.find(
        (item) =>
          item.id === product.id
      );

    if (
      existing &&
      existing.quantity >=
        product.stock
    ) {
      return false;
    }

    setItems((current) => {
      const currentItem =
        current.find(
          (item) =>
            item.id === product.id
        );

      if (currentItem) {
        return current.map(
          (item) =>
            item.id ===
            product.id
              ? {
                  ...item,
                  ...product,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | Remove completely
  |--------------------------------------------------------------------------
  */

  function removeFromCart(
    id: number
  ) {
    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Increase
  |--------------------------------------------------------------------------
  */

  function increaseQuantity(
    id: number
  ): boolean {
    const item =
      items.find(
        (item) =>
          item.id === id
      );

    if (!item) {
      return false;
    }

    if (
      item.quantity >=
      item.stock
    ) {
      return false;
    }

    setItems((current) =>
      current.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
      )
    );

    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | Decrease
  |--------------------------------------------------------------------------
  */

  function decreaseQuantity(
    id: number
  ) {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Sync with server
  |--------------------------------------------------------------------------
  */

  function syncCartProducts(
    products: SyncCartProduct[]
  ) {
    setItems((current) =>
      current
        .map((item) => {
          const latest =
            products.find(
              (product) =>
                product.id ===
                item.id
            );

          // محصول از API پیدا نشده
          if (!latest) {
            return null;
          }

          // محصول غیرفعال شده
          if (!latest.active) {
            return null;
          }

          // تعداد موجود را با موجودی واقعی هماهنگ می‌کنیم
          const nextQuantity =
            Math.min(
              item.quantity,
              Math.max(
                latest.stock,
                0
              )
            );

          // دیگر موجودی ندارد
          if (
            nextQuantity <= 0
          ) {
            return null;
          }

          return {
            ...item,
            price: latest.price,
            stock: latest.stock,
            quantity:
              nextQuantity,
          };
        })
        .filter(
          (
            item
          ): item is CartItem =>
            item !== null
        )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Clear
  |--------------------------------------------------------------------------
  */

  function clearCart() {
    setItems([]);
  }

  /*
  |--------------------------------------------------------------------------
  | Totals
  |--------------------------------------------------------------------------
  */

  const totalItems =
    useMemo(
      () =>
        items.reduce(
          (sum, item) =>
            sum +
            item.quantity,
          0
        ),
      [items]
    );

  const totalPrice =
    useMemo(
      () =>
        items.reduce(
          (sum, item) =>
            sum +
            item.price *
              item.quantity,
          0
        ),
      [items]
    );

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated,

        addToCart,

        removeFromCart,

        increaseQuantity,

        decreaseQuantity,

        clearCart,

        syncCartProducts,

        totalItems,

        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| useCart
|--------------------------------------------------------------------------
*/

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider'
    );
  }

  return context;
}