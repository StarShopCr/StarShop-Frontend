import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Shield, Star, Truck, Crown } from 'lucide-react';

const Achievements = () => {
  const achievements = [
    {
      title: 'Verified Seller',
      description: 'Authenticated business',
      icon: Shield,
      color: 'text-green-400',
    },
    {
      title: 'Top Rated',
      description: 'Consistent 5-star ratings',
      icon: Star,
      color: 'text-yellow-400',
    },
    {
      title: 'Fast Shipper',
      description: 'Quick delivery times',
      icon: Truck,
      color: 'text-blue-400',
    },
    {
      title: 'Premium Store',
      description: 'Quality products & service',
      icon: Crown,
      color: 'text-purple-400',
    },
  ];

  return (
    <div>
      <Card className=" bg-[#0F0E1D] shadow-[0_0_8px_rgba(255,255,255,0.1)] border-slate-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-[#4847531b] rounded-xl p-4 text-center space-y-3 hover:bg-[#4847533f] transition-colors"
              >
                <div className="flex justify-center">
                  <achievement.icon
                    className={`w-8 h-8 ${achievement.color}`}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-sm">
                    {achievement.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Achievements;
