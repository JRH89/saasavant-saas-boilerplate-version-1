import { Header } from "../components/landing-page/Header"
import Hero from "../components/landing-page/Hero"
import { ProductShowcase } from "../components/landing-page/ProductShowcase"
import FeaturesSection from "../components/landing-page/FeaturesSection"
import { PriceCard } from "../components/landing-page/PriceCard"
import { Testimonials } from "../components/landing-page/Testimonials"
import { CallToAction } from "../components/landing-page/CallToAction"
import { Footer } from "../components/landing-page/Footer"
import LeadCapture from "../components/landing-page/LeadCapture"

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <ProductShowcase />
      <FeaturesSection />
      <PriceCard />
      <Testimonials />
      <CallToAction />
      <Footer />
      <LeadCapture />
    </>
  )
}
