import React from 'react';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className=" text-white">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* HackForge Description */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-orange-500">{"<"}</span>
              <span className="text-white">CM</span>
              <span className="text-orange-500">{">"}</span>
              <span className="ml-2 text-white">DSA Mentor</span>
            </div>
            <p className="text-gray-400 text-sm">
              Sharpen your coding skills and forge your future with our comprehensive problem-solving platform.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">QUICK LINKS</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
               <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy-Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">CONNECT WITH US</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          © 2026 DSA-Mentor. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;