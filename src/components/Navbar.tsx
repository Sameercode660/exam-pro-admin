'use client'

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const adminName = "sdmin Name"; // Replace with dynamic admin name if needed

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logout clicked");
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 shadow-md pl-10 pr-10">
      {/* Website Name */}
      <div className="text-2xl font-bold text-gray-800">ExamPro</div>

      {/* Admin Info */}
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="/path-to-avatar.jpg" alt="Admin Avatar" />
              <AvatarFallback>{adminName.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="px-4 py-2 font-medium text-gray-800">{adminName}</div>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
