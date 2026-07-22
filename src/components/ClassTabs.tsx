"use client";

import React from "react";
import { PortfolioCalculado } from "@/lib/calculator";


import { SidebarNav } from "@/components/SidebarNav";

interface ClassTabsProps {
  readonly activeTab: string;
  readonly onChangeTab: (tabKey: string) => void;
  readonly portfolio?: PortfolioCalculado | null;
}

export function ClassTabs(props: ClassTabsProps) {
  return <SidebarNav {...props} />;
}
