/**
 * Location utilities for fetching countries, states, and cities for shipping
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BE_URL;

/**
 * Fetch available shipping countries for a shop
 * @param {string} shopId - Shop ID
 * @returns {Promise<Array>} List of countries
 */
export const fetchShippingCountries = async (shopId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/get-shop-shipping-zone-countries/${shopId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }

    const data = await response.json();
    return data.status === "success" ? data.data : [];
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

/**
 * Fetch available shipping states for a country
 * @param {string} shopId - Shop ID
 * @param {number} countryId - Country ID
 * @returns {Promise<Array>} List of states
 */
export const fetchShippingStates = async (shopId, countryId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/get-shop-shipping-zone-states/${shopId}/${countryId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch states");
    }

    const data = await response.json();
    return data.status === "success" ? data.data : [];
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
};

/**
 * Fetch cities for a specific state
 * @param {string} shopId - Shop ID
 * @param {number} countryId - Country ID
 * @param {number} stateId - State ID
 * @returns {Promise<Array>} List of cities
 */
export const fetchShippingCities = async (shopId, countryId, stateId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/get-shop-shipping-zone-cities/${shopId}/${countryId}/${stateId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch cities");
    }

    const data = await response.json();
    return data.status === "success" ? data.data : [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

/**
 * Calculate shipping rate for order
 * @param {string} shopId - Shop ID
 * @param {Object} params - Shipping calculation parameters
 * @returns {Promise<Object>} Shipping rate details
 */
export const calculateShippingRate = async (shopId, params) => {
  try {
    const { countryId, stateId, cityId, subTotal, cartItemWeight } = params;

    const queryParams = new URLSearchParams({
      country_id: countryId,
      sub_total: subTotal,
      cart_item_weight: cartItemWeight,
    });

    if (stateId) queryParams.append("state_id", stateId);
    if (cityId) queryParams.append("city_id", cityId);

    const response = await fetch(
      `${API_BASE_URL}/get-order-shipping-rate/${shopId}?${queryParams}`,
    );

    if (!response.ok) {
      throw new Error("Failed to calculate shipping rate");
    }

    const data = await response.json();
    return data.status === "success" ? data : null;
  } catch (error) {
    console.error("Error calculating shipping rate:", error);
    return null;
  }
};
