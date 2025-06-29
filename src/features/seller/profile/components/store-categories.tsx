import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

const StoreCategories = () => {
  const categories = [
    {
      name: 'Streetwear',
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      name: 'Urban Fashion',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      name: 'Accessories',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    {
      name: 'Footwear',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    {
      name: 'Limited Editions',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    },
    {
      name: 'Sustainable',
      color: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    },
  ];

  return (
    <div>
      {' '}
      <Card className=" bg-[#0F0E1D] shadow-[0_0_8px_rgba(255,255,255,0.1)] border-slate-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-white mb-5">
            Store Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`px-3 py-1 text-sm rounded-2xl font-medium border ${category.color}`}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreCategories;
