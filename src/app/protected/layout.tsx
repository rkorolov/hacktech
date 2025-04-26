"use client";

import type { MenuItem } from "@/components/protected/Sidebar";
import Sidebar from "@/components/protected/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Loader2, Home, ClipboardList, Users, FileText, Settings } from "lucide-react";
import { ROLES } from "@/convex/schema";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { isLoading, isAuthenticated, user } = useAuth();

  // Create role-specific menu items
  const protectedMenuItems: MenuItem[] = useMemo(() => {
    // Common menu items for all users
    const commonItems: MenuItem[] = [
      { label: "Dashboard", href: "/protected/", icon: Home, section: "Main" },
    ];

    // Patient-specific menu items
    const patientItems: MenuItem[] = [
      { label: "Submit Information", href: "/protected/patient", icon: ClipboardList, section: "Patient" },
    ];

    // Caregiver-specific menu items
    const caregiverItems: MenuItem[] = [
      { label: "Patient List", href: "/protected/caregiver", icon: Users, section: "Caregiver" },
      { label: "Review Forms", href: "/protected/caregiver/forms", icon: FileText, section: "Caregiver" },
    ];

    // External links
    const externalItems: MenuItem[] = [
      { label: "Home Page", href: "/", section: "Links" },
      { label: "Learn More", href: "https://vly.ai", section: "crack.diy" },
      { label: 'Discord', href: 'https://discord.gg/2gSmB9DxJW', section: 'crack.diy' }
    ];

    // Return appropriate menu items based on user role
    if (user?.role === ROLES.PATIENT) {
      return [...commonItems, ...patientItems, ...externalItems];
    } else if (user?.role === ROLES.CAREGIVER) {
      return [...commonItems, ...caregiverItems, ...externalItems];
    }

    // Default menu items if role not set
    return [
      ...commonItems,
      { label: "Set Role", href: "/protected/set-role", icon: Settings, section: "Setup" },
      ...externalItems
    ];
  }, [user]);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  });

  // DO NOT TOUCH THIS SECTION. IT IS THE AUTHENTICATION LAYOUT.
  return (
    <>
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin " />
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin " />
        </div>
      </AuthLoading>
      <Authenticated>
        <Sidebar menuItems={protectedMenuItems} userEmail={user?.email} userName={user?.name}>
          {children}
        </Sidebar>
      </Authenticated>
    </>
  );
}