
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, Edit,Trophy, Trash2, Shield, ArrowRight,Video  } from 'lucide-react';

// --- Card Component for better code organization ---
const AdminOptionCard = ({ option }) => {
  const IconComponent = option.icon;

  return (
    <NavLink
      to={option.route}
      className="group block p-8 bg-gray-800 border border-gray-700 rounded-2xl shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-1.5"
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="bg-gray-700/50 p-4 rounded-xl w-max mb-6 transition-colors duration-300">
            <IconComponent 
              size={32} 
              className="text-gray-300 group-hover:text-orange-500 transition-colors duration-300" 
            />
          </div>
          
          <h2 className="font-bold text-xl text-white mb-2 transition-colors duration-300">
            {option.title}
          </h2>
          
          <p className="text-gray-400 leading-relaxed">
            {option.description}
          </p>
        </div>
        
        <div className="mt-8 flex items-center font-semibold text-orange-500">
          <span>Go to {option.title}</span>
          <ArrowRight 
            size={18} 
            className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
          />
        </div>
      </div>
    </NavLink>
  );
};

// --- Main Admin Component ---
function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Design and add a completely new coding challenge to the library.',
      icon: Plus,
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update & Manage',
      description: 'Edit, refine, and manage the details of all existing problems.',
      icon: Edit,
      route: '/admin/update' // Route to the list page
    },
    {
      id: 'delete',
      title: 'Delete Problems',
      description: 'Permanently remove coding challenges from the platform.',
      icon: Trash2,
      route: '/admin/delete' // Route to the new ProblemManager
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload And Delete Videos',
      icon: Video,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/video'
    },
    {
      id: 'contest',
      title: 'Contest Arena',
      description: 'Manage and schedule new coding contests for the community.',
      icon: Trophy,
      route: '/contest'
    }
  ];

  return (
    <div className="min-h-screen text-gray-200">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center bg-orange-900/50 p-4 rounded-2xl mb-6">
            <Shield className="text-orange-500" size={40} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Admin Control Panel
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400">
            Your central hub for managing all coding problems. Create, update, or remove challenges with ease.
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {adminOptions.map((option) => (
            <AdminOptionCard key={option.id} option={option} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;