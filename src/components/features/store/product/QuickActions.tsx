import React from "react";
import { Percent, Settings, Tag, Truck } from "lucide-react";

const QuickActions = () => {
  return (
    <div className="border border-black/20 dark:border-[#2b2934] dark:bg-[#13111e6b] rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 dark:text-white text-black">Quick Actions</h2>
      <p className="text-[#a1a0a5] text-sm mb-4 dark:text-white text-black">Common product tasks</p>

      <div className="space-y-3">
        <button className="w-full bg-[#2d1847] hover:bg-[#361c55] border border-[#46246a] text-white p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">+</span>
            <span>Add New Product</span>
          </div>
        </button>

        <button className="w-full bg-[#0e0e1b] hover:bg-[#101022] text-white p-3 border border-[#3e3e49] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={18} />
            <span>Manage Categories</span>
          </div>
        </button>

        <button className="w-full bg-[#0e0e1b] hover:bg-[#101022] border border-[#3e3e49] text-white p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent size={18} />
            <span>Create Discount</span>
          </div>
        </button>

        <button className="w-full bg-[#0e0e1b] hover:bg-[#101022] border border-[#3e3e49] text-white p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={18} />
            <span>Update Shipping Options</span>
          </div>
        </button>

        <button className="w-full bg-[#0e0e1b] hover:bg-[#101022] border border-[#3e3e49] text-white p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} />
            <span>Product Settings</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
