import React from 'react'

const NetworkPerformance = () => {
    const networkStats = [
    {
      id: 'avgTransactionTime',
      value: '3s',
      title: 'Avg. Transaction Time'
    },
    {
      id: 'uptime', 
      value: '99.99%',
      title: 'Uptime'
    },
    {
      id: 'transactionFee',
      value: '$0.01',
      title: 'Transaction Fee'
    },
    {
      id: 'networkAvailability',
      value: '24/7',
      title: 'Network Availability'
    }
  ];

  return (
    <section className="relative overflow-hidden py-12 w-full" aria-labelledby="network-performance" role="region">
      <div className="max-w-[1350px] m-auto px-[10px] md:px-[50px]">
        <div className="flex flex-col items-center justify-center">
          <div className="inline-flex bg-slate-800/50 border border-green-200/20 rounded-full px-4 py-2 mb-8">
            <div className="flex flex-row gap-2 text-center items-center" aria-live="polite">

              <div className="rounded-full bg-green-700 w-3 h-3"/>
              <span className="text-green-200 font-semibold text-sm md:text-base">Live Network Status: All Systems Operational</span>

            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#14b8a6] w-full">
            <div className="text-center py-10 px-8">
              <h1 className="text-white font-bold text-4xl mb-4">Network Performance</h1>
              <h2 className="text-white text-xl mb-12">Stellar blockchain delivering exceptional speed and reliability.</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 text-white">
                {networkStats.map(stat => (
                  <div key={stat.id} className='text-center space-y-2'>
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-white/90">
                      {stat.title}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NetworkPerformance