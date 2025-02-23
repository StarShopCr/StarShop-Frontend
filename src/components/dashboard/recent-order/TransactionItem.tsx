import { Cuboid } from 'lucide-react';



interface TransactionProps {
  id: string;
  product: string;
  date: string;
  title: string;
  amount: number;
  state: string;
  status: "Completed" | "Failed" | "Processing";
  type: "income" | "expense"; 
}

const TransactionCard = ({ product, title, amount,state, status }: TransactionProps) => {
    const getStateStyles = (state: string) => {
        switch (state.toLowerCase()) {
          case 'paid':
            return 'text-emerald-500';
          case 'processing':
            return 'text-amber-500';
          case 'shipped':
            return 'text-blue-500';
          default:
            return 'text-gray-400';
    
        }

    }

  const statusColors = {
    Completed: {
      bg: "bg-green-900/30",
      icon: "text-green-400",
      text: "text-green-400",
    },
    Failed: {
      bg: "bg-red-900/30",
      icon: "text-red-400",
      text: "text-red-400",
    },
    Processing: {
      bg: "bg-yellow-900/30",
      icon: "text-yellow-400",
      text: "text-yellow-400",
    },
  };

  const { bg, icon } = statusColors[status] || statusColors.Processing;

  return (
 
<div className="flex items-center bg-[#1e1c38]/60 p-4 border-[#242332] border-y backdrop-blur-sm opacity-60">
  
    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${bg}`}>
      <Cuboid className={`${icon} w-5 h-5`} />
    </div>

   
    <div className="ml-4 flex-1">
      <h4 className="text-base font-medium text-white">{product}</h4>
      <p className="text-sm text-gray-400">{title}</p>
    </div>

  
    <div className="text-right">
      <p className="text-lg font-semibold text-white">
        ${Math.abs(amount).toFixed(2)}
      </p>
      <p className={`text-sm ${getStateStyles(state)}`}>{state}</p>
    </div>
  </div>

  );
};

export default TransactionCard;