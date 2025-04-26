"use client";

import type { MenuItem } from "@/components/protected/Sidebar";
import Sidebar from "@/components/protected/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ROLES } from "@/convex/schema";
import React from "react";

const SidebarProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();
  const pathname = usePathname();

  let protectedMenuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/protected/', icon: 'LayoutDashboard', section: 'Main' },
  ];

  if (user?.role === ROLES.PATIENT) {
    protectedMenuItems.push(
      { label: 'My Profile', href: '/protected/patient', icon: 'User', section: 'Patient' },
    );
  }

  if (user?.role === ROLES.CAREGIVER) {
    protectedMenuItems.push(
      { label: 'My Patients', href: '/protected/caregiver', icon: 'Users', section: 'Caregiver' },
    );
  }

  if (user?.role === ROLES.ADMIN) {
    protectedMenuItems.push(
      { label: 'Admin Panel', href: '/protected/admin', icon: 'ShieldCheck', section: 'Admin' },
    );
  }

  protectedMenuItems.push(
    { label: 'Account', href: '/protected/account', icon: 'CircleUser', section: 'User' },
    { label: 'Settings', href: '/protected/settings', icon: 'Settings', section: 'User' },
    { label: 'Support', href: '/protected/support', icon: 'LifeBuoy', section: 'Help' },
  );

  return (
    <SidebarProvider>
      <Sidebar
        menuItems={protectedMenuItems}
        currentPath={pathname}
        userEmail={user?.email ?? undefined}
        userName={user?.name ?? undefined}
      >
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">
          {children}
        </main>
      </Sidebar>
    </SidebarProvider>
  );
}