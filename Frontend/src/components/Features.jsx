import { Card, CardContent } from "../components/features/card";
import { Package } from "lucide-react"; // Import the Package icon or another appropriate icon

const Features = () => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-16 text-gray-900">
          Unlock Your Potential with Our Adaptive Learning Solutions for Every
          Student
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <Package size={40} strokeWidth={2} className="text-black" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Engage and Inspire with Interactive Quizzes Tailored to Your
              Learning Style
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Our quizzes adapt to your knowledge level, making learning fun and
              effective.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <Package size={40} strokeWidth={2} className="text-black" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Experience Personalized Learning with Customized Accommodations
              for Every Learner
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              We provide tailored resources to meet the unique needs of each
              student.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <Package size={40} strokeWidth={2} className="text-black" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Transform Your Learning Journey with Adaptive Lesson Plans
              Designed for You
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Our lesson plans adjust to your pace, ensuring a comfortable
              learning environment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
