import { SelectContent } from "@/components/ui/select";
import { SvgIcons } from "@/svg/svg";

import {
  Select,
  SelectIcon,
  //   SelectIcon,
  SelectItem,
  SelectPortal,
  //   SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@radix-ui/react-select";

export const BulkAction = () => {
  return (
    <div className="pt-2 pb-6 dark:bg-[#13111E] border border-black/20 dark:border-[rgba(255,255,255,0.1)] border drop-shadow-lg rounded-lg">
      <div className="pt-6 px-6 pb-2 space-y-2">
        <h2 className="text-lg font-semibold dark:text-white text-black">Bulk Actions</h2>
        <p className="text-[#a1a0a5] text-sm mb-4">
          Manage multiple products at once
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Update Price</p>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-full py-[0.62rem]  rounded-md border-white/20  text-sm dark:bg-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.05)]  border  flex justify-between items-center px-3 dark:text-white text-black">
                <SelectValue placeholder="Percentage" />
                <SelectIcon asChild>{SvgIcons.arrowDown()}</SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectContent className="bg-white/90">
                  <SelectViewport>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </Select>
            <div className="flex">
              <input
                type="text"
                className="bg-[rgba(0,0,0,0.05)] dark:bg-white/5 border-y border-l border-white/20 px-4 py-[0.62rem] rounded-l-md outline-none text-[#9CA3AF] text-[0.857rem] font-medium leading-5 max-w-[4.35rem]"
              />
              <button className="bg-[#9333EA] px-4 py-[0.62rem] rounded-r-md  text-white text-[0.857rem] font-medium leading-5">
                Apply
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Update Status</p>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-full py-[0.62rem]  rounded-md border-white/20  text-sm dark:bg-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.05)] border  flex justify-between items-center px-3 dark:text-white text-black">
                <SelectValue placeholder="Select status" />
                <SelectIcon asChild>{SvgIcons.arrowDown()}</SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectContent className="bg-white/90">
                  <SelectViewport>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </Select>
            <div>
              <button className="bg-[#9333EA] px-4 py-[0.62rem] rounded-md text-white text-[0.857rem] font-medium leading-5">
                Apply
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <p className="font-medium leading-[0.875rem] text-[0.85rem] dark:text-white text-black">
            Bulk Delete
          </p>
          <button className="flex items-center justify-center rounded-md border dark:border-[rgba(255,255,255,0.2)] border-[rgba(0,0,0,0.2)]   py-[0.62rem] text-[0.86rem] font-medium leading-5 w-full dark:text-white text-black">
            {SvgIcons.deleteIcon()}
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
};
