"use client";

import React, { useState } from "react";
import type { Session } from "@acme/auth";
import Sidebar from "./sidebar";

export default function MainLayout({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Dọc bên trái */}
      <Sidebar
        session={session}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      {/* Container bên phải chứa Navbar + Children */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chúng ta sẽ render trực tiếp children, trong đó chứa Navbar và main content */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Pass states to Navbar or children if needed, 
            // or just render it since Navbar will be rendered inside layout.tsx
            return React.cloneElement(child, {
              // @ts-expect-error - dynamic props
              isCollapsed,
              setIsCollapsed,
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}
