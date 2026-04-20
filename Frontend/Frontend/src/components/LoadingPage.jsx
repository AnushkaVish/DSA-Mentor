import React from 'react';
import Loader from './Loader';

const SimpleLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Loader />
    </div>
  );
};

export default SimpleLoader;
