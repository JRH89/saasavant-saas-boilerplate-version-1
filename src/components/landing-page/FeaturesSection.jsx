import {
    Mail,
    CreditCard,
    Database,
    Bell,
    Megaphone,
    Bug
} from 'lucide-react';
import Feature from './Feature';

// Page Data
const pageData = {
    tag: "Explore endless possibilities",
    title: "Capabilities",
    description: "Our platform offers a wide range of features designed to meet your needs. Discover everything you can achieve with our comprehensive toolset.",
}

// Feature Data
const features = [
    {
        title: 'Email Integration',
        description: 'SendGrid integration for transactional emails, welcome messages, and newsletter campaigns.',
        icon: Mail,
    },
    {
        title: 'Stripe Payments',
        description: 'Complete Stripe integration with subscriptions, webhooks, and billing portal management.',
        icon: CreditCard,
    },
    {
        title: 'Firebase Backend',
        description: 'Firebase Authentication and Firestore database for secure user management and data storage.',
        icon: Database,
    },
    {
        title: 'Real-time Updates',
        description: 'Live subscription status updates and instant notifications for payment events.',
        icon: Bell,
    },
    {
        title: 'TypeScript Ready',
        description: 'Fully typed codebase with TypeScript for better developer experience and fewer bugs.',
        icon: Bug,
    },
    {
        title: 'Admin Dashboard',
        description: 'Built-in admin panel for managing users, sending newsletters, and viewing analytics.',
        icon: Megaphone,
    },

];

const FeaturesSection = () => {
    return (
        <section className="sm:p-10 md:px-24 p-8 px-2 pt-20 mx-auto w-full my-auto  md:mb-0 min-h-screen h-full flex items-center flex-col justify-center">
            <div className="section-heading">
                <div className='flex justify-center'>
                    <div className="tag text-destructive text-sm sm:text-md md:text-lg lg:text-xl">
                        {pageData.tag}
                    </div>
                </div>
                <h2 className="section-title mt-5">
                    {pageData.title}
                </h2>
                <p className="section-description mt-5">
                    {pageData.description}
                </p>
            </div>
            <div className="mx-auto justify-center flex mt-10">
                <div className="grid grid-cols-1 gap-6 items-center w-full mx-auto sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <Feature
                            key={feature.title}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection;
