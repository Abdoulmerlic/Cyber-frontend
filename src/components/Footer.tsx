
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3">Cyber Savvy</h3>
            <p className="text-sm text-gray-300">
              Stay informed, stay secure. Your trusted source for cybersecurity awareness and education.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/articles" className="hover:text-white">Articles</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3">Stay Updated</h3>
            <p className="text-sm text-gray-300 mb-3">
              Subscribe for the latest security tips and updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 text-sm text-gray-900 bg-white rounded-l-md focus:outline-none"
              />
              <button className="bg-cybersec-green text-white px-3 py-2 text-sm rounded-r-md hover:bg-opacity-90">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4 flex flex-col md:flex-row justify-between text-sm text-gray-400">
          <p>&copy; {currentYear} Cyber Savvy. All rights reserved.</p>
          <div className="space-x-4 mt-2 md:mt-0">
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/cookies" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
