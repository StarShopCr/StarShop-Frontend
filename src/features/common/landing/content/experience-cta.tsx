import React from 'react';

export default function ExperienceCta() {
  return (
    <div className="mt-20 text-center">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
        <h3 className="text-3xl font-bold mb-6">
          Ready to Experience the Future?
        </h3>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of businesses and customers who trust StarShop for
          their blockchain commerce needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors duration-300">
            Start Selling
          </button>
          <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-colors duration-300">
            Explore Products
          </button>
        </div>
      </div>
    </div>
  );
}
