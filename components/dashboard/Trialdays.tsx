"use client"

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"

interface TrialStatusResponse {
  remainingDays: number;
  hasSubscriptionHistory: boolean;
  status: string;
}

async function checkTrialStatus() {
  try {
    const response = await fetch('/api/check-subscription_2/check-trialstatus')
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

  // Don't show anything if we're loading or if user has subscription history
  if (!trialData || trialData.hasSubscriptionHistory) return null

  return (
    <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200">
      {trialData.remainingDays > 0 ? (
        <>
          <span className="font-bold">{trialData.remainingDays}</span> day{trialData.remainingDays !== 1 ? 's' : ''} left in trial
        </>
      ) : (
        'Trial expired'
      )}
    </Badge>
  )
}

