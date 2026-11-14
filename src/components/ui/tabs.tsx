"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const current = value !== undefined ? value : internalValue;
  const change = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: current, onValueChange: change }}>
      <div className={cn("w-full flex flex-col gap-4", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-start rounded-xl bg-[#E6F3EF]/80 p-1 border border-[#7BAE9D]/30 text-[#667A78] gap-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const isSelected = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all select-none cursor-pointer",
        isSelected
          ? "bg-white text-[#176B67] shadow-xs border border-[#7BAE9D]/35 font-semibold"
          : "text-[#667A78] hover:text-[#19302F] hover:bg-white/50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context || context.value !== value) return null;

  return (
    <div className={cn("mt-1 outline-none", className)}>
      {children}
    </div>
  );
}
