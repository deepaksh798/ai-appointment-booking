"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/_utils/cookies";
import NavBar from "../NavBar/NavBar";

interface Props {
  children: ReactNode;
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    console.log("token", token);

    const isLoginPage = pathname === "/login";

    if (token) {
      setIsAuthenticated(true);

      // Redirect authenticated users away from login or root to dashboard
      if (isLoginPage || pathname === "/") {
        router.push("/home");
      }
    } else {
      setIsAuthenticated(false);

      // Only redirect to login if the user is NOT already on the login page
      if (!isLoginPage) {
        router.push("/login");
      }
    }

    setIsLoading(false);
  }, [pathname, router]);

  // Show a loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-screen">
        <span className="auth-loader"></span>
        <p className="text-xl">Checking authentication</p>
      </div>
    );
  }

  // After isLoading check

  if (isAuthenticated) {
    return (
      <>
        <NavBar />
        <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </>
    );
  }

  // Allow unauthenticated users to access /login
  if (!isAuthenticated && pathname === "/login") {
    return <>{children}</>;
  }

  // Otherwise (e.g., trying to access /dashboard unauthenticated), render nothing
  return null;
};

export default AuthProvider;
