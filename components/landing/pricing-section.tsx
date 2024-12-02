'use client'
import React, { Suspense, useState } from 'react';
import { PricingCard } from '@/components/ui/pricing-card';

export function PricingSection({ onSubscribe }: { onSubscribe: () => void }) {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section className="w-full py-12 md:py-24 lg:py-32" id="pricing">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-gray-800 px-3 py-1 text-sm">
                            Pricing
                        </div>
                        <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                            Simple, transparent pricing
                        </h2>
                        <p className="mx-auto max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Choose the perfect plan for your content needs
                        </p>
                    </div>
                </div>

                <div className="flex justify-center items-center my-8">
                    <div className="bg-gray-800 rounded-full p-1 flex items-center">
                        <button
                            className={`px-4 py-2 rounded-full ${!isYearly ? 'bg-gray-700' : ''}`}
                            onClick={() => setIsYearly(false)}
                        >
                            Monthly
                        </button>
                        <button
                            className={`px-4 py-2 rounded-full ${isYearly ? 'bg-gray-700' : ''} flex items-center`}
                            onClick={() => setIsYearly(true)}
                        >
                            Yearly
                            <span className="ml-2 bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Suspense fallback={<div>Loading...</div>}>
                        <PricingCard
                            title="Content Pulse Pro"
                            monthlyPrice={40}
                            yearlyPrice={320}
                            features={[
                                "Unlimited AI content generation",
                                "Smart content scheduling",
                                "Multiple content sources",
                                "Analytics dashboard",
                                "Priority support"
                            ]}
                            buttonText="Get Started"
                            className="w-full max-w-md"
                            isYearly={isYearly}
                        />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}