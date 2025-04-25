const Footer = () => {
  return (
    <section className="py-16 px-6 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto text-center">
        <img 
          src="/src/assets/diversemind-logo.jpg" 
          alt="DiverseMind Logo" 
          className="h-8 mx-auto mb-6"
        />
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} DiverseMind AI. All rights reserved.
        </p>
      </div>
    </section>
  );
};

export default Footer;