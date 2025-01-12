"use client";

import { Search, Filter, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { Status } from "@/types/task";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: Status[]) => void;
  onTasksChange: () => void;
}

const getStatusDisplay = (status: Status): string => {
  switch (status) {
    case Status.TODO:
      return "To Do";
    case Status.IN_PROGRESS:
      return "In Progress";
    case Status.DONE:
      return "Done";
    default:
      return status;
  }
};

export default function Header({ onSearch, onFilterChange, onTasksChange }: HeaderProps) {
  const [selectedFilters, setSelectedFilters] = useState<Status[]>([]);

  const handleFilterChange = (filter: Status) => {
    const newFilters = selectedFilters.includes(filter) ? selectedFilters.filter((f) => f !== filter) : [...selectedFilters, filter];
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const statusValues = Object.values(Status) as Status[];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Title - Visible on all screens */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-todoist-red">Kanban Board</h1>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <Input placeholder="Search tasks..." className="w-full" onChange={(e) => onSearch(e.target.value)} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {statusValues.map((status) => (
                      <DropdownMenuCheckboxItem key={status} checked={selectedFilters.includes(status)} onCheckedChange={() => handleFilterChange(status)}>
                        {getStatusDisplay(status)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <CreateTaskDialog onTaskCreated={onTasksChange} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input placeholder="Search tasks..." className="pl-8" onChange={(e) => onSearch(e.target.value)} />
            </div>

            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {statusValues.map((status) => (
                  <DropdownMenuCheckboxItem key={status} checked={selectedFilters.includes(status)} onCheckedChange={() => handleFilterChange(status)}>
                    {getStatusDisplay(status)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Task Button */}
            <CreateTaskDialog onTaskCreated={onTasksChange} />
          </div>
        </div>
      </div>
    </header>
  );
}
