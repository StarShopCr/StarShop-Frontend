import React from 'react';

const brands = [
  'TechCorp',
  'InnovateLab',
  'FutureTech',
  'BlockchainCo',
  'CryptoStart',
  'WebNext',
];

export const TrustedBy = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto relative rounded-2xl overflow-hidden bg-[#23213a] border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-indigo-950/20 to-indigo-900/10"></div>
        
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\' /%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />
        
        <div className="relative z-10 p-8 sm:p-12 border border-white/10 rounded-2xl">
          <h2 className="text-2xl font-medium text-center text-white mb-12">
            Trusted by innovative businesses worldwide
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
            {brands.map((brand) => (
              <div 
                key={brand}
                className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg bg-white/5 text-white/90 text-sm sm:text-base font-medium border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-200 flex items-center"
              >
                {brand}
              </div>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-white/80">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span>24/7 Uptime</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Enterprise Grade</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Blockchain Secured</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
