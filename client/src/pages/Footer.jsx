import React from "react";
import { FaInstagram, FaGithub, FaYoutube } from "react-icons/fa";
import { SiX } from "react-icons/si"; // Import SiX for the X logo

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left: Brand */}
        <div>
          <h2 className="text-2xl font-bold mb-2">🎓 Edusource</h2>
          <p className="text-sm text-gray-400">Empowering learners with quality online education. 🚀</p>
          <p className="text-xs mt-4 text-gray-500">&copy; {new Date().getFullYear()} Edusource. All rights reserved.</p>
        </div>

        {/* Middle: Navigation */}
        <div className="flex flex-col space-y-2 text-sm">
          <a href="/hero-page" className="hover:text-indigo-400 transition">Home</a>
          <a href="/about" className="hover:text-indigo-400 transition">About</a>
          <a href="/contact" className="hover:text-indigo-400 transition">Contact</a>
          <a href="/terms" className="hover:text-indigo-400 transition">Terms</a>
          <a href="/privacy" className="hover:text-indigo-400 transition">Privacy Policy</a>
           <a href="/forum" className="hover:text-indigo-400 transition">Forum</a>

        </div>

        {/* Right: Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Connect with Us</h3>
          <div className="flex gap-4 text-xl">
            <a href="https://www.instagram.com/arvind.yadav.07/" target="_blank" className="text-pink-500 hover:text-pink-400 transition-colors"><FaInstagram size={26}/></a>
            <a href="https://github.com/arvind9018"target="_blank" className="text-gray-300 hover:text-white transition-colors"><FaGithub size={26}/></a>
            {/* Changed FaTwitter to SiX */}
            <a href="https://x.com/@Arvind5800" target="_blank" className="text-gray-300 hover:text-white transition-colors" ><SiX size={26}/></a>
            <a href="#" target="_blank" className="text-red-600 hover:text-red-500 transition-colors"><FaYoutube size={26}/></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
