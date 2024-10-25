"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { ContentSource } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { EditSourceDialog } from "./edit-source-dialog";
import { DeleteSourceDialog } from "./delete-source-dialog";

export function ContentSourceList() {
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [editingSource, setEditingSource] = useState<ContentSource | null>(null);
  const [deletingSource, setDeletingSource] = useState<ContentSource | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("content_sources")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setSources(data as ContentSource[]);
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Last Crawled</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="font-medium">{source.url}</TableCell>
                <TableCell>{source.category}</TableCell>
                <TableCell>
                  {source.lastCrawled
                    ? formatDistanceToNow(new Date(source.lastCrawled), {
                        addSuffix: true,
                      })
                    : "Never"}
                </TableCell>
                <TableCell>{source.crawlFrequency}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingSource(source)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingSource(source)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditSourceDialog
        source={editingSource}
        open={!!editingSource}
        onOpenChange={(open) => !open && setEditingSource(null)}
        onSuccess={fetchSources}
      />

      <DeleteSourceDialog
        source={deletingSource}
        open={!!deletingSource}
        onOpenChange={(open) => !open && setDeletingSource(null)}
        onSuccess={fetchSources}
      />
    </>
  );
}