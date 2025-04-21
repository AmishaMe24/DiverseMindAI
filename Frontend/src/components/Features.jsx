import { Card, CardContent } from '../components/features/card';

const Features = ({ features }) => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">
          Simplify everyday teaching tasks.
        </h2>
        <p className="text-xl mb-16 text-gray-600 max-w-3xl mx-auto">
          Our platform helps you create inclusive learning experiences with less effort.
        </p>
        
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white shadow-sm border border-gray-200 p-6 rounded-lg text-left"
            >
              <CardContent>
                <div className="flex flex-col">
                  <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;