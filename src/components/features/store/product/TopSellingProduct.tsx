import { FC } from "react";
import { topSellingProducts } from "./data";
import { ArrowRight } from "lucide-react";
import { TopSellingProductProps } from "./types";
export const TopSellingProduct = () => {
  return (
    <div className="dark:bg-[#13111E] border border-black/20 dark:border-[rgba(255,255,255,0.1)] rounded-xl lg:px-6 px-4 py-6">
      <div className="pt-6 lg:px-6 px-4 pb-2 space-y-2">
        <h2 className="text-lg font-semibold dark:text-white text-black">Top Selling Products</h2>
        <p className="text-[#a1a0a5] text-sm mb-4 dark:text-white text-black">
          Best performers this month
        </p>
      </div>
      <div className="pb-6 px-4 lg:px-6 space-y-4">
        {topSellingProducts.slice(0, 3).map((product) => (
          <div key={product.id}>
            <TopSellingProductCard {...product} />
          </div>
        ))}
      </div>
      <div className=" px-4 lg:px-6 flex items-center justify-center">
        <button className="pt-[0.60rem] pb-[0.64rem] flex gap-2 text-white/60 hover:text-white/80 transition ease-in-out duration-75 text-center">
          View All Products
          <span>
            <ArrowRight />
          </span>
        </button>
      </div>
    </div>
  );
};
const TopSellingProductCard: FC<TopSellingProductProps> = ({
  name,
  color,
  sold,
  inStock,
  revenue,
  growthPercentage,
}) => {
  return (
    <div className="p-3 flex gap-4 justify-between items-center dark:bg-white/5 bg-black/5 rounded-lg">
      <div className="flex gap-4">
        <div className="dark:bg-[#EAEAEA] bg-black size-10  rounded-[6px]"></div>
        <div>
          <p className="text-[0.97rem] dark:text-white text-black font-medium leading-6">
            {name} ({color})
          </p>
          <div>
            <p className="font-normal leading-5 dark:text-white/60 text-black text-[0.84rem]">
              {sold} sold • {inStock} {revenue}
            </p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[#4ADE80] text-sm leading-5 font-normal">
          {growthPercentage}%
        </p>
      </div>
    </div>
  );
};
