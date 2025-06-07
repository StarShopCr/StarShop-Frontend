"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { retrieveSecureJWT } from "@/utils/encryptJWT";

interface NavigationGuardProps {
  children: React.ReactNode;
}

const publicPaths = ["/auth/login", "/", "/register", "/auth/register", "/unauthorized"];

export default function NavigationGuard({ children }: NavigationGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const validateAuthentication = async () => {
      if (!isAuthenticated) {
        const token = await retrieveSecureJWT();
        if (
          !token &&
          !publicPaths.includes(pathname) &&
          !pathname.startsWith("/_next")
        ) {
          router.push("/auth/login");
        }
      }
      setIsChecking(false);
    };

    validateAuthentication();
  }, [isAuthenticated, pathname, router]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
