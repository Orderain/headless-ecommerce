"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, UploadCloud, Smartphone, Clock, Tag } from "lucide-react";

export default function AddMobilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [image, setImage] = useState("");

  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    oldPrice: "", // New Field
    dealDuration: "1", // New Field (Default 1 day)
    stock: "",
    description: "",
    features: "",
    category: "deals",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const uploadData = await uploadRes.json();

      await fetch("/api/mobiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          oldPrice: form.category === "deals" ? Number(form.oldPrice) : null,
          dealDuration: form.category === "deals" ? `${form.dealDuration} Day(s)` : null,
          stock: Number(form.stock),
          features: form.features.split(",").map((f) => f.trim()),
          image: uploadData.url,
        }),
      });

      alert("Mobile Added Successfully! 🔥");
      router.refresh();
      // Reset form including new fields
      setForm({ name: "", brand: "", price: "", oldPrice: "", dealDuration: "1", stock: "", description: "", features: "", category: "deals" });
      setPreview("");
    } catch (err) {
      alert("Error adding mobile");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all";
  const labelStyle = "flex items-center gap-2 mb-1.5 text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#0f0a1f] p-6 text-white flex items-center gap-3">
          <Smartphone className="text-purple-400" />
          <h1 className="text-xl font-bold">Inventory Management</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Product Name</label>
              <input name="name" value={form.name} className={inputStyle} onChange={handleChange} placeholder="e.g. iPhone 15 Pro" required />
            </div>

            <div>
              <label className={labelStyle}>Display Category</label>
              <select name="category" value={form.category} className={inputStyle} onChange={handleChange}>
                <option value="deals">🔥 Flash Deals</option>
                <option value="most-selling">⭐ Most Selling</option>
                <option value="cheap">💰 Budget Friendly</option>
              </select>
            </div>
          </div>

          {/* --- CONDITIONAL FIELDS FOR DEALS --- */}
          {form.category === "deals" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className={labelStyle}><Tag size={16} className="text-orange-500" /> Original Price (Old)</label>
                <input 
                  name="oldPrice" 
                  type="text" 
                  value={form.oldPrice} 
                  className={inputStyle} 
                  onChange={handleChange} 
                  placeholder="Before discount"
                  required={form.category === "deals"}
                />
              </div>
              <div>
                <label className={labelStyle}><Clock size={16} className="text-orange-500" /> Deal Duration</label>
                <select name="dealDuration" value={form.dealDuration} className={inputStyle} onChange={handleChange}>
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="7">1 Week</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>Brand</label>
              <input name="brand" value={form.brand} className={inputStyle} onChange={handleChange} placeholder="Apple, Samsung..." />
            </div>
            <div>
              <label className={labelStyle}>Current Price ($)</label>
              <input name="price" type="text" value={form.price} className={inputStyle} onChange={handleChange} required />
            </div>
            <div>
              <label className={labelStyle}>Stock</label>
              <input name="stock" type="number" value={form.stock} className={inputStyle} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Features (Separated by commas)</label>
            <input name="features" value={form.features} className={inputStyle} onChange={handleChange} placeholder="OLED Display, 5G, 128GB" />
          </div>

          <div>
            <label className={labelStyle}>Image Upload</label>
            <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 opacity-0 cursor-pointer" />
              {preview ? (
                <img src={preview} className="h-40 w-40 object-contain rounded-lg" alt="Preview" />
              ) : (
                <div className="text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Click to upload product image</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
            }`}
          >
            {loading ? "Processing..." : "Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
}