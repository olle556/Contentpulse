"use client"

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"

interface TrialStatusResponse {
  authorized: boolean;
  status: string;
  message: string;
  trialEndDate: string | null;
  subscriptionEndDate: string | null;
  subscriptionStartDate: string | null;
  remainingTrialDays: number;
}

async function checkTrialStatus() {
  try {
    const response = await fetch('/api/check-subscription')
    if (!response.ok) throw new Error('Failed to fetch trial status')
    const data: TrialStatusResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error checking trial status:', error)
    return null
  }
}

export function TrialStatus() {
  const [trialData, setTrialData] = useState<TrialStatusResponse | null>(null)

  useEffect(() => {
    checkTrialStatus().then(setTrialData)
  }, [])

  if (!trialData) return null

  // Don't show if subscription is active
  if (trialData.status === 'active') return null

  // Get badge styles based on status
  const getBadgeStyles = () => {
    switch (trialData.status) {
      case 'trialing':
      case 'trialing_with_payment':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'trial_canceled':
      case 'trial_canceled_with_payment':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'grace_period':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'past_due':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  // Get badge message based on status
  const getBadgeMessage = () => {
    switch (trialData.status) {
      case 'trialing':
        return `${trialData.remainingTrialDays} days left in trial - Add payment method`
      case 'trialing_with_payment':
        return `${trialData.remainingTrialDays} days left in trial`
      case 'trial_canceled':
      case 'trial_canceled_with_payment':
        return `Trial ends in ${trialData.remainingTrialDays} days`
      case 'grace_period':
        return 'Subscription ending soon'
      case 'past_due':
        return 'Payment past due'
      case 'inactive':
        return 'Subscribe to continue'
      default:
        return trialData.message
    }
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${getBadgeStyles()} transition-colors duration-200`}
    >
      {getBadgeMessage()}
    </Badge>
  )
}

