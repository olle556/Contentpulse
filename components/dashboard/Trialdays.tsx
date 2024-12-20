"use client"

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"

interface TrialStatusResponse {
  trialDaysRemaining: number | null;
  subscriptionStatus: string | null;
  trialEndDate: string | null;
  hasStartedTrial: boolean;
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

  // Don't show anything while loading
  if (!trialData) return null

  // Don't show if user has an active subscription
  if (trialData.subscriptionStatus === 'active') return null

  // Show start trial message for new users
  if (!trialData.hasStartedTrial) {
    return (
      <Badge 
        variant="secondary" 
        className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200"
      >
        Start your free trial
      </Badge>
    )
  }

  // Show trial status
  return (
    <Badge 
      variant="secondary" 
      className={`${
        trialData.trialDaysRemaining && trialData.trialDaysRemaining > 0
          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
          : 'bg-red-100 text-red-800 hover:bg-red-200'
      } transition-colors duration-200`}
    >
      {trialData.trialDaysRemaining && trialData.trialDaysRemaining > 0 ? (
        <>
          <span className="font-bold">{trialData.trialDaysRemaining}</span> day{trialData.trialDaysRemaining !== 1 ? 's' : ''} left in trial
        </>
      ) : (
        'Trial expired'
      )}
    </Badge>
  )
}

