import React, { useState } from "react";

import { ChevronRight, ChartNoAxesColumn } from "lucide-react";

const ProductPerformance = () => {
  const [topProducts] = useState([
    { name: "Premium Hoodie", sold: 24 },
    { name: "Urban Sneakers", sold: 18 },
    { name: "Graphic T-Shirt", sold: 12 },
  ]);

  return (
    <div className="dark:bg-[#13111e6b] border border-black/20 dark:border-[#2b2934] rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold dark:text-white text-black">Product Performance</h2>
        <div className="text-[#9333ea]">
          <ChartNoAxesColumn size={24} />
        </div>
      </div>
      <p className="text-[#a1a0a5] text-sm mb-4">
        Top selling products this month
      </p>

      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span className="dark:text-white text-black">{product.name}</span>
                <span className="dark:text-[#a1a0a5] text-black">{product.sold} sold</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#9333ea] to-[#9333ea] h-2 rounded-full"
                  style={{ width: `${(product.sold / 25) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="flex justify-center mx-auto text-center items-center gap-1 text-[#a1a0a5] hover:text-white mt-6 text-sm">
        View Sales Report
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default ProductPerformance;
