import React from 'react'
import Hero from '../components/Hero';
import MainFeature from '../components/MainFeature';
import Features from '../components/Features';
import CTASection from '../components/CTASection';
import Testimonials from '../components/Testimonials';
import FAQSection from '../components/FAQSection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Hero />
      <MainFeature />
      <Features />
      <CTASection />
      <Testimonials testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <Footer />
    </div>
  )
}

const testimonials = [
  {
    quote: "DiverseMind has transformed how I teach my STEM classes. My students with learning differences are now thriving.",
    name: "Sarah Johnson",
    title: "5th Grade Teacher"
  },
  {
    quote: "As a special education coordinator, I've seen remarkable progress in student engagement since implementing DiverseMind.",
    name: "Michael Chen",
    title: "Special Education Coordinator"
  },
  {
    quote: "The personalized lesson plans save me hours of preparation time while better serving my diverse classroom.",
    name: "Emily Rodriguez",
    title: "Middle School Science Teacher"
  }
]

const faqs = [
  {
    question: "How does DiverseMind work?",
    answer: "Our AI analyzes learning needs and creates personalized content tailored to different learning styles and accommodations."
  },
  {
    question: "What learning differences do you support?",
    answer: "We support a wide range of learning differences including ADHD, dyslexia, autism spectrum, and more."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use enterprise-grade encryption and follow strict privacy protocols to protect all user data."
  }
]
