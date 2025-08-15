"use client";

import { useEffect, useState } from "react";
import MobileMessage from "./Mobilemessage";

export default function DesktopOnly({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // Tailwind lg breakpoint
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  if (!isDesktop) return <MobileMessage />;
  return <>{children}</>;
}
