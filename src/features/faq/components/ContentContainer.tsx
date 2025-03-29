import React from 'react';

interface ContentContainerProps {
  iconLarge: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({ 
  iconLarge, 
  title, 
  description, 
  children 
}) => (
  <div 
    className="bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-xl p-6"
    style={{ border: "1px solid #333", padding: "1rem" }}
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="text-purple-500  ">
        {iconLarge}
      </div>
      <h2 className="text-xl font-bold text-white">{title} Questions</h2>
    </div>
    <p className="text-gray-400 text-sm mb-6">
      {description}
    </p>

    <div className="space-y-4">
      {children}
    </div>
  </div>
);