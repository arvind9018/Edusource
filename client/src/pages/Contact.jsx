import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 font-[Poppins]">
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-center text-slate-900">Contact Us</h1>
        <form onSubmit={handleSubmit} className="grid gap-6 bg-white shadow-xl rounded-lg p-8">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className="p-4 border border-gray-300 rounded-lg focus:outline-blue-500"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            className="p-4 border border-gray-300 rounded-lg focus:outline-blue-500"
            value={formData.email}
            onChange={handleChange}
          />
          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows={5}
            className="p-4 border border-gray-300 rounded-lg focus:outline-blue-500"
            value={formData.message}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
