"use client"
import { BookCheck, GraduationCap, Tv } from "lucide-react"

import UserMenu from "@/components/navbar-components/user-menu"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SessionProvider } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Navigation links array
const navigationLinks = [
  { href: "/", label: "Certificates", icon: GraduationCap },
  { href: "/video-upload", label: "Video Upload", icon: Tv },
  {
    href: "/#", label: "Course Management", icon: BookCheck,
    children: [
      { href: "/category", label: "Category", icon: BookCheck, description: "Manage categories" },
      { href: "/course", label: "Course", icon: BookCheck, description: "Manage courses" },
      { href: "/module", label: "Module", icon: BookCheck, description: "Manage modules" },
      { href: "/lesson", label: "Lesson", icon: BookCheck, description: "Manage lessons" },
    ]
  },
]

export default function Component() {
  const pathname = usePathname()


  return (
    <header className="fixed z-50 top-0 inset-x-0 border-b bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-transparent backdrop-blur-sm px-4 md:px-6 shadow-lg shadow-purple-500/10">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button className="group size-8 md:hidden" variant="ghost" size="icon">
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]" />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45" />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]" />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    return (
                      link.children ?
                        <NavigationMenuItem key={index} >
                          <NavigationMenuTrigger className={`flex-row bg-transparent items-center gap-2 py-2 px-4 font-medium rounded-lg transition-all duration-200 ${isActive
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                            : "text-foreground hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 "
                            }`} >
                            <Icon size={16} className={isActive ? "text-white" : "text-muted-foreground/80"} aria-hidden="true" />
                            <span className={`font-medium ${isActive ? "text-white" : ""}`}>{link.label}</span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid gap-2 p-4 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                              {link.children.map((component, i) => {
                                const ChildIcon = component.icon
                                const isChildActive = pathname === component.href
                                return (
                                  <li key={`menu-${i}`}>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        href={component.href}
                                        className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors ${isChildActive
                                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                                          : "hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                          }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <ChildIcon size={14} className={isChildActive ? "text-white" : "text-muted-foreground"} />
                                          <div className={`text-sm font-medium leading-none ${isChildActive ? "text-white" : ""}`}>
                                            {component.label}
                                          </div>
                                        </div>
                                        <p className={`line-clamp-2 text-sm leading-snug ${isChildActive ? "text-white/90" : "text-muted-foreground"}`}>
                                          {component.description}
                                        </p>
                                      </Link>
                                    </NavigationMenuLink>
                                  </li>
                                )
                              })}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem> :
                        < NavigationMenuItem key={index} >
                          <NavigationMenuLink
                            active={isActive}
                            href={link.href}
                            className={`flex-row items-center gap-2 py-2 px-4 font-medium rounded-lg transition-all duration-200 ${isActive
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                              : "text-foreground hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 "
                              }`}>
                            <Icon size={16} className={isActive ? "text-white" : "text-muted-foreground/80"} aria-hidden="true" />
                            <span className={isActive ? "text-white" : ""}>{link.label}</span>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>

          <NavigationMenu className="max-md:hidden">
            <NavigationMenuList className="gap-2">
              {navigationLinks.map((link, index) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  link.children ?
                    <NavigationMenuItem key={index} >
                      <NavigationMenuTrigger className={`flex-row bg-transparent items-center gap-2 py-2 px-4 font-medium rounded-lg transition-all duration-200 ${isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                        : "text-foreground hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 "
                        }`} >
                        <Icon size={16} className={isActive ? "text-white" : "text-muted-foreground/80"} aria-hidden="true" />
                        <span className={`font-medium ${isActive ? "text-white" : ""}`}>{link.label}</span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {link.children.map((component, i) => {
                            const ChildIcon = component.icon
                            const isChildActive = pathname === component.href
                            return (
                              <li key={`menu-${i}`}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={component.href}
                                    className={`${isChildActive
                                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                                      : "text-foreground hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 "
                                      }`} >
                                    <div className="flex items-center gap-2">
                                      <ChildIcon size={14} className={isChildActive ? "text-white" : "text-muted-foreground/80"} />
                                      <div className={`text-sm font-medium leading-none ${isChildActive ? "text-white" : ""}`}>
                                        {component.label}
                                      </div>
                                    </div>
                                    <p className={`line-clamp-2 text-sm leading-snug ${isChildActive ? "text-white" : "text-muted-foreground"}`}>
                                      {component.description}
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            )
                          })}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem> :
                    < NavigationMenuItem key={index} >
                      <NavigationMenuLink
                        active={isActive}
                        href={link.href}
                        className={`flex-row items-center gap-2 py-2 px-4 font-medium rounded-lg transition-all duration-200 ${isActive
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                          : "text-foreground hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 "
                          }`}>
                        <Icon size={16} className={isActive ? "text-white" : "text-muted-foreground/80"} aria-hidden="true" />
                        <span className={isActive ? "text-white" : ""}>{link.label}</span>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>


        {/* Right side: Actions */}
        <div className="flex flex-1 items-center justify-end gap-4">
          {/* User menu */}
          <SessionProvider>
            <UserMenu />
          </SessionProvider>
        </div>
      </div>
    </header >
  );
}
