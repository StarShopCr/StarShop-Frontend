import { ArrowLeft } from "lucide-react";
import StarShopLanding from "../../../public/starshop-logos/StarShop-Logo-Landing.svg";
import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
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
      <h1 className="text-4xl dark:text-white text-black">Oops! Page not found.</h1>
      <p className="dark:text-white text-black">Sorry, we couldn’t find the page you’re looking for.</p>
      <div className="mt-10  px-8 md:px-0">
        <Link
          href="/"
          aria-label="Back to Home"
          className=" border dark:border-white dark:text-white text-black border-black rounded-full px-6 py-2 cursor-pointer hover:border-gray-600 hover:text-gray-300"
        >
          <ArrowLeft className="inline w-4" /> Back to home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
