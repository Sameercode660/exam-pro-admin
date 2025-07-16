'use client';
import React from 'react';

const RequestedDataSection = () => {
  return (
    <div className="w-full max-w-5xl mx-auto bg-white/80 border border-gray-200 rounded-2xl shadow-xl p-6 backdrop-blur-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Requested Data</h2>
      <div className="text-gray-500">
        No requested data available yet.
      </div>
    </div>
  );
};

export default RequestedDataSection;
