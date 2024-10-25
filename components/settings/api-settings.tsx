"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RefreshCw, Copy } from "lucide-react";
import { useState } from "react";

const apiFormSchema = z.object({
  apiKey: z.string(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
});

export function ApiSettings() {
  const [apiKey] = useState("sk-..." + "•".repeat(32));

  const form = useForm<z.infer<typeof apiFormSchema>>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      apiKey: apiKey,
      webhookUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof apiFormSchema>) {
    console.log(values);
  }

  const regenerateApiKey = () => {
    // Implement API key regeneration logic
    console.log("Regenerating API key...");
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyApiKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={regenerateApiKey}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <FormDescription>
                Your API key for accessing the platform programmatically.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="webhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Webhook URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://your-domain.com/webhook"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                URL to receive notifications about events in your account.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save API Settings</Button>
      </form>
    </Form>
  );
}