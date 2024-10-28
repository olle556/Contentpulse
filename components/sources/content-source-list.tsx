"use client";

import { useEffect, useState } from "react";
import { ContentSource } from "@/types";

interface ContentSourceListProps {
  sources: ContentSource[];
}

export function ContentSourceList({ sources }: ContentSourceListProps) {
  if (sources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sources added yet. Add your first source to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sources.map((source) => (
        <div key={source.id} className="p-4 border rounded-lg">
          <div className="font-medium">{source.url}</div>
          <div className="text-sm text-gray-500">
            Category: {source.category} • Frequency: {source.crawlFrequency}
          </div>
        </div>
      ))}
    </div>
  );
}
