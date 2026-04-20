// Contact.jsx - Copy this entire file
import React, { useState } from 'react';
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState({
    type: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Sending...' });

    // Create FormData object
    const formDataObj = new FormData();
    formDataObj.append('access_key', 'bb849db9-a9a8-4dde-b2ad-d9dd0e82ea4d');
    formDataObj.append('name', formData.name);
    formDataObj.append('email', formData.email);
    formDataObj.append('subject', formData.subject);
    formDataObj.append('message', formData.message);
    formDataObj.append('from_name', 'DSA MENTOR CONTACT FORM');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formDataObj
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Success! Your message has been sent. We will get back to you soon.'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setStatus({
          type: 'error',
          message: 'Error: ' + data.message
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.'
      });
    }

    setTimeout(() => {
      setStatus({ type: '', message: '' });
    }, 5000);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-gray-400 text-lg">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-[#232b3b] rounded-2xl p-8 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Mail className="mr-3 text-orange-500" size={28} />
              Send Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="How can we help you?"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-4 text-gray-400" size={20} />
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full pl-12 pr-4 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
              </div>

              {/* Status Messages */}
              {status.message && (
                <div className={`p-4 rounded-lg flex items-center ${
                  status.type === 'success' ? 'bg-green-900/30 border border-green-500' :
                  status.type === 'error' ? 'bg-red-900/30 border border-red-500' :
                  'bg-blue-900/30 border border-blue-500'
                }`}>
                  {status.type === 'success' && <CheckCircle className="mr-3 text-green-500" size={20} />}
                  {status.type === 'error' && <AlertCircle className="mr-3 text-red-500" size={20} />}
                  <span className={`text-sm ${
                    status.type === 'success' ? 'text-green-300' :
                    status.type === 'error' ? 'text-red-300' :
                    'text-blue-300'
                  }`}>
                    {status.message}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {status.type === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-[#232b3b] rounded-2xl p-8 shadow-xl border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <p className="text-gray-400">support@dsamentor.com</p>
                    <p className="text-gray-400">anushkavishwakarma98980@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Live Chat</h3>
                    <p className="text-gray-400">Available 24/7 for premium members</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Card */}
            <div className="bg-[#232b3b] rounded-2xl p-8 shadow-xl border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Frequently Asked</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">Response Time</h3>
                  <p className="text-gray-400 text-sm">We typically respond within 24-48 hours</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">Business Hours</h3>
                  <p className="text-gray-400 text-sm">Monday - Friday, 9:00 AM - 6:00 PM IST</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">Technical Support</h3>
                  <p className="text-gray-400 text-sm">For urgent issues, please include "URGENT" in subject</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;