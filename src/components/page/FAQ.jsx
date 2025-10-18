'use client'

import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

const pageData = {
    faqItems: [
        {
            question: "What is SaaSavant?",
            answer: "SaaSavant is a production-ready SaaS boilerplate built with Next.js 14, TypeScript, Firebase, and Stripe. It provides everything you need to launch a subscription-based application including authentication, payment processing, user management, admin dashboard, and email integration."
        },
        {
            question: "What are the main features?",
            answer: "SaaSavant includes Stripe subscription management with webhooks and billing portal, Firebase Authentication and Firestore database, SendGrid email integration, admin dashboard for user management and newsletters, TypeScript for type safety, responsive design with TailwindCSS, and SEO optimization with automatic sitemap generation."
        },
        {
            question: "How do I get started?",
            answer: "Clone the repository, run npm install, create a .env.local file with your Firebase, Stripe, and SendGrid credentials (see .env.example), customize the branding and colors, then deploy to Vercel or your preferred hosting platform. Check SETUP.md for detailed instructions."
        },
        {
            question: "Can I customize the design and components?",
            answer: "Yes! All components are built with TailwindCSS and can be easily customized. The color scheme is defined in tailwind.config.ts. You can modify any component to match your brand and requirements."
        },
        {
            question: "Do I need to know TypeScript?",
            answer: "While TypeScript knowledge is helpful, it's not required. The codebase is well-documented and you can use JavaScript for your custom features if preferred. TypeScript provides better developer experience with autocomplete and type checking."
        },
        {
            question: "What's included in the subscription system?",
            answer: "The boilerplate includes complete Stripe integration with checkout sessions, webhook handlers for real-time updates, billing portal for customers to manage subscriptions, automatic premium status updates, and support for multiple pricing plans (monthly/yearly)."
        },
        {
            question: "Is there an admin dashboard?",
            answer: "Yes! The admin dashboard allows you to manage users, send newsletters to subscribers, view announcements, and monitor subscription status. Admin access is controlled via the isAdmin flag in the user's Firestore document."
        },
        {
            question: "How secure is the authentication?",
            answer: "SaaSavant uses Firebase Authentication which provides enterprise-grade security. User passwords are hashed, and all authentication flows follow security best practices. The boilerplate also includes proper session management and protected routes."
        },
    ]
}

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-300 bg-opacity-0 p-5 sm:px-10 max-w-6xl w-full mx-auto">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left flex justify-between items-center focus:outline-none">
                <span className="font-semibold text-lg sm:text-xl">{question}</span>
                <span className={twMerge("ml-2 text-confirm", isOpen && "text-destructive")}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
            </button>
            {isOpen && <p className="mt-2 text-black text-base sm:text-lg">{answer}</p>}
        </div>
    )
}

export default function FAQ() {
    const { faqItems } = pageData;

    return (
        <div id="faq" className="mx-auto pt-5 min-h-screen h-full w-full flex flex-col text-black ">
            <h2 className="section-title mb-5">
                Frequently Asked Questions
            </h2>
            {faqItems.map((item, index) => (
                <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
        </div>
    )
}
