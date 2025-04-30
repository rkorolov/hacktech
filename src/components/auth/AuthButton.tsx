"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthButtonProps {
  trigger?: React.ReactNode;
  dashboardTrigger?: React.ReactNode;
}

export function AuthButton({
  trigger,
  dashboardTrigger,
}: AuthButtonProps) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <Button disabled>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      </Button>
    );
  }

  if (isSignedIn) {
    return (
      <div>
        {dashboardTrigger ? (
          <div onClick={() => window.location.href = "/protected/set-role"}>
            {dashboardTrigger}
          </div>
        ) : (
          <Button>
            <Link href="/protected">Dashboard</Link>
          </Button>
        )}
      </div>
    );
  }

  // Unauthenticated (user not signed in)
  return (
    <div>
      {trigger ? (
        <div onClick={() => router.push("/sign-in")}>
          {trigger}
        </div>
      ) : (
        <Button onClick={() => router.push("/sign-in")}>
          Get Started
        </Button>
      )}
    </div>
  );
}

// 'use client';

// import { useUser } from "@clerk/clerk-react";
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
// import { AuthCard } from "./AuthCard";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Loader2 } from "lucide-react";

// interface AuthButtonProps {
//   trigger?: React.ReactNode;
//   dashboardTrigger?: React.ReactNode;
//   useModal?: boolean;
// }

// const UnauthenticatedButton = ({ useModal, trigger }: AuthButtonProps) => {
//   const [open, setOpen] = useState(false);
//   const [isRedirecting, setIsRedirecting] = useState(false);
//   const router = useRouter();

//   const handleOpenChange = (newOpen: boolean) => {
//     if (isRedirecting && !newOpen) {
//       return;
//     }
//     setOpen(newOpen);
//   };

//   const handleAuthSuccess = () => {
//     setIsRedirecting(true);
//   };

//   return (
//     <div>
//       {useModal ? (
//         <Dialog open={open} onOpenChange={handleOpenChange}>
//           <DialogTrigger asChild>
//             {trigger || <Button>Get Started</Button>}
//           </DialogTrigger>
//           <DialogContent className="bg-transparent border-none shadow-none">
//             <DialogTitle />
//             <AuthCard onAuthSuccess={handleAuthSuccess} />
//           </DialogContent>
//         </Dialog>
//       ) : (
//         trigger ? (
//           <div onClick={() => router.push('/auth')}>
//             {trigger}
//           </div>
//         ) : (
//           <Button onClick={() => router.push('/auth')}>
//             Get Started
//           </Button>
//         )
//       )}
//     </div>
//   );
// };

// export function AuthButton({
//   trigger,
//   dashboardTrigger,
//   useModal = true,
// }: AuthButtonProps) {
//   const { isSignedIn, isLoaded } = useUser();

//   // ADD this for debugging:
//   useEffect(() => {
//     console.log("AuthButton DEBUG:");
//     console.log("isLoaded:", isLoaded);
//     console.log("isSignedIn:", isSignedIn);
//   }, [isLoaded, isSignedIn]);

//   if (!isLoaded) {
//     return (
//       <Button disabled>
//         <div className="flex items-center gap-2">
//           <Loader2 className="h-4 w-4 animate-spin" />
//           Loading...
//         </div>
//       </Button>
//     );
//   }

//   if (isSignedIn) {
//     return (
//       <div>
//         {dashboardTrigger ? (
//           <div onClick={() => window.location.href = "/protected/set-role"}>
//             {dashboardTrigger}
//           </div>
//         ) : (
//           <Button>
//             <Link href="/protected">Dashboard</Link>
//           </Button>
//         )}
//       </div>
//     );
//   }

//   return (
//     <UnauthenticatedButton useModal={useModal} trigger={trigger} />
//   );
// }
