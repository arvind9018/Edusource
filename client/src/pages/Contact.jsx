import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaTwitter, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
  });
  const [isSent, setIsSent] = useState(false); // New state for the success message

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const serviceId = "service_4wu094m";
    const templateId = "template_xszli6j";
    const publicKey = "j7BOR54Le4yf7hls1";

    emailjs
      .send(serviceId, templateId, formData, { publicKey })
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          setIsSent(true); // Show the success message
          setFormData({ name: "", email: "", message: "", phone: "" });
        },
        (error) => {
          console.log("FAILED...", error);
          alert("Failed to send message. Please try again.");
        }
      );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-200 font-[Poppins] p-8">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="text-4xl font-bold mb-6 text-center text-slate-900">Contact Us</h1>
        
        {/* Conditional rendering for the success message */}
        {isSent ? (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg">
            <p className="font-bold text-lg">Message Sent!</p>
            <p>Thank you for your message. We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-blue-200 p-8 rounded-xl shadow-lg border border-blue-800">
            
            {/* Contact Form Section */}
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="grid gap-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  className="p-4 border border-gray-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  className="p-4 border border-gray-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.email}
                  onChange={handleChange}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone Number (Optional)"
                  className="p-4 border border-gray-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  required
                  rows={5}
                  className="p-4 border border-gray-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.message}
                  onChange={handleChange}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information and Map Section */}
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold text-slate-800">Our Details</h2>
              
              {/* Contact Details with Icons */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <FaEnvelope className="text-indigo-600 text-2xl" />
                  <a href="mailto:arvindkumar18320@gmail.com" className="text-gray-700 hover:text-indigo-600 transition">
                    arvindkumar18320@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <FaPhoneAlt className="text-indigo-600 text-2xl" />
                  <a href="tel:+917658009018" className="text-gray-700 hover:text-indigo-600 transition">
                    +91 7658009018
                  </a>
                </div>
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-indigo-600 text-2xl mt-1" />
                  <p className="text-gray-700">Guru Teg Bahadur Nagar, Nawanshahr, Punjab, India 144514</p>
                </div>
              </div>

              {/* Google Map (Iframe) */}
              <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                <iframe
                  title="Our Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13627.530438641973!2d76.1098492!3d31.1274154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a6296317b3f99%3A0x6731215167f654b4!2sNawanshahr%2C%20Punjab%20144514!5e0!3m2!1sen!2sin!4v1677610014023!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
