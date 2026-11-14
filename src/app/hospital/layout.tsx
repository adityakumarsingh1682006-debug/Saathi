import React from "react";
import { HospitalSidebar } from "@/components/layout/hospital-sidebar";

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#19302F] flex flex-col lg:flex-row font-sans">
      <HospitalSidebar />
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
