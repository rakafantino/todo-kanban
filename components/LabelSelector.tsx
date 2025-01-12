"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X } from "lucide-react";

const availableLabels = ["feature", "bug", "enhancement", "documentation", "design", "ui", "backend", "frontend", "database", "auth", "testing", "setup"];

interface LabelSelectorProps {
  selectedLabels: string[];
  onChange: (labels: string[]) => void;
}

export function LabelSelector({ selectedLabels, onChange }: LabelSelectorProps) {
  const [open, setOpen] = useState(false);

  const addLabel = (label: string) => {
    if (!selectedLabels.includes(label)) {
      onChange([...selectedLabels, label]);
    }
    setOpen(false);
  };

  const removeLabel = (labelToRemove: string) => {
    onChange(selectedLabels.filter((label) => label !== labelToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedLabels.map((label) => (
          <Badge key={label} variant="secondary" className="flex items-center gap-1">
            {label}
            <button type="button" onClick={() => removeLabel(label)} className="hover:bg-slate-200 rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-start text-left font-normal">
            Add label
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search label..." />
            <CommandList>
              <CommandEmpty>No label found.</CommandEmpty>
              <CommandGroup heading="Available Labels">
                {availableLabels
                  .filter((label) => !selectedLabels.includes(label))
                  .map((label) => (
                    <CommandItem key={label} value={label} onSelect={() => addLabel(label)} className="cursor-pointer">
                      {label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
