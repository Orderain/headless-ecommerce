/**
 * Cart utilities for managing cart items in localStorage
 * Handles products with and without variants
 */

const CART_STORAGE_KEY = "shopping_cart";

/**
 * Get all cart items from localStorage
 * @returns {Array} Array of cart items
 */
export const getCartItems = () => {
  if (typeof window === "undefined") return [];

  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error("Error reading cart from localStorage:", error);
    return [];
  }
};

/**
 * Save cart items to localStorage
 * @param {Array} items - Array of cart items
 */
export const saveCartItems = (items) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    // Dispatch custom event to notify components about cart changes
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

/**
 * Add item to cart with product details
 * @param {string} productId - Product ID
 * @param {string|null} variantId - Variant ID (null for simple products)
 * @param {number} quantity - Quantity to add (default: 1)
 * @param {Object} productDetails - Product details for display (name, image, price, etc.)
 * @returns {Object} Updated cart items
 */
export const addToCart = (productId, variantId = null, quantity = 1, productDetails = {}) => {
  const cartItems = getCartItems();

  // Find existing item
  const existingItemIndex = cartItems.findIndex(
    (item) =>
      item.product_id === productId &&
      item.variant_id === variantId
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    cartItems[existingItemIndex].unit_qty += quantity;
  } else {
    // Add new item with details
    cartItems.push({
      product_id: productId,
      variant_id: variantId,
      unit_qty: quantity,
      // Store product details for display
      details: {
        name: productDetails.name || "",
        image: productDetails.image || "",
        price: productDetails.price || "0.00",
        slug: productDetails.slug || "",
        variantName: productDetails.variantName || null,
      }
    });
  }

  saveCartItems(cartItems);
  return cartItems;
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 * @param {string|null} variantId - Variant ID
 * @returns {Object} Updated cart items
 */
export const removeFromCart = (productId, variantId = null) => {
  const cartItems = getCartItems();
  const updatedItems = cartItems.filter(
    (item) =>
      !(item.product_id === productId && item.variant_id === variantId)
  );

  saveCartItems(updatedItems);
  return updatedItems;
};

/**
 * Update item quantity in cart
 * @param {string} productId - Product ID
 * @param {string|null} variantId - Variant ID
 * @param {number} quantity - New quantity
 * @returns {Object} Updated cart items
 */
export const updateCartItemQuantity = (productId, variantId = null, quantity) => {
  const cartItems = getCartItems();

  const itemIndex = cartItems.findIndex(
    (item) =>
      item.product_id === productId &&
      item.variant_id === variantId
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cartItems.splice(itemIndex, 1);
    } else {
      cartItems[itemIndex].unit_qty = quantity;
    }
  }

  saveCartItems(cartItems);
  return cartItems;
};

/**
 * Get total number of items in cart
 * @returns {number} Total quantity of all items
 */
export const getCartItemCount = () => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + item.unit_qty, 0);
};

/**
 * Clear all items from cart
 */
export const clearCart = () => {
  saveCartItems([]);
};

/**
 * Check if a product is in cart
 * @param {string} productId - Product ID
 * @param {string|null} variantId - Variant ID
 * @returns {boolean} True if item is in cart
 */
export const isInCart = (productId, variantId = null) => {
  const cartItems = getCartItems();
  return cartItems.some(
    (item) =>
      item.product_id === productId &&
      item.variant_id === variantId
  );
};

/**
 * Get cart item quantity
 * @param {string} productId - Product ID
 * @param {string|null} variantId - Variant ID
 * @returns {number} Quantity of the item in cart
 */
export const getCartItemQuantity = (productId, variantId = null) => {
  const cartItems = getCartItems();
  const item = cartItems.find(
    (item) =>
      item.product_id === productId &&
      item.variant_id === variantId
  );
  return item ? item.unit_qty : 0;
};

/**
 * Format cart items for API request (without details)
 * @returns {Object} Formatted cart object for API
 */
export const getFormattedCartForAPI = () => {
  const cartItems = getCartItems();
  return {
    items: cartItems.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      unit_qty: item.unit_qty,
    })),
  };
};
