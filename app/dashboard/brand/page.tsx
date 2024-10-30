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
    options: ['Company', 'Influencer', 'Personal Brand', 'Non-profit', 'Other']
  },
  { name: 'industry', label: 'Industry/Market Sector', type: 'text' },
  { name: 'language', label: 'Language', type: 'text' }, // New field
  { name: 'website', label: 'Website URL', type: 'url' },
  { 
    name: 'brandVoice', 
    label: 'Brand Voice', 
    type: 'select',
    options: ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Playful']
  },
  { name: 'usp', label: 'Unique Selling Proposition', type: 'textarea' },
]

const advancedSteps = [
  {
    id: 'brand-fundamentals',
    name: 'Brand Fundamentals',
    fields: [
      { name: 'missionStatement', label: 'Mission Statement', type: 'textarea' },
      { name: 'coreValues', label: 'Core Values', type: 'textarea' },
      { name: 'visualIdentity', label: 'Visual Identity', type: 'textarea' },
      { name: 'slogans', label: 'Existing Slogan(s)', type: 'textarea' },
    ]
  },
  {
    id: 'target-audience',
    name: 'Target Audience',
    fields: [
      { name: 'demographics', label: 'Demographics (age, gender, location, income level)', type: 'textarea' },
      { name: 'psychographics', label: 'Psychographics (interests, lifestyle, values)', type: 'textarea' },
      { name: 'onlinePresence', label: 'Where does your audience spend time online?', type: 'textarea' },
      { name: 'contentEngagement', label: 'What content does your audience engage with most?', type: 'textarea' },
    ]
  },
  {
    id: 'business-details',
    name: 'Business Details',
    fields: [
      { name: 'productsServices', label: 'Products/Services Offered', type: 'textarea' },
      { name: 'pricingStrategy', label: 'Price Points/Pricing Strategy', type: 'textarea' },
      { name: 'differentiators', label: 'Key Differentiators from Competitors', type: 'textarea' },
    ]
  },
  {
    id: 'content-preferences',
    name: 'Content Preferences',
    fields: [
      { name: 'contentThemes', label: 'Content Themes to Focus On', type: 'textarea' },
      { name: 'topicsToAvoid', label: 'Specific Topics to Avoid', type: 'textarea' },
      { name: 'successfulPosts', label: 'Successful Past Posts', type: 'textarea' },
      { name: 'competitorContent', label: 'Competitor Content that Resonates', type: 'textarea' },
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
      { name: 'kpis', label: 'Key Performance Indicators (KPIs)', type: 'textarea' },
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
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance & Guidelines',
    fields: [
      { name: 'regulations', label: 'Industry Regulations', type: 'textarea' },
      { name: 'restrictedTerms', label: 'Restricted Terms or Topics', type: 'textarea' },
      { name: 'disclaimers', label: 'Required Disclaimers', type: 'textarea' },
      { name: 'hashtagPreferences', label: 'Hashtag Preferences', type: 'textarea' },
      { name: 'imageRights', label: 'Image Rights/Usage Guidelines', type: 'textarea' },
    ]
  }
]

const formSchema = z.object({
  brandName: z.string().min(2, 'Brand name must be at least 2 characters'),
  brandType: z.string(),
  industry: z.string(),
  locations: z.string(),
  website: z.string().url('Please enter a valid URL'),
  socialMedia: z.string(),
  missionStatement: z.string(),
  coreValues: z.string(),
  brandVoice: z.string(),
  visualIdentity: z.string(),
  slogans: z.string(),
  // Target Audience
  demographics: z.string(),
  psychographics: z.string(),
  onlinePresence: z.string(),
  contentEngagement: z.string(),
  // Business Details
  productsServices: z.string(),
  pricingStrategy: z.string(),
  differentiators: z.string(),
  usp: z.string(),
  currentPromotions: z.string(),
  // Content Preferences
  contentThemes: z.string(),
  topicsToAvoid: z.string(),
  successfulPosts: z.string(),
  competitorContent: z.string(),
  // Marketing Goals
  primaryObjectives: z.string(),
  kpis: z.string(),
  callToActions: z.string(),
  // Additional Context
  upcomingEvents: z.string(),
  testimonials: z.string(),
  brandStory: z.string(),
  // Compliance
  regulations: z.string(),
  restrictedTerms: z.string(),
  disclaimers: z.string(),
  hashtagPreferences: z.string(),
  imageRights: z.string(),
})

export default function BrandInformationPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: '',
      brandType: '',
      industry: '',
      locations: '',
      website: '',
      socialMedia: '',
      missionStatement: '',
      coreValues: '',
      brandVoice: '',
      visualIdentity: '',
      slogans: '',
      // Target Audience
      demographics: '',
      psychographics: '',
      onlinePresence: '',
      contentEngagement: '',
      // Business Details
      productsServices: '',
      pricingStrategy: '',
      differentiators: '',
      usp: '',
      currentPromotions: '',
      // Content Preferences
      contentThemes: '',
      topicsToAvoid: '',
      successfulPosts: '',
      competitorContent: '',
      // Marketing Goals
      primaryObjectives: '',
      kpis: '',
      callToActions: '',
      // Additional Context
      upcomingEvents: '',
      testimonials: '',
      brandStory: '',
      // Compliance
      regulations: '',
      restrictedTerms: '',
      disclaimers: '',
      hashtagPreferences: '',
      imageRights: '',
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
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Edit'}
            </Button>
          </div>

          {showAdvanced && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {advancedSteps[currentStep].fields.map((field) => (
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

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentStep === advancedSteps.length - 1 ? (
                    <Button type="submit">Submit</Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(advancedSteps.length - 1, currentStep + 1))}
                    >
                      Next
                  </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
