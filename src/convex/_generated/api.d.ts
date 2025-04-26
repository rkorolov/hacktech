/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as appointments from "../appointments.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as forms from "../forms.js";
import type * as generators_createUsers from "../generators/createUsers.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as prescriptions from "../prescriptions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appointments: typeof appointments;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  forms: typeof forms;
  "generators/createUsers": typeof generators_createUsers;
  http: typeof http;
  messages: typeof messages;
  prescriptions: typeof prescriptions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
