"use client";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { AlignLeftIcon, DotIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Utility function to capitalize
const capitalizeUsername = (username: string | null | undefined) => {
    if (!username) return '';
    return username.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export default function Header({ title }: { title: string }) {
  const { user, isSignedIn } = useUser();
  const { has, isLoaded } = useAuth();
  const router = useRouter();
  
  // Add refs for the elements we want to animate
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    // GSAP animation with more dramatic effects
    const tl = gsap.timeline({ 
      defaults: { ease: "elastic.out(1, 0.3)" },  // Bouncy elastic effect
      delay: 1 // Longer initial delay
    });
    
    tl.fromTo(headerRef.current,
      { 
        y: -100, 
        opacity: 0,
        scale: 0.8,
        rotateX: -45
      },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        rotateX: 0,
        duration: 1.5 
      }
    )
    .fromTo(logoRef.current,
      { 
        x: -100, 
        opacity: 0,
        scale: 0.5,
        rotate: -15
      },
      { 
        x: 0, 
        opacity: 1, 
        scale: 1,
        rotate: 0,
        duration: 1.2 
      },
      "-=1"
    )
    .fromTo(profileRef.current,
      { 
        x: 100, 
        opacity: 0,
        scale: 0.5,
        rotate: 15
      },
      { 
        x: 0, 
        opacity: 1, 
        scale: 1,
        rotate: 0,
        duration: 1.2 
      },
      "-=1"
    );
  }, []);

  if (!isLoaded) {
    return <span>Loading...</span>;
  }

  const isAdmin = has({ permission: "org:app:admin" });

  return (
    <header className="w-full font-sans " ref={headerRef}>
      <div className="flex items-center p-4 md:py-5 rounded-md sm:rounded-xl bg-[#faff61] shadow-md w-full justify-between">
        
        <div className="flex sm:px-4 items-center gap-3 md:gap-6" ref={logoRef}>
          <AlignLeftIcon className="w-4 h-4 md:w-6 md:h-6 text-gray-500" />
          <p className="text-md font-medium md:text-3xl md:font-normal">{title}</p>
        </div>
        {/* this is the user button to display the user related or user specified functions  */}
        <div className="flex items-center gap-3" ref={profileRef}>
          {isSignedIn ? (
            <>
              <UserButton >
                {/* Menuitemswill be displayed here -e we can rearrange the order of the items */}
                <UserButton.MenuItems>
                  {isAdmin && (
                    <UserButton.Link
                      label="Create organization"
                      labelIcon={<DotIcon />}
                      href="/create-organization"
                    />
                  )}
                  <UserButton.Action label="manageAccount" />
                  <UserButton.Action label="signOut" />
                  <UserButton.Action
                    label="Permissions"
                    labelIcon={<DotIcon />}
                    open="Permissions"
                  />
                  <UserButton.Action
                    label="Open chat"
                    labelIcon={<DotIcon />}
                    onClick={() => alert("init chat")}
                  />
                </UserButton.MenuItems>

                {/* In the menu button when we will use the  */}
                <UserButton.UserProfilePage
                  label="Permissions"
                  labelIcon={<DotIcon />}
                  url="Permissions"
                >
                  <div>
                    <h1 className="text-2xl text-yellow-800">Permission</h1>
                    <p>This is the custom permission page</p>
                  </div>
                </UserButton.UserProfilePage>
              </UserButton >
              <p className="text-xs md:text-lg md:font-normal">{capitalizeUsername(user?.username)}'s Profile</p>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push('/sign-in')}>
                  Sign In
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/sign-up')}>
                  Sign Up
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
