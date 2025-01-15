'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Got questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking for, feel free to contact our support team.
          </p>
        </div>
        <div className="mx-auto max-w-[800px] mt-8 md:mt-16">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Content Pulse?</AccordionTrigger>
              <AccordionContent>
                Content Pulse is a powerful content automation platform that helps you generate, schedule, and manage your content with easy to use dashboard. Our platform streamlines your content creation process and boosts productivity.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does the 7-day trial work?</AccordionTrigger>
              <AccordionContent>
                You can try Content Pulse completely free for 7 days. No credit card is required to start your trial. You&apos;ll get full access to all features during the trial period.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What features are included?</AccordionTrigger>
              <AccordionContent className="space-y-4">
              <span className="font-bold">AI-Powered Content Creation:</span> Generate engaging, brand-aligned posts in seconds.
              <br />
              <span className="font-bold">Customizable Brand Voice:</span> Tailor your content to reflect your unique tone and style.
              <br />
              <span className="font-bold">Source Integration:</span> Pull in information from your preferred sources to keep your content relevant and up-to-date.
              <br />
              <span className="font-bold">Post Scheduling:</span> Plan and schedule posts ahead of time to maintain consistency.
              <br />
              <span className="font-bold">Posts Delivered Straight to your Inbox:</span> Scheduled posts are delivered directly to your inbox, so you can focus on other tasks.

              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
              <AccordionContent>
                Yes, you can cancel your subscription at any time. There are no long-term contracts or commitments. You&apos;ll continue to have access until the end of your current billing period.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Do you offer customer support?</AccordionTrigger>
              <AccordionContent>
                Yes, we provide dedicated customer support to all our users. Our support team is available via email to help you with any questions or issues you might encounter.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}

