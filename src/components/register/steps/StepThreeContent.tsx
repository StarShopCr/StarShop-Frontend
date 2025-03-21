"use client";

import React from "react";
import UploadPhotoProfile from "@/components/ui/UploadPhotoProfile";
import StarShopCard from "@/components/ui/StarShopCard";
import Input from "@/components/ui/input";
import { MapPinned, Store } from "lucide-react";
import { NotebookText } from "lucide-react";

const SettingsComponent: React.FC = () => {
  return (
    <>
      <section className="flex flex-col justify-center items-center gap-5">
        <UploadPhotoProfile />
        <h2 className="uppercase font-bold italic text-2xl">
          Edit your store information
        </h2>

        <StarShopCard className="p-10 w-full">
          <form className="flex w-4/5 flex-col gap-5 py-5">
            <Input
              label="Name"
              placeholder="Enter your store name"
              id="name"
              name="name"
              type="text"
              icon={Store}
              className=" border-b-4 border-primary-purple placeholder:text-white"
            />

            <Input
              label="Description"
              placeholder="Enter your store description"
              id="description"
              name="description"
              type="text"
              icon={NotebookText}
              className=" border-b-4 border-primary-purple placeholder:text-white"
            />

            <Input
              label="Location"
              placeholder="Enter your location"
              id="location"
              name="location"
              type="text"
              icon={MapPinned}
              className=" border-b-4 border-primary-purple placeholder:text-white"
            />
          </form>
        </StarShopCard>
      </section>
    </>
  );
};

export default SettingsComponent;
