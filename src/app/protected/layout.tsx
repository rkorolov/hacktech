"use client";

import type { MenuItem } from "@/components/protected/Sidebar";
import Sidebar from "@/components/protected/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, FileText, Home, Users, MessageSquare, PillIcon, Calendar, Pill } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ROLES } from "@/convex/schema";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { isLoading, isAuthenticated, user } = useAuth();
  const needsRoleSelection = useQuery(api.users.needsRoleSelection);

  const router = useRouter();
  const pathname = usePathname();

  // Define role-specific menu items
  const patientMenuItems: MenuItem[] = [
    { label: "Dashboard", href: "/protected/", section: "Main" },
    { label: "Health Forms", href: "/protected/forms", section: "Healthcare", icon: "file-text" },
    { label: "Appointments", href: "/protected/appointments", section: "Healthcare", icon: "calendar" },
    { label: "Prescriptions", href: "/protected/prescriptions", section: "Healthcare", icon: "pill" },
    { label: "Messages", href: "/protected/messages", section: "Communication", icon: "message-square" },
    { label: "Home Page", href: "/", section: "Navigation" },
    { label: "Support", href: "https://vly.ai", section: "Support" },
    { label: 'Discord', href: 'https://discord.gg/2gSmB9DxJW', section: 'Support' }
  ];

  const caregiverMenuItems: MenuItem[] = [
    { label: "Dashboard", href: "/protected/", section: "Main" },
    { label: "Patients", href: "/protected/patients", section: "Healthcare", icon: "users" },
    { label: "Appointments", href: "/protected/appointments", section: "Healthcare", icon: "calendar" },
    { label: "Prescriptions", href: "/protected/prescriptions", section: "Healthcare", icon: "pill" },
    { label: "Messages", href: "/protected/messages", section: "Communication", icon: "message-square" },
    { label: "Home Page", href: "/", section: "Navigation" },
    { label: "Support", href: "https://vly.ai", section: "Support" },
    { label: 'Discord', href: 'https://discord.gg/2gSmB9DxJW', section: 'Support' }
  ];

  // Select menu items based on user role
  const menuItems = user?.role === ROLES.CAREGIVER ? caregiverMenuItems : patientMenuItems;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && needsRoleSelection === true && 
        pathname !== '/protected/set-role') {
      router.push('/protected/set-role');
    }
  }, [isLoading, isAuthenticated, needsRoleSelection, pathname, router]);

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
        <Sidebar menuItems={menuItems} userEmail={user?.email} userName={user?.name}>
          {children}
        </Sidebar>
      </Authenticated>
    </>
  );
}