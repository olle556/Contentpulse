"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { ContentSchedule } from "@/types";

const formSchema = z.object({
  contentSourceId: z.string(),
  tonality: z.string(),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  isRecurring: z.boolean(),
  recurringDays: z.array(z.string()),
  startDate: z.date().optional(),
  date: z.date().optional(),
  time: z.string(),
  aiInstructions: z.string().optional(),
  useEmojis: z.boolean().default(false),
})

type ContentSchedulerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentSources: Array<{ id: string; url: string; category: string }>
  editSchedule?: ContentSchedule | null
  onScheduleUpdate?: () => void
}

const tonalities = [
  "Professional",
  "Casual",
  "Funny",
  "Creative",
  "Formal"
]
const platforms = ["X", "LinkedIn", "Threads", "Facebook"]

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function ContentScheduler({ open, onOpenChange, contentSources, editSchedule, onScheduleUpdate }: ContentSchedulerProps) {
  const { data: session } = useSession()
  const [isRecurring, setIsRecurring] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentSourceId: "",
      tonality: "",
      platforms: [],
      isRecurring: false,
      recurringDays: [],
      time: "",
      aiInstructions: "",
      useEmojis: false,
    },
  })

  useEffect(() => {
    if (editSchedule) {
      setIsRecurring(editSchedule.isRecurring);
      form.reset({
        contentSourceId: editSchedule.contentSourceId,
        tonality: editSchedule.tonality,
        platforms: editSchedule.platforms,
        isRecurring: editSchedule.isRecurring,
        recurringDays: editSchedule.recurringDays,
        startDate: editSchedule.startDate ? new Date(editSchedule.startDate) : undefined,
        date: editSchedule.date ? new Date(editSchedule.date) : undefined,
        time: editSchedule.time,
        aiInstructions: editSchedule.aiInstructions || "",
        useEmojis: editSchedule.useEmojis || false,
      });
    }
  }, [editSchedule, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const [hours, minutes] = values.time.split(':').map(Number);
      const dateToUse = values.isRecurring ? values.startDate : values.date;
      
      // Create a Date object with the user's local time
      const localDate = new Date();
      localDate.setHours(hours, minutes, 0, 0);
      
      // Convert to UTC time only for database storage
      const dbTime = `${localDate.getUTCHours().toString().padStart(2, '0')}:${localDate.getUTCMinutes().toString().padStart(2, '0')}`;

      // Send UTC time to database while keeping the display time unchanged
      const dataToSend = {
        ...values,
        time: dbTime
      };

      const url = editSchedule
        ? `/api/schedule/${editSchedule.id}`
        : '/api/schedule';

      const method = editSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule content');
      }

      onScheduleUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error scheduling content:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {editSchedule ? 'Edit Schedule' : 'Schedule Content Generation'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="contentSourceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a content source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contentSources.map((source) => (
                        <SelectItem
                          key={source.id}
                          value={source.id}
                          className="flex flex-col items-start py-2"
                        >
                          <div className="max-w-[500px] break-all">
                            {source.url}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {source.category}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tonality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tonality</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tonality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tonalities.map((tone) => (
                        <SelectItem key={tone} value={tone.toLowerCase()}>
                          {tone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platforms"
              render={() => (
                <FormItem>
                  <FormLabel>Platforms</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {platforms.map((platform) => (
                      <FormField
                        key={platform}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={platform}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(platform)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, platform])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== platform
                                        )
                                      )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {platform}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recurring Post</FormLabel>
                    <FormDescription>
                      Enable if you want to schedule recurring posts
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        setIsRecurring(checked)
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isRecurring && (
              <FormField
                control={form.control}
                name="recurringDays"
                render={() => (
                  <FormItem>
                    <FormLabel>Posting Days</FormLabel>
                    <div className="flex flex-wrap gap-4">
                      {daysOfWeek.map((day) => (
                        <FormField
                          key={day}
                          control={form.control}
                          name="recurringDays"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day])
                                        : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day
                                          )
                                        )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {day}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name={isRecurring ? "startDate" : "date"}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{isRecurring ? "Start Date" : "Date"}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        type="time"
                        {...field}
                        className="w-[240px]"
                      />
                      <Clock className="ml-2 h-4 w-4 opacity-50" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useEmojis"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include emojis in the generated posts</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Instructions (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Add specific instructions for how the AI should generate posts..."
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editSchedule ? "Submit Changes" : "Schedule Content Generation"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}