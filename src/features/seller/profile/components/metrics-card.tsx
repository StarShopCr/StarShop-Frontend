import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';

const MetricsCard = () => {
  const metrics = [
    { label: 'Total Products', value: '156' },
    { label: 'Active Orders', value: '23' },
    { label: 'Customer Rating', value: '4.8/5.0' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className=" bg-[#0F0E1D] shadow-[0_0_8px_rgba(255,255,255,0.1)] border-slate-700"
          >
            <CardContent className="p-4 md:p-7">
              <div className="space-y-3">
                <p className="text-gray-500 text-sm font-medium">
                  {metric.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {metric.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MetricsCard;
