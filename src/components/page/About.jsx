import Link from 'next/link';

const pageData = {
    title: "Production-Ready SaaS Boilerplate",
    intro: "Skip months of setup and start building your SaaS product today. SaaSavant provides a complete, TypeScript-based foundation with authentication, payments, and email integration built-in.",
    buyNowLink: {
        text: "Start Your Journey",
        href: "/Signup",
    },
    whatIs: {
        title: "What is SaaSavant?",
        content: "SaaSavant is a production-ready SaaS boilerplate built with Next.js 14, TypeScript, Firebase, and Stripe. It provides everything you need to launch a subscription-based application: authentication, payment processing, user management, admin dashboard, email integration, and more. Focus on building your unique features while we handle the infrastructure."
    },
    keyFeatures: {
        title: "Key Features",
        features: [
            "Stripe Integration: Complete subscription management with checkout sessions, webhooks, and billing portal.",
            "Firebase Backend: Secure authentication and Firestore database for user data and subscriptions.",
            "Email Automation: SendGrid integration for welcome emails, newsletters, and transactional messages.",
            "Admin Dashboard: Manage users, send newsletters, view announcements, and monitor subscriptions.",
            "TypeScript: Fully typed codebase for better developer experience and fewer runtime errors.",
            "Real-Time Updates: Automatic subscription status updates via Stripe webhooks.",
            "User Management: Pre-built sign up, sign in, and account management pages.",
            "Subscription Plans: Flexible pricing with monthly and yearly subscription options.",
            "Premium Status: Automatic user premium status based on active subscriptions.",
            "SEO Optimized: Built-in sitemap generation and metadata management.",
            "Responsive Design: Mobile-first design with TailwindCSS.",
            "Modern UI: Beautiful components with Lucide icons and Framer Motion animations.",
            "API Routes: Type-safe Next.js API routes for all backend operations.",
            "Environment Config: Easy configuration with environment variables."
        ]
    },
    technology: {
        title: "Technology Stack",
        content: "SaaSavant is built with modern, production-ready technologies that ensure your application is scalable, secure, and maintainable.",
        technologies: [
            "Next.js 14: Latest App Router with server-side rendering and static generation.",
            "TypeScript: Full type safety across the entire codebase.",
            "React 18: Modern React with hooks and concurrent features.",
            "Firebase: Authentication with email/password and Firestore for data storage.",
            "Stripe: Complete payment processing with subscriptions, webhooks, and billing portal.",
            "SendGrid: Transactional emails and newsletter campaigns.",
            "TailwindCSS: Utility-first CSS framework for rapid UI development.",
            "Framer Motion: Smooth animations and transitions.",
            "Lucide React: Beautiful, consistent icon library.",
            "Vercel Analytics: Track user behavior and performance metrics.",
            "Next Sitemap: Automatic sitemap generation for SEO.",
            "ESLint: Code quality and consistency enforcement."
        ]
    },
    howToUse: {
        title: "How to Get Started",
        steps: [
            "Step 1: Clone & Install - Clone the repository and run npm install to set up dependencies.",
            "Step 2: Configure Environment - Set up your .env.local file with Firebase, Stripe, and SendGrid credentials.",
            "Step 3: Customize Branding - Update colors, logos, and content to match your brand.",
            "Step 4: Build Features - Add your unique features on top of the existing foundation.",
            "Step 5: Deploy - Deploy to Vercel or your preferred hosting platform and go live!"
        ]
    },
    benefits: {
        title: "Why Choose SaaSavant?",
        points: [
            "Save Months of Development: Skip the boilerplate setup and start building your unique features immediately.",
            "Production-Ready Code: Battle-tested integrations with Stripe, Firebase, and SendGrid.",
            "Type-Safe: Full TypeScript coverage reduces bugs and improves developer experience.",
            "Best Practices: Modern architecture with Next.js 14 App Router and React 18.",
            "Fully Documented: Comprehensive setup guides and migration documentation included."
        ]
    },
    faq: {
        title: "Frequently Asked Questions (FAQ)",
        questions: [
            {
                question: "How do I set up SaaSavant?",
                answer: "Follow the SETUP.md guide included in the repository. You'll need to configure Firebase, Stripe, and SendGrid credentials in your .env.local file."
            },
            {
                question: "Is my data secure?",
                answer: "Yes. SaaSavant uses Firebase Authentication for secure user management and follows industry best practices for data storage and payment processing."
            },
            {
                question: "Can I customize the design?",
                answer: "Absolutely! All components are built with TailwindCSS and can be easily customized. The color scheme is defined in tailwind.config.ts."
            },
            {
                question: "What's included in the boilerplate?",
                answer: "Authentication, subscription management, payment processing, admin dashboard, email integration, user management, and more. Check the REFACTORING_SUMMARY.md for details."
            },
            {
                question: "Do I need to know TypeScript?",
                answer: "While TypeScript knowledge is helpful, the codebase is well-documented. You can also use JavaScript for your custom features if preferred."
            }
        ]
    }
};


