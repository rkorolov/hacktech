// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

// import { convexAuth } from "@convex-dev/auth/server";
// import { emailOtp } from "./auth/emailOtp";

// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//   providers: [emailOtp],
// });

import { convexAuth } from "@convex-dev/auth/server";
import { resendOTP } from "./auth/resendOTP";
 
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [resendOTP],
});
