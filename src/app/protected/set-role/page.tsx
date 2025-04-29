"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { SetRoleForm } from "@/components/protected/SetRoleForm";
import { getAuthUserId } from "@convex-dev/auth/server";

export default function SetRolePage() {
  const router = useRouter();

  const ensureUser = useMutation(api.users.ensureUser);
  useEffect(() => {
    // fire-and-forget; once it’s created, your read queries will find it
    void ensureUser({});
  }, [ensureUser]);

  console.log(ensureUser)



  const needsRoleSelection = useQuery(api.users.needsRoleSelection);
  const user = useQuery(api.users.currentUser);

  // Only redirect once:
  //  a) needsRoleSelection === false  (user has a role),
  //  b) user query is done (not undefined), 
  //  c) user record actually exists (not null)
  useEffect(() => {
    if (
      needsRoleSelection === false &&
      user !== undefined &&
      user !== null
    ) {
      router.push("/protected");
    }
  }, [needsRoleSelection, user, router]); // <-- include `user` here!

  // Show spinner while either query is still loading
  if (needsRoleSelection === undefined || user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }



  

  // If we have a user but they don't need role selection, show brief notice
  if (needsRoleSelection === false && user !== null) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting to dashboard...</span>
      </div>
    );
  }

  // Otherwise render the form
  return (
    <div className="flex items-center justify-center min-h-screen container min-w-screen py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SetRoleForm />
        <p className="text-center text-muted-foreground mt-6 text-sm">
          You'll only need to set your role once. This helps us personalize your experience.
        </p>
      </motion.div>
    </div>
  );
}
