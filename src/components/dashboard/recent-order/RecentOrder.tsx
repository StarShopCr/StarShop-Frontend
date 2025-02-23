import { ArrowRight } from "lucide-react";
import TransactionCard from "./TransactionItem";

interface TransactionProps {
  id: string;
  product: string;
  title: string;
  date: string;
  amount: number;
  state: string;
  status: "Completed" | "Failed" | "Processing";
  type: "income" | "expense";
}

const transactions: TransactionProps[] = [
  {
    id: "TX123456",
    title: "Order #8832 - John D.",
    product: "Premium Hoodie (Black)",
    date: "Mar 15, 2024",
    amount: 156.0,
    state: "paid",
    status: "Completed",
    type: "income",
  },
  {
    id: "TX123455",
    title: "Order #8831 - Sarah M.",
    product: "Urban Pants Gray",
    date: "Mar 14, 2024",
    amount: -890.0,
    state: "Processing",
    status: "Processing",
    type: "expense",
  },
  {
    id: "TX123454",
    title: "Order #8830 - Jane D.",
    product: "Graphic T-Shirt White",
    date: "Mar 13, 2024",
    amount: 89.99,
    state: "Shipped",
    status: "Completed",
    type: "income",
  },
  {
    id: "TX123453",
    title: "Order #8830 - James V",
    product: "Limited Sneakers",
    date: "Mar 12, 2024",
    amount: 129.99,
    state: "Paid",
    status: "Completed",
    type: "income",
  },
];

const RecentOrders = () => {
    return (
        <div className="relative overflow-hidden">
          
          <div className="absolute inset-0 bg-transparent">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-soft-light"></div>
          </div>
    
          <div className="relative p-4 rounded-lg shadow-md bg-transparent">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
              <span className="text-gray-500 text-sm">Today</span>
            </div>
    
            <div className="md:border md:rounded-2xl overflow-hidden border-[#1e1c38] backdrop-blur-sm">
              <div className="bg-[#1e1c38]/30">
                {transactions.map((tx) => (
                  <TransactionCard key={tx.id} {...tx} />
                ))}
              </div>
    
              <div className="w-full flex justify-center items-end p-4 bg-[#1e1c38]/10">
                <button className="text-white flex flex-row font-thin justify-between items-center p-2 rounded-2xl w-40 hover:bg-[#1e1c38] transition-all duration-200">
                  View All Orders
                  <ArrowRight className="font-thin h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
};

export default RecentOrders;
