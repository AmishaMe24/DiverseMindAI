import featureImage from "../assets/feature_img.jpg";

export default function MainFeature() {
  return (
    <div className="mx-auto py-16">
      <div className="flex flex-col md:flex-row items-center bg-blue-800 rounded-lg overflow-hidden relative">
        {/* Gradient background effect for entire section */}
        <svg
          viewBox="0 0 1024 1024"
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
        >
          <circle
            r={512}
            cx={512}
            cy={512}
            fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
            fillOpacity="0.7"
          />
          <defs>
            <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
              <stop stopColor="#1E40AF" />
              <stop offset={1} stopColor="#2563EB" />
            </radialGradient>
          </defs>
        </svg>

        {/* Left side - Image placeholder */}
        <div className="w-full md:w-1/2 p-10 relative z-10">
          <div className="bg-blue-700/30 h-96 w-full flex items-center justify-center rounded-lg border border-blue-600/30 backdrop-blur-sm overflow-hidden">
            <img
              src={featureImage}
              alt="Personalized learning experience"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right side - Text content */}
        <div className="w-full md:w-1/2 p-8 relative z-10">
          <div className="max-w-md">
            <p className="text-blue-300 font-medium mb-2">Empower</p>
            <h2 className="text-4xl font-bold mb-4 text-white">
              Transforming Education for Exceptional Learners
            </h2>
            <p className="text-blue-100 mb-8">
              At DiverseMind AI, we are dedicated to creating inclusive
              educational experiences. Our platform harnesses the power of AI to
              support exceptional students in their learning journey.
            </p>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="bg-blue-700 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">
                  Personalized Learning
                </h3>
                <p className="text-blue-100">
                  Tailored lesson plans that adapt to each student's unique
                  learning style.
                </p>
              </div>

              <div>
                <div className="bg-blue-700 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">
                  Interactive Tools
                </h3>
                <p className="text-blue-100">
                  Engaging quizzes and activities that enhance understanding and
                  retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
