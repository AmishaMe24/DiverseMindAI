import { Button } from '../components/features/button';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-center">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">
          Get started today
        </h2>
        <p className="mb-8 max-w-3xl mx-auto text-blue-100 text-xl">
          Join thousands of educators making learning accessible for all students.
        </p>
        <Button
          size="lg"
          className="bg-white text-blue-700 font-semibold px-8 py-4 rounded-md shadow-xl hover:bg-gray-100 transition"
        >
          Start Free Trial
        </Button>
      </div>
    </section>
  );
};

export default CTASection;