import { ArrowLeft } from "lucide-react";
import StarShopLanding from "../../../public/starshop-logos/StarShop-Logo-Landing.svg";
import Link from "next/link";
import Image from "next/image";

const Unauthorized = () => {
  return (
    <main className="flex flex-col gap-4 text-center px-3 md:px-0">
      <div className="flex flex-col justify-center items-center">
        <Image
          src={StarShopLanding}
          alt="StarShop Logo"
          width={200}
          height={100}
        />
      </div>
      <h1 className="text-4xl">Access Denied</h1>
      <p>Sorry, you don’t have permission to access this page.</p>
      <div className="mt-10 px-8 md:px-0">
        <Link
          href="/auth/login"
          aria-label="Go to Login"
          className="border border-white rounded-full px-6 py-2 cursor-pointer hover:border-gray-600 hover:text-gray-300"
        >
          <ArrowLeft className="inline w-4" /> Go to Login
        </Link>
      </div>
    </main>
  );
};

export default Unauthorized;