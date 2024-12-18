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
import AutosaveToast from '@/components/autosave-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useOnboarding } from '@/hooks/use-onboarding'
import { cache } from 'react'
import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoCircledIcon } from "@radix-ui/react-icons"

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
    options: [
      'Influencer',
      'Personal Brand',
      'Non-profit',
      'E-commerce',
      'Tech Startup',
      'Healthcare',
      'Education',
      'Media & Entertainment',
      'Finance',
      'Hospitality',
      'Food & Beverage',
      'Real Estate',
      'Consulting Firm',
      'Manufacturing Company',
      'Service Company',
      'Environmental Organization',
      'Government or Public Sector',
      'Transportation & Logistics',
      'Fashion & Apparel',
      'Other'
    ]
  },
  { name: 'industry', label: 'Industry/Market Sector', type: 'text' },
  { name: 'language', label: 'Language', type: 'text' }, // New field
  { name: 'website', label: 'Website URL', type: 'url' },
  { 
    name: 'brandVoice', 
    label: 'Brand Voice', 
    type: 'select',
    options: [ "Professional",
      "Casual",
      "Funny",
      "Creative",
      "Formal",
      "Inspirational",
      "Educational",
      "Empathetic",
      "Playful",
      "Persuasive",
      "Technical",
      "Neutral",
    ]
  },
  { name: 'description', label: 'Description', type: 'textarea' },
]

const advancedSteps = [
  {
    id: 'brand-fundamentals',
    name: 'Brand Fundamentals',
    fields: [
      { name: 'missionStatement', label: 'Mission Statement', type: 'textarea' },
      { name: 'slogans', label: 'Existing Slogans', type: 'textarea' },
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
  language: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  brandVoice: z.string().min(1, "Brand voice is required"),
  usp: z.string().optional().nullable(),
  missionStatement: z.string().optional().nullable(),
  slogans: z.string().optional().nullable(),
  demographics: z.string().optional().nullable(),
  psychographics: z.string().optional().nullable(),
  contentThemes: z.string().optional().nullable(),
  primaryObjectives: z.string().optional().nullable(),
  brandStory: z.string().optional().nullable(),
})

// Add this fetch wrapper with caching and revalidation
const getBrand = cache(async () => {
  try {
    const response = await fetch('/api/brand', {
      // Remove force-cache to allow revalidation
      next: {
        tags: ['brand'], // Add a cache tag
        revalidate: 0 // Set to 0 to opt out of cache
      }
    })
    if (!response.ok) throw new Error('Failed to fetch brand')
    return response.json()
  } catch (error) {
    console.error('Error fetching brand:', error)
    return null
  }
})

export default function BrandInformationPage() {
  const { markStepCompleted } = useOnboarding();
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [isFormModified, setIsFormModified] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: '',
      brandType: '',
      industry: '',
      language: '',
      website: '',
      brandVoice: '',
      usp: '',
      missionStatement: '',
      slogans: '',
      demographics: '',
      psychographics: '',
      contentThemes: '',
      primaryObjectives: '',
      brandStory: '',
    },
  })

  // Update the useEffect to use the cached fetch
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const brand = await getBrand()
        if (brand?.id) {
          localStorage.setItem('brandId', brand.id.toString())
          form.reset(brand)
        } else {
          // Fallback to localStorage if no brand in DB
          const savedData = localStorage.getItem('brandFormData')
          if (savedData) {
            const parsedData = JSON.parse(savedData)
            form.reset(parsedData)
          }
        }
      } catch (error) {
        console.error('Error fetching brand:', error)
        // Fallback to localStorage on error
        const savedData = localStorage.getItem('brandFormData')
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          form.reset(parsedData)
        }
      }
    }

    if (session?.user?.id) {
      fetchBrand()
    }
  }, [session?.user?.id, form])

  // Auto-save to localStorage
  const autoSaveToStorage = debounce((values: z.infer<typeof formSchema>) => {
    try {
      localStorage.setItem('brandFormData', JSON.stringify(values))
      console.log('Saved to localStorage:', values) // Debug log
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, 500) // Reduced from 1000ms

  // Auto-save to DB
  const autoSaveToDb = debounce(async (values: z.infer<typeof formSchema>) => {
    try {
      if (!session?.user?.id) return

      const brandId = localStorage.getItem('brandId')
      
      const response = await fetch('/api/brand/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          values, 
          brandId: brandId ? parseInt(brandId) : null 
        }),
      })

      if (response.ok) {
        if (isFormModified) {
          setShowSaveToast(true)
          setTimeout(() => {
            setShowSaveToast(false)
          }, 2000)
        }

        const data = await response.json()
        
        if (data.id) {
          localStorage.setItem('brandId', data.id.toString())
          
          // If we have the minimum required fields, mark the step as completed
          if (values.brandName && values.brandType && values.industry && values.brandVoice) {
            console.log('Marking brand step as completed after successful save');
            await markStepCompleted('brand');
          }
        }

        // Revalidate the cache after successful save
        await fetch('/api/revalidate?tag=brand')
      } else {
        console.error('Save failed:', await response.json())
      }

    } catch (error) {
      console.error('Failed to auto-save:', error)
      setShowSaveToast(false)
    }
  }, 1000) // Reduced from 2000ms

  // Watch form changes and trigger both saves
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Set form as modified whenever any change occurs
      if (!isFormModified) {
        setIsFormModified(true)
      }
      
      const formValues = form.getValues()
      
      // Save on any change, not just when all required fields are filled
      if (isFormModified) {
        // Save to localStorage immediately
        autoSaveToStorage(formValues)
        
        // For DB saves, still ensure we have at least one field with content
        if (Object.values(formValues).some(value => value && value.length > 0)) {
          autoSaveToDb(formValues)
        }
      }
    })
    
    return () => {
      subscription.unsubscribe()
      autoSaveToStorage.cancel()
      autoSaveToDb.cancel()
    }
  }, [form, session?.user?.id, isFormModified, autoSaveToDb, autoSaveToStorage])

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
      
      // Mark the brand step as completed
      await markStepCompleted('brand');
      
      // Redirect to brands page
      router.push('/dashboard/brands')
      
      setIsFormModified(false)
    } catch (error) {
      console.error('Failed to create brand:', error)
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="container mx-auto space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold">Basic Brand Identity</h2>
            </div>
            <p className="text-muted-foreground mb-6 text-center sm:text-left">
              Enter your brand information here. These details will help us understand your brand identity and create more relevant content for you.
            </p>
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
                              value={formField.value?.toLowerCase()}
                              defaultValue={formField.value?.toLowerCase()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem 
                                    key={option} 
                                    value={option.toLowerCase()}
                                  >
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
              <Button
                variant="outline"
                onClick={() => setDialogOpen(true)}
              >
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Brand Settings</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => {
                onSubmit(values)
                handleDialogClose()
              })} className="space-y-6">
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
                                  value={formField.value?.toLowerCase()}
                                  defaultValue={formField.value?.toLowerCase()}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem 
                                        key={option} 
                                        value={option.toLowerCase()}
                                      >
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
                  <Button type="submit">Done</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {mounted && <AutosaveToast show={showSaveToast} />}
    </>
  )
}
