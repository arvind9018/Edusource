import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaTwitter, FaFacebookF, FaLinkedinIn, FaInstagram, FaGithub } from "react-icons/fa"; // Added FaInstagram, FaGithub

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
  });
  const [isSending, setIsSending] = useState(false); // To disable button while sending
  const [isSent, setIsSent] = useState(false); // State for the success message
  const [error, setError] = useState(null); // State for error message

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (isSent) setIsSent(false); // Clear success message on new input
    if (error) setError(null); // Clear error message on new input
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true); // Disable button
    setIsSent(false); // Reset success
    setError(null); // Reset error

    const serviceId = "service_4wu094m";
    const templateId = "template_xszli6j";
    const publicKey = "j7BOR54Le4yf7hls1";

    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields: Name, Email, and Message.");
      setIsSending(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsSending(false);
      return;
    }

    emailjs
      .send(serviceId, templateId, formData, { publicKey })
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          setIsSent(true); // Show the success message
          setFormData({ name: "", email: "", message: "", phone: "" }); // Clear form
          setIsSending(false); // Enable button
        },
        (err) => {
          console.error("FAILED...", err);
          setError("Failed to send message. Please try again. Error: " + (err.text || err.message));
          setIsSending(false); // Enable button
        }
      );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-200 font-[Poppins] py-8 px-4 sm:px-6 lg:px-8"> {/* Adjusted padding */}
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-slate-900">Get in Touch</h1>

        {/* Conditional rendering for messages */}
        {isSent && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md mb-8 transition-all duration-300">
            <p className="font-bold text-lg">Message Sent Successfully!</p>
            <p>Thank you for your message. We'll get back to you as soon as possible.</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-8 transition-all duration-300">
            <p className="font-bold text-lg">Error Sending Message!</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-gradient-to-br from-indigo-200 to-blue-200 font-[Poppins] py-8 px-4 sm:px-6 lg:px-8 border-blue-300"> {/* Changed bg-blue-200 to bg-white for a cleaner look */}

          {/* Contact Form Section */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="grid gap-5"> {/* Adjusted gap */}
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                className="p-3 border border-gray-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500 transition-all text-gray-800" /* Smaller padding, text color */
                value={formData.name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                className="p-3 border border-gray-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Your Phone Number (Optional)"
                className="p-3 border border-gray-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
                value={formData.phone}
                onChange={handleChange}
              />
              <textarea
                name="message"
                placeholder="Your Message"
                required
                rows={6} /* Increased rows for better usability */
                className="p-3 border border-gray-300 rounded-lg focus:outline-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
                value={formData.message}
                onChange={handleChange}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed" /* Larger text, shadow */
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send Message"}
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
                <a href="mailto:arvindkumar18320@gmail.com" className="text-gray-700 hover:text-indigo-600 transition break-words"> {/* Added break-words */}
                  arvindkumar18320@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-indigo-600 text-2xl" />
                <a href="tel:+917658009018" className="text-gray-700 hover:text-indigo-600 transition">
                  +91 7658009018
                </a>
              </div>
              <div className="flex items-start gap-4"> {/* Changed to items-start for consistent top alignment */}
                <FaMapMarkerAlt className="text-indigo-600 text-2xl mt-1 flex-shrink-0" /> {/* flex-shrink-0 to prevent icon from shrinking */}
                <p className="text-gray-700">Guru Teg Bahadur Nagar, Nawanshahr, Punjab, India 144514</p>
              </div>
            </div>

            {/* Google Map (Iframe) */}
            <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg border border-gray-200"> {/* Responsive height */}
              <iframe
                title="Our Location"
                // IMPORTANT: Replace this with your actual Google Maps embed URL
                // Go to Google Maps, search your address, click Share -> Embed a map, copy the src attribute.
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3410.74837560731!2d76.1260021!3d31.1218206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a039750000001%3A0x6b772c7a52e0c036!2sGuru%20Teg%20Bahadur%20Nagar%2C%20Nawanshahr%2C%20Punjab%20144514!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Social Media Links */}
            

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
