"use client"

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"

interface TrialStatusResponse {
  authorized: boolean;
  status: string;
  message: string;
  needsPaymentMethod: boolean;
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

  // Don't show if subscription is active or in grace period
  if (trialData.status === 'active' || trialData.status === 'grace_period') return null

  // Show different badges based on status
  const getBadgeStyles = () => {
    switch (trialData.status) {
      case 'trial':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'trial_ended':
      case 'canceled':
      case 'past_due':
      case 'expired':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'inactive':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${getBadgeStyles()} transition-colors duration-200`}
    >
      {trialData.status === 'trial' ? (
        <>
          <span className="font-bold">{trialData.remainingTrialDays}</span> day{trialData.remainingTrialDays !== 1 ? 's' : ''} left in trial
        </>
      ) : (
        trialData.message
      )}
    </Badge>
  )
}

