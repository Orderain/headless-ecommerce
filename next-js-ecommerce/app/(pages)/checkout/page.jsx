"use client";
import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
  User,
  Mail,
  Phone,
  Home,
} from "lucide-react";
import {
  getCartItems,
  getFormattedCartForAPI,
  clearCart,
} from "@/lib/cartUtils";
import {
  fetchShippingCountries,
  fetchShippingStates,
  fetchShippingCities,
  calculateShippingRate,
} from "@/lib/locationUtils";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function CheckoutPage() {
  const router = useRouter();
  const shopId = process.env.NEXT_PUBLIC_SHOP_ID;

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country_id: "",
    state_id: "",
    city_id: "",
    address: "",
    postal_code: "",
    comment: "",
  });

  // Location data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Shipping state
  const [shippingRate, setShippingRate] = useState(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [fetchingCartData, setFetchingCartData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Load initial data
  useEffect(() => {
    const initializeCheckout = async () => {
      // Check if cart has items
      const items = getCartItems();
      if (items.length === 0) {
        router.push("/cart");
        return;
      }

      setCartItems(items);

      // Fetch cart summary and countries in parallel
      await Promise.all([fetchCartSummary(), loadCountries()]);

      setLoading(false);
    };

    initializeCheckout();
  }, []);

  // Fetch cart summary
  const fetchCartSummary = async () => {
    setFetchingCartData(true);
    setError(null);

    try {
      const cartData = getFormattedCartForAPI();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BE_URL}/guest-user-show-cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cartData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cart summary");
      }

      const data = await response.json();

      if (data.status === "success" && data.data) {
        setCartSummary(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch cart summary");
      }
    } catch (err) {
      console.error("Error fetching cart summary:", err);
      setError(err.message);
    } finally {
      setFetchingCartData(false);
    }
  };

  // Load countries
  const loadCountries = async () => {
    const countriesData = await fetchShippingCountries(shopId);
    setCountries(countriesData);
  };

  // Load states when country changes
  useEffect(() => {
    if (formData.country_id) {
      loadStates(formData.country_id);
      // Reset state and city when country changes
      setFormData((prev) => ({ ...prev, state_id: "", city_id: "" }));
      setStates([]);
      setCities([]);
      setShippingRate(null);
    }
  }, [formData.country_id]);

  const loadStates = async (countryId) => {
    const statesData = await fetchShippingStates(shopId, countryId);
    setStates(statesData);
  };

  // Load cities when state changes
  useEffect(() => {
    if (formData.state_id && formData.country_id) {
      loadCities(formData.country_id, formData.state_id);
      // Reset city when state changes
      setFormData((prev) => ({ ...prev, city_id: "" }));
      setCities([]);
      setShippingRate(null);
    }
  }, [formData.state_id, formData.country_id]);

  const loadCities = async (countryId, stateId) => {
    const citiesData = await fetchShippingCities(shopId, countryId, stateId);
    setCities(citiesData);
  };

  // Calculate shipping when location is complete
  useEffect(() => {
    if (
      formData.country_id &&
      formData.state_id &&
      formData.city_id &&
      cartSummary
    ) {
      calculateShipping();
    }
  }, [formData.country_id, formData.state_id, formData.city_id, cartSummary]);

  const calculateShipping = async () => {
    setCalculatingShipping(true);

    const shippingData = await calculateShippingRate(shopId, {
      countryId: formData.country_id,
      stateId: formData.state_id,
      cityId: formData.city_id,
      subTotal: cartSummary.sub_total,
      cartItemWeight: cartSummary.cart_item_weight,
    });

    if (shippingData) {
      setShippingRate(shippingData);
    }

    setCalculatingShipping(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate final total
  const calculateFinalTotal = () => {
    if (!cartSummary) return 0;

    let total = cartSummary.total || 0;

    if (shippingRate?.data?.shipping_charges) {
      total += parseFloat(shippingRate.data.shipping_charges);
    }

    return total;
  };

  // Handle order submission
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (
        !formData.first_name ||
        !formData.last_name ||
        !formData.email ||
        !formData.phone ||
        !formData.country_id ||
        !formData.state_id ||
        !formData.city_id ||
        !formData.address ||
        !formData.postal_code
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare order data
      const orderData = {
        items: getFormattedCartForAPI().items,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        type: "guest",
        country_id: parseInt(formData.country_id),
        state_id: parseInt(formData.state_id),
        city_id: parseInt(formData.city_id),
        address: formData.address,
        postal_code: formData.postal_code,
        address_id: null,
        payment_method: "COD",
        tenant: shopId,
        comment: formData.comment || "",
      };

      // Submit order
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BE_URL}/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();

      if (data.status === "success") {
        // Fetch complete order details
        await fetchCompleteOrderDetails(data.data.order_id);
        // Clear cart
        clearCart();
      } else {
        throw new Error(data.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  // Fetch complete order details after creation
  const fetchCompleteOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BE_URL}/get-order/${shopId}/${orderId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();

      if (data.status === "success" && data.data) {
        setOrderDetails(data.data);
        setOrderSuccess(true);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      // Still show success but with basic info
      setOrderSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (orderSuccess && orderDetails) {
    return (
      <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          {/* Success Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you {orderDetails.customer?.full_name}! Your order has been
              received.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Order Number</p>
              <p className="text-2xl font-bold text-purple-600">
                #{orderDetails.order_id}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 mb-1">Total Paid</p>
                <p className="font-bold text-gray-800">
                  {orderDetails.currency_icon}
                  {parseFloat(orderDetails.paid_amount).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 mb-1">Payment</p>
                <p className="font-bold text-gray-800">
                  {orderDetails.payment_method}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 mb-1">Status</p>
                <p className="font-bold text-orange-600 capitalize">
                  {orderDetails.status}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 mb-1">Items</p>
                <p className="font-bold text-gray-800">
                  {orderDetails.order_items?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Price Breakdown
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal (Items)</span>
                <span className="font-semibold">
                  {orderDetails.currency_icon}
                  {parseFloat(orderDetails.total_amount).toFixed(2)}
                </span>
              </div>

              {parseFloat(orderDetails.delivery_charges) > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charges</span>
                  <span className="font-semibold">
                    {orderDetails.currency_icon}
                    {parseFloat(orderDetails.delivery_charges).toFixed(2)}
                  </span>
                </div>
              )}

              {orderDetails.extra_charges_breakdown &&
                orderDetails.extra_charges_breakdown.length > 0 && (
                  <>
                    {orderDetails.extra_charges_breakdown.map((charge, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-gray-700"
                      >
                        <span>{charge.name}</span>
                        <span className="font-semibold">
                          {orderDetails.currency_icon}
                          {parseFloat(charge.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </>
                )}

              {parseFloat(orderDetails.total_tax_amount) > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="font-semibold">
                    {orderDetails.currency_icon}
                    {parseFloat(orderDetails.total_tax_amount).toFixed(2)}
                  </span>
                </div>
              )}

              {parseFloat(orderDetails.total_discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -{orderDetails.currency_icon}
                    {parseFloat(orderDetails.total_discount_amount).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t-2 border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    Total Amount to Pay
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {orderDetails.currency_icon}
                    {parseFloat(orderDetails.paid_amount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-blue-800">
                    Payment Method:
                  </span>
                  <span className="font-bold text-blue-900">
                    {orderDetails.payment_method}
                  </span>
                </div>
              </div>

              {orderDetails.shipping_duration && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Delivery:</strong> {orderDetails.shipping_duration}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          {orderDetails.order_items && orderDetails.order_items.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {orderDetails.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="shrink-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.product?.images?.[0] || "/placeholder.png"}
                          alt={item.product?.name || "Product"}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {item.product?.name}
                      </h3>
                      {item.product?.variant?.name && (
                        <p className="text-xs text-gray-500 mb-1">
                          Variant: {item.product.variant.name}
                        </p>
                      )}
                      {item.product?.tags && item.product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.product.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          Qty: <strong>{item.unit_qty}</strong>
                        </span>
                        <span>
                          Unit Price:{" "}
                          <strong>
                            {orderDetails.currency_icon}
                            {parseFloat(item.unit_price).toFixed(2)}
                          </strong>
                        </span>
                        <span className="text-purple-600 font-semibold">
                          Total: {orderDetails.currency_icon}
                          {(
                            parseFloat(item.unit_price) * item.unit_qty
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {orderDetails.address && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-purple-600" />
                Shipping Address
              </h2>
              <div className="text-gray-700 space-y-1">
                <p className="font-semibold">
                  {orderDetails.customer?.full_name}
                </p>
                <p>{orderDetails.address.address}</p>
                <p>
                  {orderDetails.address.city?.name},{" "}
                  {orderDetails.address.state?.name}
                </p>
                <p>
                  {orderDetails.address.country?.name} -{" "}
                  {orderDetails.address.postal_code}
                </p>
                <p className="text-sm">Phone: {orderDetails.address.phone}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-center"
            >
              Back to Home
            </Link>
            <Link
              href="/all-mobiles"
              className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {/* Header */}
      <div className="bg-linear-to-r from-[#2C0741] via-[#4B2050] to-[#6348A6] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-sm font-medium text-purple-200 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={18} /> Back to Cart
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Checkout
          </h1>
          <p className="text-purple-200 text-sm sm:text-base">
            Complete your order
          </p>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Forms */}
            <div className="flex-1 space-y-6">
              {/* Order Items Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Order Items ({cartItems.length})
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.product_id}-${item.variant_id || "simple"}`}
                      className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                    >
                      <div className="shrink-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.details?.image || "/placeholder.png"}
                            alt={item.details?.name || "Product"}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                          {item.details?.name || "Product"}
                        </h3>
                        {item.details?.variantName && (
                          <p className="text-xs text-gray-500 mt-1">
                            Variant: {item.details.variantName}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            Qty: <strong>{item.unit_qty}</strong>
                          </span>
                          <span className="text-purple-600 font-semibold">
                            Rs {parseFloat(item.details?.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <User size={24} className="text-purple-600" />
                  Customer Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="03001234567"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <MapPin size={24} className="text-purple-600" />
                  Shipping Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country_id"
                      value={formData.country_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State / Province *
                    </label>
                    <select
                      name="state_id"
                      value={formData.state_id}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.country_id || states.length === 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <select
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.state_id || cities.length === 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Home size={16} className="inline mr-1" />
                      Street Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="House number, street name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Any special instructions for delivery"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-96">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>

                {fetchingCartData ? (
                  <div className="text-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Calculating totals...
                    </p>
                  </div>
                ) : cartSummary ? (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-semibold">
                          {cartSummary.currency_icon}
                          {cartSummary.sub_total?.toFixed(2)}
                        </span>
                      </div>

                      {cartSummary.totalDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-semibold">
                            -{cartSummary.currency_icon}
                            {cartSummary.totalDiscount?.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span className="font-semibold">
                          {cartSummary.currency_icon}
                          {cartSummary.tax_amount?.toFixed(2)}
                        </span>
                      </div>

                      {cartSummary.extra_charges &&
                        cartSummary.extra_charges.length > 0 && (
                          <div className="border-t border-gray-200 pt-3">
                            {cartSummary.extra_charges.map((charge, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm text-gray-600 mb-1"
                              >
                                <span>{charge.name}</span>
                                <span>
                                  {cartSummary.currency_icon}
                                  {charge.amount?.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        {calculatingShipping ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : shippingRate?.data?.shipping_charges ? (
                          <span className="font-semibold">
                            {cartSummary.currency_icon}
                            {parseFloat(
                              shippingRate.data.shipping_charges,
                            ).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Enter address
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between text-xl font-bold text-gray-800">
                        <span>Total</span>
                        <span className="text-purple-600">
                          {cartSummary.currency_icon}
                          {calculateFinalTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        Payment Method
                      </p>
                      <p className="text-sm text-blue-700">
                        Cash on Delivery (COD)
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        fetchingCartData ||
                        calculatingShipping ||
                        !cartSummary
                      }
                      className="w-full py-3 bg-linear-to-r from-[#2C0741] to-[#6348A6] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Placing Order...
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Unable to load order summary
                  </div>
                )}

                <Link
                  href="/cart"
                  className="block text-center mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
