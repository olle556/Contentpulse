import { ArrowRight } from 'lucide-react'

export default function ProcessFlow() {
    const steps = [
        { number: 1, title: "Describe Your Brand", description: "Tell us your brand style, tone, and preferences – our AI will do the rest." },
        { number: 2, title: "Add Content Sources", description: "Link your favorite platforms or inspiration sources for tailored content ideas." },
        { number: 3, title: "Schedule Posts", description: "Set it and forget it – pick your schedule, and we’ll handle the rest." },
        { number: 4, title: "Receive & Post", description: "Get ready-to-post content straight to your inbox, ready to go live." },
    ]

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
            <div className="container px-4 md:px-6">
                <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 sm:text-4xl md:text-5xl text-white">How It Works</h2>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex flex-1 items-center gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black font-bold text-xl">
                                    {step.number}
                                </div>
                                <div className="flex-1 h-full w-0.5 bg-white mt-2 md:hidden"></div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2 text-white">{step.title}</h3>
                                <p className="text-sm text-gray-400">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <ArrowRight className="hidden md:block w-6 h-6 text-white flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

