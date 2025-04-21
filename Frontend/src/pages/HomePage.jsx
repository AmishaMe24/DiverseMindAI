import React from 'react'
import { Button } from '../components/features/button'
import { Card, CardContent } from '../components/features/card'
import { CheckCircle, Users, Star, Check } from 'lucide-react'
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
      <Features features={features} />
      <CTASection />
      <Testimonials testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <Footer />
    </div>
  )
}

const features = [
  {
    title: 'Adaptive Lesson Plans',
    description: 'Create personalized curriculum tailored for neurodiverse students with just a few clicks.',
    icon: CheckCircle,
  },
  {
    title: 'Engaging Activities',
    description: 'Generate interactive learning tools designed to enhance comprehension for all learning styles.',
    icon: Users,
  },
  {
    title: 'Validated Success',
    description: 'Our platform is backed by educational experts and real-world data to ensure effectiveness.',
    icon: Star,
  },
]

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
    question: "Can I integrate with my existing LMS?",
    answer: "Yes, DiverseMind integrates with popular learning management systems like Google Classroom, Canvas, and Schoology."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption and follow strict privacy protocols to protect all user data."
  },
  {
    question: "Do you offer training for teachers?",
    answer: "Yes, we provide free onboarding sessions and regular webinars to help teachers maximize the platform."
  },
  {
    question: "Can I try before I buy?",
    answer: "Yes! We offer a 14-day free trial with full access to all features so you can see the impact firsthand."
  }
]
