"use client";

import React from "react";
import UploadPhotoProfile from "@/components/ui/UploadPhotoProfile";
import Input from "@/components/ui/input";
import StarShopCard from "@/components/ui/StarShopCard";
import { User, Mail, MapPin } from "lucide-react";

const StepOneContent: React.FC = () => {
  return (
    <>
      <section className="flex flex-col justify-center items-center gap-5">
        <UploadPhotoProfile />
        <h2 className="uppercase font-bold italic text-2xl">
          Complete your profile information
        </h2>

        <StarShopCard className="p-10 w-full">
          <form className="flex w-4/5 flex-col gap-5 py-5">
            <Input
              label="Username"
              placeholder="Enter your username"
              id="username"
              name="username"
              type="text"
              icon={User}
              className=" border-b-4 border-primary-purple placeholder:text-white"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              id="email"
              name="email"
              type="email"
              icon={Mail}
              className=" border-b-4 border-primary-purple placeholder:text-white"
            />

            <Input
              label="Location"
              placeholder="Enter your location"
              id="location"
              name="location"
              type="text"
              icon={MapPin}
              className=" border-b-4 border-primary-purple placeholder:text-white"
            />
          </form>
        </StarShopCard>
      </section>
    </>
  );
};

export default StepOneContent;
