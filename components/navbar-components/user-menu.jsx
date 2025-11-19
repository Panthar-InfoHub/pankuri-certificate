import {
  LogInIcon,
  LogOutIcon,
  User
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { signIn, signOut } from "next-auth/react";

export default function UserMenu({ user }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src={user?.image || "/origin/avatar.jpg"} alt="Profile image" />
            <AvatarFallback className="bg-brand-gradient text-white" > <User /> </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {user?.name || "User"}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user ?
          <DropdownMenuItem onClick={() => signIn("google", { callbackUrl: "/" })} className="cursor-pointer" >
            <LogInIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Login</span>
          </DropdownMenuItem>
          : (<DropdownMenuItem onClick={() => signOut({ redirectTo: "/login" })} className="cursor-pointer" >
            <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Logout</span>
          </DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
