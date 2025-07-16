'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const adminName = "admin Name";  

  const handleLogout = () => { 
    console.log("Logout clicked");
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 shadow-md pl-10 pr-10">
     
      <div className="text-2xl font-bold text-gray-800">ExamPro</div>

       
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
