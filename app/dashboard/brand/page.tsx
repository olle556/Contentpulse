'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Split steps into basic and advanced
const basicFields = [
  { name: 'brandName', label: 'Brand Name', type: 'text' },
  { 
    name: 'brandType', 
    label: 'Brand Type', 
    type: 'select',
    options: ['Manufacturing Company', 'Service Company', 'Influencer', 'Personal Brand', 'Non-profit', 'Other']
  },
  { name: 'industry', label: 'Industry/Market Sector', type: 'text' },
  { name: 'language', label: 'Language', type: 'text' }, // New field
  { name: 'website', label: 'Website URL', type: 'url' },
  { 
    name: 'brandVoice', 
    label: 'Brand Voice', 
    type: 'select',
    options: ['Professional', 'Casual', 'Friendly', 'Playful', 'Luxurious', 'Motivational','Caring', 'Other']
  },
  { name: 'usp', label: 'Unique Selling Proposition', type: 'textarea' },
]

const advancedSteps = [
  {
    id: 'brand-fundamentals',
    name: 'Brand Fundamentals',
    fields: [
      { name: 'missionStatement', label: 'Mission Statement', type: 'textarea' },
      { name: 'slogans', label: 'Existing Slogan(s)', type: 'textarea' },
    ]
  },
  {
    id: 'target-audience',
    name: 'Target Audience',
    fields: [
      { name: 'demographics', label: 'Demographics (age, gender, location, income level)', type: 'textarea' },
      { name: 'psychographics', label: 'Psychographics (interests, lifestyle, values)', type: 'textarea' },
    ]
  },
  {
    id: 'business-details',
    name: 'Business Details',
    fields: [
      { name: 'productsServices', label: 'Products/Services Offered', type: 'textarea' },
    ]
  },
  {
    id: 'content-preferences',
    name: 'Content Preferences',
    fields: [
      { name: 'contentThemes', label: 'Content Themes to Focus On', type: 'textarea' },
      { name: 'successfulPosts', label: 'Successful Past Posts', type: 'textarea' },
      { name: 'competitorContent', label: 'Competitor Content that Resonates with your Brand', type: 'textarea' },
    ]
  },
  {
    id: 'marketing-goals',
    name: 'Marketing Goals',
    fields: [
      { 
        name: 'primaryObjectives', 
        label: 'Primary Objectives', 
        type: 'select',
        options: ['Brand Awareness', 'Lead Generation', 'Sales', 'Customer Retention', 'Other']
      },
      { name: 'callToActions', label: 'Desired Call-to-Actions', type: 'textarea' },
    ]
  },
  {
    id: 'additional-context',
    name: 'Additional Context',
    fields: [
      { name: 'upcomingEvents', label: 'Upcoming Events/Launches', type: 'textarea' },
      { name: 'testimonials', label: 'Customer Testimonials/Success Stories', type: 'textarea' },
      { name: 'brandStory', label: 'Brand Story/History', type: 'textarea' },
      { name: 'hashtagPreferences', label: 'Hashtag Preferences', type: 'textarea' },
    ]
  }
]

const formSchema = z.object({
  brandName: z.string(),
  brandType: z.string(),
  industry: z.string(),
  locations: z.string(),
  website: z.string(),
  missionStatement: z.string(),
  brandVoice: z.string(),
  slogans: z.string(),
  // Target Audience
  demographics: z.string(),
  psychographics: z.string(),
  usp: z.string(),
  currentPromotions: z.string(),
  // Content Preferences
  contentThemes: z.string(),
  successfulPosts: z.string(),
  competitorContent: z.string(),
  // Marketing Goals
  primaryObjectives: z.string(),
  callToActions: z.string(),
  // Additional Context
  upcomingEvents: z.string(),
  testimonials: z.string(),
  brandStory: z.string(),
  hashtagPreferences: z.string(),
})

export default function BrandInformationPage() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: '',
      brandType: '',
      industry: '',
      locations: '',
      website: '',
      missionStatement: '',
      brandVoice: '',
      slogans: '',
      // Target Audience
      demographics: '',
      psychographics: '',
      usp: '',
      currentPromotions: '',
      // Content Preferences
      contentThemes: '',
      successfulPosts: '',
      competitorContent: '',
      // Marketing Goals
      primaryObjectives: '',
      callToActions: '',
      // Additional Context
      upcomingEvents: '',
      testimonials: '',
      brandStory: '',     
      hashtagPreferences: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values)
    // Handle form submission
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Basic Brand Identity</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {basicFields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as any}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        {field.type === 'select' ? (
                          <Select
                            onValueChange={formField.onChange}
                            defaultValue={formField.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option.toLowerCase()}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === 'textarea' ? (
                          <Textarea {...formField} />
                        ) : (
                          <Input {...formField} type={field.type} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Advanced Brand Settings</h2>
            <div className="flex gap-2">
              {showAdvanced && (
                <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Submit</Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide' : 'Edit'}
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {advancedSteps.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <h3 className="text-xl font-semibold">{section.name}</h3>
                    {section.fields.map((field) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name as any}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                              {field.type === 'select' ? (
                                <Select
                                  onValueChange={formField.onChange}
                                  defaultValue={formField.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem key={option} value={option.toLowerCase()}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === 'textarea' ? (
                                <Textarea {...formField} />
                              ) : (
                                <Input {...formField} type={field.type} />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <Button type="submit" onClick={form.handleSubmit(onSubmit)}>Submit</Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
