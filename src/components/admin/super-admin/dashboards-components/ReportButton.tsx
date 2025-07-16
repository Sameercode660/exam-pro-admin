'use client';
import React from 'react';

const ReportButton = () => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <button className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:opacity-90 shadow-lg transition">
        Generate Report
      </button>
    </div>
  );
};

export default ReportButton;
