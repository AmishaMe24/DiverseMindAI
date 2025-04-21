import { Link } from "react-router-dom";
import { Button } from "../components/features/button";
import home_cover from "../assets/home_cover.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center py-20 px-20 overflow-hidden">
      {/* Two-column layout container */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left column: Text content */}
        <div className="text-left max-w-xl">
          <h1 className="text-5xl font-bold mb-4">
            DiverseMind:{" "}
            <span className="text-blue-600">Education Reimagined</span>
          </h1>
          <h2 className="text-3xl font-bold mb-6">
            for every learning journey.
          </h2>
          <p className="text-xl mb-8 font-medium">
            Personalized AI‑powered STEM education that adapts to individual
            learning preferences and styles.
          </p>
          <div className="flex gap-4">
            <Link to="/lesson-plan">
              <Button
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-md shadow-md hover:bg-blue-700"
                size="lg"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Right column: Image */}
        <div className="hidden md:block">
          <img
            src={home_cover}
            alt="DiverseMind for students"
            className="w-full h-full rounded-lg shadow-xl object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