export default function About() {
    return (
        <>
            <div className="min-h-screen h-full flex flex-col items-center justify-center py-8 sm:pb-24 px-4 sm:px-6 lg:px-8 text-black max-w-6xl mx-auto w-full">
                <div className="w-full space-y-8">
                    <div className="text-left">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                            {pageData.title}
                        </h1>
                        <p className="mt-4 text-lg leading-6 text-justify">
                            {pageData.intro}
                        </p>
                        <Link className="py-2 text-black font-semibold cursor-pointer hover:shadow-lg hover:shadow-black shadow-md shadow-black duration-300 mt-8 bg-confirm px-4 rounded inline-block" href={pageData.buyNowLink.href}>
                            {pageData.buyNowLink.text}
                        </Link>
                    </div>
                    <div className="rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">{pageData.whatIs.title}</h2>
                        <p className="text-lg leading-6 mb-6">{pageData.whatIs.content}</p>
                        <h2 className="text-2xl font-semibold mb-4">{pageData.keyFeatures.title}</h2>
                        <ul className="list-disc ml-6 text-lg leading-6 mb-6">
                            {pageData.keyFeatures.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                        <h2 className="text-2xl font-semibold mb-4">{pageData.technology.title}</h2>
                        <p className="text-lg leading-6 mb-4">{pageData.technology.content}</p>
                        <ul className="list-disc ml-6 text-lg leading-6 mb-6">
                            {pageData.technology.technologies.map((tech, index) => (
                                <li key={index}>{tech}</li>
                            ))}
                        </ul>
                        <Link className="py-2 text-black font-semibold cursor-pointer hover:shadow-lg hover:shadow-black shadow-md shadow-black duration-300 mb-8 bg-confirm px-4 rounded inline-block" href={pageData.buyNowLink.href}>
                            {pageData.buyNowLink.text}
                        </Link>
                        <h2 className="text-2xl font-semibold mb-4">{pageData.howToUse.title}</h2>
                        {pageData.howToUse.steps.map((step, index) => (
                            <p key={index} className="text-lg leading-6 mb-6">{step}</p>
                        ))}
                        <h2 className="text-2xl font-semibold mb-4">{pageData.benefits.title}</h2>
                        <ul className="list-disc ml-6 text-lg leading-6 mb-6">
                            {pageData.benefits.points.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                        <h2 className="text-2xl font-semibold mb-4">{pageData.faq.title}</h2>
                        {pageData.faq.questions.map((q, index) => (
                            <div key={index} className="mb-6">
                                <h3 className="text-xl font-semibold mb-2">{q.question}</h3>
                                <p className="text-lg leading-6 mb-6">
                                    {q.answer}
                                    {q.linkText && (
                                        <Link className="text-destructive font-bold cursor-pointer hover:opacity-80 duration-300" href={q.linkHref}>
                                            {q.linkText}
                                        </Link>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                    <Link className="py-2 text-black font-semibold cursor-pointer hover:shadow-lg hover:shadow-black shadow-md shadow-black duration-300 mt-8 bg-confirm px-4 rounded inline-block" href={pageData.buyNowLink.href}>
                        {pageData.buyNowLink.text}
                    </Link>
                </div>
            </div>
        </>
    );
}
