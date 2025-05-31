"use client";
import React from "react";
import { Download, Plus } from "lucide-react";

import ProductPerformance from "@/components/features/store/product/ProductPerformance";
import InventoryStatus from "@/components/features/store/product/InventoryStatus";
import QuickActions from "@/components/features/store/product/QuickActions";
import { TopSellingProduct } from "@/components/features/store/product/TopSellingProduct";
import { InventoryAlerts } from "@/components/features/store/product/InventoryAlerts";
import { BulkAction } from "@/components/features/store/product/BulkAction";

export default function ProductDashboard() {
  return (
    <div className="min-h-screen mt-4 bg-opacity-90 bg-[url('https://via.placeholder.com/1920x1080?text=')] bg-stars container mx-auto px-4 py-8 bg-stars bg-cover bg-center text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-black">Products</h1>
          <p className="text-[#a1a0a5]">
            Manage your store inventory and listings
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center space-x-2 gap-2 bg-[#9333ea] hover:bg-[#842fd3] px-4 py-2 rounded-lg">
            <Plus size={20} />
            <span className="">Add Product</span>
          </button>
          <button className="flex items-center space-x-2 gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg dark:text-white text-black">
            <Download size={20} />
            <span>Import</span>
          </button>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProductPerformance />
        <InventoryStatus />
        <QuickActions />
      </div> 
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <TopSellingProduct />
        <InventoryAlerts />
      </div> 
      <BulkAction />
    </div>
  );
}
