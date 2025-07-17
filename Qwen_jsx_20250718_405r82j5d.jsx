import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import "./App.css"; // Pastikan Tailwind CSS sudah diatur

// Supabase Client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Mock Data
const packages = [
  { id: "sinta4", name: "SINTA 4", price: "Rp 1.400.000" },
  { id: "sinta5", name: "SINTA 5", price: "Rp 750.000" },
  { id: "sinta6", name: "SINTA 6", price: "Rp 500.000" },
  { id: "non-sinta", name: "Non-SINTA", price: "Rp 350.000" },
];

const topics = ["Ilmu Komputer", "Matematika", "Fisika", "Kimia", "Biologi"];

function App() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [orderTrackingId, setOrderTrackingId] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  // Form Pemesanan
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    institution: "",
    journalTitle: "",
    topic: "",
    level: "",
  });

  // Validasi Form
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName) errors.fullName = "Nama wajib diisi";
    if (!formData.email) errors.email = "Email wajib diisi";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Format email tidak valid";
    if (!formData.institution) errors.institution = "Institusi wajib diisi";
    if (!formData.journalTitle) errors.journalTitle = "Judul jurnal wajib diisi";
    if (!formData.topic) errors.topic = "Topik jurnal wajib dipilih";
    if (!formData.level) errors.level = "Tingkatan jurnal wajib dipilih";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Simpan Pesanan ke Supabase
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const orderData = {
      ...formData,
      package: selectedPackage,
      status: "Diproses",
      orderId: `ORD-${uuidv4()}`,
      createdAt: new Date(),
    };

    try {
      const { data, error } = await supabase.from("orders").insert([orderData]);
      if (error) throw error;
      setOrderConfirmation(orderData);
      setFormData({
        fullName: "",
        email: "",
        institution: "",
        journalTitle: "",
        topic: "",
        level: "",
      });
      setSelectedPackage(null);
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lacak Pesanan
  const handleTrackOrder = async () => {
    if (!orderTrackingId) return;
    try {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("orderId", orderTrackingId);
      if (data && data.length > 0) {
        alert(`Status pesanan ${data[0].orderId}: ${data[0].status}`);
      } else {
        alert("ID pesanan tidak ditemukan.");
      }
    } catch (error) {
      console.error("Error tracking order:", error);
    }
  };

  // Admin Login
  const handleAdminLogin = async () => {
    if (adminUsername === "owner123" && adminPassword === "owner1234") {
      setIsAdminLoggedIn(true);
    } else {
      alert("Username atau password salah.");
    }
  };

  // Logout Admin
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
  };

  // Fecth Orders for Admin
  useEffect(() => {
    if (isAdminLoggedIn) {
      const fetchOrders = async () => {
        try {
          const { data } = await supabase.from("orders").select("*");
          setOrders(data || []);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      };
      fetchOrders();
    }
  }, [isAdminLoggedIn]);

  // Update Order Status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await supabase.from("orders").update({ status: newStatus }).eq("orderId", orderId);
      const updatedOrders = orders.map((order) =>
        order.orderId === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // WhatsApp Integration
  const sendWhatsApp = () => {
    window.open(`https://wa.me/+6283823956834?text=Halo%20Publik%20Insight!`, "_blank");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      {/* Header */}
      <header className={`p-4 flex justify-between items-center ${darkMode ? "bg-blue-800" : "bg-blue-500"} text-white`}>
        <div className="flex items-center">
          <img
            src=" https://i.ibb.co/7QZVqZR/publik-insight-logo.png "
            alt="Logo Publik Insight"
            className="h-8 w-8 mr-2"
          />
          <span className="text-xl font-bold">PUBLIKA INSIGHT</span>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>Beranda</li>
            <li>Harga</li>
            <li>Pesan Jasa</li>
            <li>Lacak Pesanan</li>
            <li>Admin</li>
            <li>Kontak</li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={`py-12 px-4 sm:px-16 ${darkMode ? "bg-blue-800" : "bg-blue-500"} text-white`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">
            Publikasikan Jurnal Anda dengan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Profesional
            </span>
          </h1>
          <p className="text-xl mb-8">
            Layanan publikasi jurnal terpercaya untuk akademisi, peneliti, dan mahasiswa.
            Dapatkan akses ke jurnal terindeks bereputasi dengan proses cepat dan mudah.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
              Lihat Harga
            </button>
            <button className="bg-white hover:bg-gray-100 text-blue-500 px-4 py-2 rounded border border-blue-500">
              Konsultasi Gratis
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 px-4 sm:px-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Paket Harga Publikasi Jurnal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} shadow-md p-4 rounded transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <h3 className="text-xl font-bold">{pkg.name}</h3>
              <p className="text-2xl font-bold mb-2">{pkg.price}</p>
              <p className="text-sm mb-4">Per Artikel</p>
              <button
                onClick={() => setSelectedPackage(pkg)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded block w-full"
              >
                Pilih Paket
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Order Form Section */}
      {selectedPackage && (
        <section className="py-12 px-4 sm:px-16">
          <div className={`bg-white ${darkMode ? "bg-gray-800" : "bg-white"} shadow-md p-4 rounded max-w-lg mx-auto`}>
            <h2 className="text-xl font-bold mb-4 text-center">
              Form Pemesanan Jasa Publikasi
            </h2>
            <div className={`p-2 mb-4 rounded ${darkMode ? "bg-blue-800" : "bg-blue-100"}`}>
              <span className="mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline-block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              Paket {selectedPackage.name} - {selectedPackage.price} telah dipilih
            </div>
            <form onSubmit={handleSubmitOrder}>
              <div className="mb-4">
                <label htmlFor="fullName" className="block mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Masukkan nama lengkap"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded ${
                    formErrors.fullName ? "border-red-500" : ""
                  }`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="contoh@email.com"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded ${
                    formErrors.email ? "border-red-500" : ""
                  }`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="institution" className="block mb-2">
                  Institusi *
                </label>
                <input
                  type="text"
                  id="institution"
                  placeholder="Nama universitas/institusi"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded ${
                    formErrors.institution ? "border-red-500" : ""
                  }`}
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
                {formErrors.institution && <p className="text-red-500 text-sm mt-1">{formErrors.institution}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="journalTitle" className="block mb-2">
                  Judul Jurnal *
                </label>
                <input
                  type="text"
                  id="journalTitle"
                  placeholder="Masukkan judul jurnal"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded ${
                    formErrors.journalTitle ? "border-red-500" : ""
                  }`}
                  value={formData.journalTitle}
                  onChange={(e) => setFormData({ ...formData, journalTitle: e.target.value })}
                />
                {formErrors.journalTitle && <p className="text-red-500 text-sm mt-1">{formErrors.journalTitle}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="topic" className="block mb-2">
                  Topik Jurnal *
                </label>
                <select
                  id="topic"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded ${
                    formErrors.topic ? "border-red-500" : ""
                  }`}
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                >
                  <option value="">Pilih Topik Jurnal</option>
                  {topics.map((topic, index) => (
                    <option key={index}>{topic}</option>
                  ))}
                </select>
                {formErrors.topic && <p className="text-red-500 text-sm mt-1">{formErrors.topic}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="level" className="block mb-2">
                  Tingkatan Jurnal *
                </label>
                <select
                  id="level"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded ${
                    formErrors.level ? "border-red-500" : ""
                  }`}
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="">Pilih Tingkatan Jurnal</option>
                  <option>SINTA 5</option>
                  <option>SINTA 6</option>
                </select>
                {formErrors.level && <p className="text-red-500 text-sm mt-1">{formErrors.level}</p>}
              </div>
              <div className="mb-4">
                <p className="text-lg font-bold">
                  Harga: {selectedPackage.price}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    "Pesan Sekarang"
                  )}
                </button>
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="bg-white hover:bg-gray-100 text-blue-500 px-4 py-2 rounded border border-blue-500"
                >
                  Batal
                </button>
              </div>
            </form>
            {orderConfirmation && (
              <div className={`mt-4 p-4 rounded ${darkMode ? "bg-gray-700" : "bg-green-100"}`}>
                <h3 className="text-lg font-bold mb-2">Konfirmasi Pemesanan</h3>
                <p>ID Pesanan: <span className="font-mono">{orderConfirmation.orderId}</span></p>
                <p>Paket: {orderConfirmation.package.name}</p>
                <p>Harga: {orderConfirmation.package.price}</p>
                <p>Status: Diproses</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Order Tracking Section */}
      <section className="py-12 px-4 sm:px-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Lacak Pesanan Anda
        </h2>
        <p className="text-center mb-4">
          Masukkan ID pesanan untuk melihat status terkini
        </p>
        <div className={`bg-white shadow-md p-4 rounded max-w-lg mx-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <input
                type="text"
                id="trackingId"
                placeholder="Masukkan ID Pesanan (contoh: ORD-1234567890)"
                className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 pr-10 rounded`}
                value={orderTrackingId}
                onChange={(e) => setOrderTrackingId(e.target.value)}
              />
              <button
                type="button"
                onClick={handleTrackOrder}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Cari
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Admin Login Section */}
      {!isAdminLoggedIn && (
        <section className="py-12 px-4 sm:px-16">
          <div className={`bg-white shadow-md p-4 rounded max-w-md mx-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h2 className="text-xl font-bold mb-4 text-center">
              Area Admin (Hanya Owner)
            </h2>
            <form>
              <div className="mb-4">
                <label htmlFor="username" className="block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Masukkan username"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded`}
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Masukkan password"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded`}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded block w-full"
                onClick={handleAdminLogin}
              >
                Login
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Admin Dashboard */}
      {isAdminLoggedIn && (
        <section className="py-12 px-4 sm:px-16">
          <div className={`bg-white shadow-md p-4 rounded max-w-4xl mx-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Panel Admin</h2>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
            <div className="mb-4">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Ekspor ke Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className={`min-w-full ${darkMode ? "bg-gray-700" : "bg-white"} border-collapse`}>
                <thead>
                  <tr>
                    <th className={`px-4 py-2 ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>ID Pesanan</th>
                    <th className={`px-4 py-2 ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>Nama</th>
                    <th className={`px-4 py-2 ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>Jurnal</th>
                    <th className={`px-4 py-2 ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>Status</th>
                    <th className={`px-4 py-2 ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className={`${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"}`}>
                      <td className="px-4 py-2">{order.orderId}</td>
                      <td className="px-4 py-2">{order.fullName}</td>
                      <td className="px-4 py-2">{order.journalTitle}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded ${
                            order.status === "Diproses"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-green-200 text-green-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                          className={`border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-1`}
                        >
                          <option value="Diproses" selected={order.status === "Diproses"}>
                            Diproses
                          </option>
                          <option value="Selesai" selected={order.status === "Selesai"}>
                            Selesai
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-12 px-4 sm:px-16">
        <h2 className="text-3xl font-bold text-center mb-8">Kontak Kami</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="mb-4">
              Hubungi kami melalui WhatsApp untuk pertanyaan lebih lanjut:
            </p>
            <button
              onClick={sendWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7s-8-3.134-8-7c0-3.866 3.582-7 8-7s8 3.134 8 7zM5.002 6a1 1 0 011.993 0l.708 1.293A1 1 0 116.293 9l-.707-.707zm7.707 0A1 1 0 0014 6a1 1 0 00-1.707.707l-.703.707a1 1 0 001.414 1.414l.707-.707a1 1 0 000-1.414zm-4 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Kirim WhatsApp
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Form Kontak</h3>
            <form>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2">Nama</label>
                <input
                  type="text"
                  id="name"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded`}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded`}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block mb-2">Pesan</label>
                <textarea
                  id="message"
                  rows="4"
                  className={`w-full border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300"} p-2 rounded`}
                ></textarea>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`p-8 mt-12 ${darkMode ? "bg-gray-800" : "bg-blue-500"} text-white`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Tentang Kami</h3>
              <p>
                PUBLIKA INSIGHT menyediakan layanan publikasi jurnal untuk
                akademisi dan peneliti dengan proses cepat dan profesional.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Kontak</h3>
              <p className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h1.222c3.17 0 5.333 2.555 6.586 5.05L21.022 4a2 2 0 012 2v7a2 2 0 01-2 2H3z"
                  />
                </svg>
                +62 838-2395-6834
              </p>
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                info@publikainsight.com
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Jam Operasional</h3>
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Setiap Hari 24 Jam
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              {darkMode ? "Tema Terang" : "Tema Gelap"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;