import createMiddleware from 'next-intl/middleware';
import { authMiddleware } from "@clerk/nextjs";
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'id', 'es', 'zh'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|id|es|zh)/:path*']
};
