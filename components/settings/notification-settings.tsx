"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import AutosaveToast from "@/components/autosave-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

const notificationFormSchema = z.object({
  postScheduleReminders: z.boolean(),
});

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const form = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      postScheduleReminders: true,
    },
  });

  async function onSubmit(values: z.infer<typeof notificationFormSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationOn: values.postScheduleReminders
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error("Failed to update preferences");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="postScheduleReminders"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Post Generation Notification</FormLabel>
                <FormDescription>
                  Get your schedule generated posts sent to your email.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </form>
    </Form>
    <AutosaveToast show={showToast} />
    </>
  );
}