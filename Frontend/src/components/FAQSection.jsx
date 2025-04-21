const FAQSection = ({ faqs }) => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-16 text-center">
          Frequently asked questions
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;