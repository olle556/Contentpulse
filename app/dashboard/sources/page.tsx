"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSourceList } from "@/components/sources/content-source-list";
import { AddSourceDialog } from "@/components/sources/add-source-dialog";
import { ContentSource } from "@/types";

export default function SourcesPage() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Sources</h1>
        <Button onClick={() => setIsAddSourceOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <ContentSourceList />
      <AddSourceDialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen} />
    </div>
  );
}