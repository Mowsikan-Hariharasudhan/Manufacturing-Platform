import { Bell, Settings, User, LogIn, UserPlus, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="relative border-b bg-card p-0 flex-shrink-0 z-50">
      {/* Left side: Menu toggle */}
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="h-10 w-10 hover:bg-primary/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Centered Logo Image */}
      <div className="flex justify-center items-center p-0">
        <Link to="/">
          <img 
            src="/logo.png" 
            alt="ManufactureFlow Logo" 
            className="h-18 w-60 p-0" 
          />
        </Link>
      </div>

      {/* Right side: User actions */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-4">
          {isAuthenticated ? (
            <>
              
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              
              <Button asChild>
                <Link to="/auth/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username || user?.firstName + ' ' + user?.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    My Reports
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Authentication</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/auth/login" className="cursor-pointer">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth/register" className="cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { /* intentionally left blank - use Login page */ }}>
                    <User className="mr-2 h-4 w-4" />
                    Demo Login
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;