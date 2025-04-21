import { Link } from 'react-router-dom';
import { Button } from '../components/features/button';
import home_cover from '../assets/home_cover.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* 1) background image */}
      <img
        src={home_cover}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 3) your content above the overlay */}
      <div className="relative z-20 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4 text-white">
          DiverseMind <span className="text-blue-200">made simple</span>
        </h1>
        <h2 className="text-3xl font-bold mb-6 text-white">
          for neurodiverse students.
        </h2>
        <p className="text-xl mb-8 text-white font-medium max-w-3xl mx-auto">
          Personalized AI‑powered STEM education that adapts to different learning styles.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/lesson-plan">
            <Button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-md shadow-md hover:bg-blue-700" size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
