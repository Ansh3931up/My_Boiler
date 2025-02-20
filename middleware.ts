import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/*
CLERK DASHBOARD SETUP:

1. Go to Clerk Dashboard > Organizations > Roles & Permissions

2. Create the following roles:
   - org:super:admin  (Super Admin)
   - org:admin        (Organization Admin) 
   - org:sub:admin    (Sub Admin)
   - org:member       (Regular Member)

3. Set up permissions for each role:
   Super Admin:
   - Can manage all organization settings
   - Can create/manage other organizations
   - Full system access
   
   Organization Admin:
   - Can manage their org settings
   - Can manage members within their org
   - Can create sub-admins
   
   Sub Admin:
   - Can manage specific departments
   - Limited org management capabilities
   - Can manage regular members
   
   Member:
   - Basic access to org resources
   - Can view and edit their own profile
   - Access to member-specific features

4. Assign roles to users:
   - In Clerk Dashboard > Organizations
   - Select organization > Members
   - Click on member > Manage roles
   - Assign appropriate role
*/

// Define route patterns for different access levels
const publicRoutes = createRouteMatcher([
  '/',
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/webhook/register'
])

// Super admin routes - highest level access
const superAdminRoutes = createRouteMatcher([
  '/super-admin(.*)',    // Super admin dashboard and features
  '/system-settings(.*)'  // Global system settings
])

// Organization admin routes
const orgAdminRoutes = createRouteMatcher([
  '/org-admin(.*)',      // Org admin dashboard
  '/org/settings(.*)',   // Organization settings
  '/org/members(.*)'     // Member management
])

// Sub-admin routes within organizations
const subAdminRoutes = createRouteMatcher([
  '/sub-admin(.*)',           // Sub-admin dashboard
  '/department-settings(.*)' // Department specific settings
])

// Regular member routes
const memberRoutes = createRouteMatcher([
  '/dashboard(.*)',  // Basic dashboard
  '/profile(.*)',    // User profile
  '/tasks(.*)'       // Regular tasks and activities
])

export default clerkMiddleware(async (auth, req) => {
  try {
    const authObj = await auth();

    // Handle public routes first
    if (publicRoutes(req)) {
      // If user is authenticated, redirect to appropriate dashboard
      if (authObj.userId) {
        const isSuperAdmin = await authObj.has({ permission: 'org:super:admin' });
        const isOrgAdmin = await authObj.has({ permission: 'org:admin' });
        const isSubAdmin = await authObj.has({ permission: 'org:sub:admin' });

        let redirectUrl = '/dashboard';
        if (isSuperAdmin) redirectUrl = '/super-admin/dashboard';
        else if (isOrgAdmin) redirectUrl = '/org-admin/dashboard';
        else if (isSubAdmin) redirectUrl = '/sub-admin/dashboard';
        
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      return; // Allow access to public routes for non-authenticated users
    }

    // Require authentication for all non-public routes
    if (!authObj.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Check permissions for authenticated users
    const isSuperAdmin = await authObj.has({ permission: 'org:super:admin' });
    const isOrgAdmin = await authObj.has({ permission: 'org:admin' });
    const isSubAdmin = await authObj.has({ permission: 'org:sub:admin' });

    // Handle role-based route access
    if (superAdminRoutes(req) && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (orgAdminRoutes(req) && !isOrgAdmin && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (subAdminRoutes(req) && !isSubAdmin && !isOrgAdmin && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Allow access if all checks pass
    return;

  } catch (error) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}