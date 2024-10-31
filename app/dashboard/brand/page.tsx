'use client'

import { useState, useEffect } from 'react'
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
import { useSession } from "next-auth/react"
import { prisma } from '@/lib/prisma'
import { Brand, Prisma } from '@prisma/client'
import { generateBrandEmbedding } from '@/utils/embeddings'
import debounce from 'lodash/debounce'
import { useRouter } from 'next/navigation'

// Define custom interfaces for your brand data
interface BrandInput {
  brandName: string
  brandType: string
  industry: string
  language?: string
  website?: string
  brandVoice: string
  usp?: string
  missionStatement?: string
  slogans?: string
  demographics?: string
  psychographics?: string
  contentThemes?: string
  primaryObjectives?: string
  brandStory?: string
  userId: string
}

interface BrandUpdateInput extends Partial<BrandInput> {
  embedding?: number[]
  updatedAt?: Date
}

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
  brandName: z.string().min(1, "Brand name is required"),
  brandType: z.string().min(1, "Brand type is required"),
  industry: z.string().min(1, "Industry is required"),
  brandVoice: z.string().min(1, "Brand voice is required"),
  language: z.string().optional(),
  website: z.string().optional(),
  usp: z.string().optional(),
  missionStatement: z.string().optional(),
  slogans: z.string().optional(),
  demographics: z.string().optional(),
  psychographics: z.string().optional(),
  contentThemes: z.string().optional(),
  primaryObjectives: z.string().optional(),
  brandStory: z.string().optional(),
  successfulPosts: z.string().optional(),
  competitorContent: z.string().optional(),
  callToActions: z.string().optional(),
  upcomingEvents: z.string().optional(),
  testimonials: z.string().optional(),
  hashtagPreferences: z.string().optional(),
})

export default function BrandInformationPage() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: '',
      brandType: '',
      industry: '',
      website: '',
      missionStatement: '',
      brandVoice: '',
      slogans: '',
      // Target Audience
      demographics: '',
      psychographics: '',
      usp: '',
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

  // Initialize form with saved data if it exists
  useEffect(() => {
    const savedData = localStorage.getItem('brandFormData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      form.reset(parsedData)
    }
  }, [])

  // Add a save status indicator
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

  // Auto-save to localStorage
  const autoSaveToStorage = debounce((values: z.infer<typeof formSchema>) => {
    localStorage.setItem('brandFormData', JSON.stringify(values))
  }, 1000) // Save after 1 second of inactivity

  // Auto-save to DB
  const autoSaveToDb = debounce(async (values: z.infer<typeof formSchema>) => {
    try {
      setSaveStatus('saving')
      if (!session?.user?.id) return

      const brandId = localStorage.getItem('brandId')
      
      const response = await fetch('/api/brand/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values, brandId }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      const data = await response.json()
      
      if (data.id) {
        localStorage.setItem('brandId', data.id)
      }
      
      setSaveStatus('saved')
    } catch (error) {
      setSaveStatus('error')
      console.error('Failed to auto-save:', error)
    }
  }, 2000) // Save to DB after 2 seconds of inactivity

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      autoSaveToStorage(values as z.infer<typeof formSchema>)
      autoSaveToDb(values as z.infer<typeof formSchema>)
    })
    
    return () => subscription.unsubscribe()
  }, [form.watch])

  // Final submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!session?.user?.id) {
        throw new Error("You must be logged in to create a brand")
      }

      // Generate embedding
      const embedding = await generateBrandEmbedding(values)
      
      const brandId = localStorage.getItem('brandId')
      
      const response = await fetch('/api/brand/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          values: {
            ...values,
            embedding,
          },
          brandId 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save brand')
      }
      
      // Clear localStorage
      localStorage.removeItem('brandFormData')
      localStorage.removeItem('brandId')
      
      // Redirect to brands page
      router.push('/dashboard/brands')
      
    } catch (error) {
      console.error('Failed to create brand:', error)
    }
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
      <div className="text-sm text-gray-500">
        {saveStatus === 'saving' && 'Saving...'}
        {saveStatus === 'saved' && 'All changes saved'}
        {saveStatus === 'error' && 'Error saving changes'}
      </div>
    </div>
  )
}
