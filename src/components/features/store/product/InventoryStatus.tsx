import React, { useState } from "react";

import { Package } from "lucide-react";

const InventoryStatus = () => {
  const totalProducts = 156;
  const [inStock] = useState(142);
  const [lowStock] = useState(8);
  const [outOfStock] = useState(6);

  return (
    <div className="dark:bg-[#13111e6b] border border-black/20 dark:border-[#2b2934] rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold dark:text-white text-black">Inventory Status</h2>
        <div className="text-purple-500">
          <Package size={24} />
        </div>
      </div>
      <p className="text-[#a1a0a5] text-sm mb-4">Current stock levels</p>

      <div className="flex justify-center mb-6">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 100 100" className="transform -rotate-90 h-32 w-32">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#1a1927"
              strokeWidth="8"
            />

            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ef4444"
              strokeWidth="8"
              strokeDasharray="36 247"
              strokeDashoffset="0"
            />

            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ef4444"
              strokeWidth="8"
              strokeDasharray="36 247"
              strokeDashoffset="-70"
            />

            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ef4444"
              strokeWidth="8"
              strokeDasharray="36 247"
              strokeDashoffset="-141"
            />

            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ef4444"
              strokeWidth="8"
              strokeDasharray="36 247"
              strokeDashoffset="-212"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold dark:text-white text-black">
              {totalProducts}
            </span>
            <span className="text-xs dark:text-gray-400 text-black text-center">
              Total
              <br />
              Products
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#142324] bg-opacity-20 rounded-lg p-3 text-center">
          <span className="block text-[#36af69] text-xl font-bold">
            {inStock}
          </span>
          <span className="block text-[#36af69] text-xl font-bold">2</span>
          <span className="block text-[#5a6565] text-xs">
            In
            <br />
            Stock
          </span>
        </div>
        <div className="bg-[#2a1f1c] bg-opacity-20 rounded-lg p-3 text-center">
          <span className="block text-[#e1ab23] text-xl font-bold">
            {lowStock}
          </span>
          <span className="block text-[#5a6565] text-xs">Low Stock</span>
        </div>
        <div className="bg-[#291622] bg-opacity-20 rounded-lg p-3 text-center">
          <span className="block text-[#f87171] text-xl font-bold">
            {outOfStock}
          </span>
          <span className="block text-[#5a6565] text-xs">Out of Stock</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryStatus;
