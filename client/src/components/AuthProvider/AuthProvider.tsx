"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken, removeToken } from "@/_utils/cookies";
import NavBar from "../NavBar/NavBar";

// import Navbar from "./NavBar";

interface Props {
  children: ReactNode;
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false); // Initially set to null to represent loading state
  const token = getToken();
  //   removeToken();
  const pathname = usePathname();
  console.log("token", token);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      if (pathname?.includes("/login") || pathname === "/") {
        router.push("/home");
      }
    } else {
      setIsAuthenticated(false);
      router.push("/login");
    }
  }, [token, pathname, router]);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <div>
      {isAuthenticated ? (
        <>
          <NavBar />

          <div className="h-auto bg-gradient-to-br from-blue-50 to-indigo-100">
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
};

export default AuthProvider;
