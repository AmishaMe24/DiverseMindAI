import React from 'react'
import { Button } from '../components/features/button'
import { Card, CardContent } from '../components/features/card'
import { motion } from 'framer-motion'
import { CheckCircle, Users, Star } from 'lucide-react'
import {Link} from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-black-900">
      {/* Hero Section */}
      <section
        className="h-screen flex flex-col items-center justify-center text-center p-6 relative bg-cover bg-center"
        style={{ backgroundImage: "url('src/assets/homepage-cover.webp')" }}
      >
        {/* White Gradient on Right */}
        <div className="absolute inset-0 bg-white/50"></div>

        {/* Content */}
        <div className="relative z-30 max-w-6xl">
          <motion.h1
            className="text-6xl font-extrabold mb-4 tracking-tight max-w-4xl drop-shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Revolutionizing STEM Education with AI
          </motion.h1>
          <p className="text-xl mb-6 text-black-900 font-bold  mx-auto">
            Empowering learners with AI-driven, adaptive STEM education.
          </p>
          <Link to="/lesson-plan">
  <Button
    size="lg"
    className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-xl hover:bg-blue-700 cursor-pointer"
  >
    Get Started
  </Button>
</Link>

          
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-blue-600">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gray-100 shadow-lg border border-gray-300 p-8 rounded-lg hover:shadow-xl transition-shadow"
              >
                <CardContent>
                  <div className="flex flex-col items-center text-center">
                    <feature.icon size={56} className="text-blue-600 mb-4" />
                    <h3 className="text-2xl font-semibold mb-2 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 text-lg">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-300 to-teal-200 text-gray-900 text-center relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg">
            Ready to Transform Learning?
          </h2>
          <p className="mb-8 max-w-3xl mx-auto text-gray-800 text-lg">
            Join our platform today and make education inclusive for all.
          </p>
          <Button
            size="lg"
            className="bg-teal-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:bg-teal-700 transition"
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    title: 'Adaptive Lesson Plans',
    description: 'Personalized curriculum tailored for neurodiverse students.',
    icon: CheckCircle,
  },
  {
    title: 'Engaging Activities',
    description:
      'Interactive learning tools designed to enhance comprehension.',
    icon: Users,
  },
  {
    title: ' Validated Success',
    description: 'Backed by educational experts and real-world data.',
    icon: Star,
  },
]
