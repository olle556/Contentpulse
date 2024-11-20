"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const contactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(5, "Message must be at least 5 characters"),
    isFeedback: z.boolean(),
});

interface ContactFormProps {
    defaultTab: 'feedback' | 'question';
}

export function ContactForm({ defaultTab }: ContactFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof contactFormSchema>>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
            isFeedback: defaultTab === 'feedback',
        },
    });

    async function onSubmit(values: z.infer<typeof contactFormSchema>) {
        setIsLoading(true);
        try {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const response = await fetch(`${baseUrl}/api/formMail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    message: values.message,
                    swicthValue: values.isFeedback ? 'Feedback' : 'Question'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            form.reset();
            toast.success("Message sent successfully");
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error("Failed to send message");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormDescription className="max-w-[50%]">
                        {form.watch("isFeedback")
                            ? "We love your feedback! Please share your thoughts about Content Pulse! Are there any features you would like to see? Or, do you have any suggestions for improvements?"
                            : "Have a question? We're here to help! Write your question below and we will get back to you as soon as possible."}
                    </FormDescription>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your name" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="your.email@example.com" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {form.watch("isFeedback") ? "Feedback" : "Question"}
                                </FormLabel>

                                <FormControl>
                                    <Textarea
                                        placeholder={form.watch("isFeedback")
                                            ? "Your feedback..."
                                            : "Your question..."}
                                        className="min-h-[150px]"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading 
                        ? "Sending..." 
                        : form.watch("isFeedback") 
                            ? "Send Feedback" 
                            : "Send Question"}
                </Button>
            </form>
        </Form>
    );
}
