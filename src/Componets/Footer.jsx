import { Link } from 'react-router-dom';
import { scrollToTop } from '../utils/useScrollToTop';

function Footer() {
  return (
    <footer className="bg-white" style={{ color: '#006CB5' }}>
      {/* Blue line above footer */}
      <div style={{ height: '4px', backgroundColor: '#006CB5' }}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/combat-warrior-logo.png" 
                alt="Combat Warrior Taekwon-Do" 
                className="h-12 w-12"
              />
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#006CB5' }}>Combat Warrior</h3>
                <p className="text-sm" style={{ color: '#006CB5' }}>Taekwon-Do Association of Karnataka</p>
              </div>
            </div>
            <p className="mb-4 max-w-md text-gray-700">
              Empowering individuals through traditional ITF Taekwon-Do training. 
              Building character, discipline, and physical fitness since 2008.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#006CB5' }}>Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" onClick={scrollToTop} className="text-gray-700 hover:opacity-70 transition-opacity">Home</Link></li>
              <li><Link to="/about" onClick={scrollToTop} className="text-gray-700 hover:opacity-70 transition-opacity">About Us</Link></li>
              <li><Link to="/courses" onClick={scrollToTop} className="text-gray-700 hover:opacity-70 transition-opacity">Programs</Link></li>
              <li><Link to="/admission" onClick={scrollToTop} className="text-gray-700 hover:opacity-70 transition-opacity">Admission</Link></li>
              <li><Link to="/belt-exam" onClick={scrollToTop} className="text-gray-700 hover:opacity-70 transition-opacity">Belt Exam</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="text-gray-700 hover:opacity-70 transition-opacity">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#006CB5' }}>Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-12 h-12 mt-1" style={{ color: '#006CB5' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-gray-700">
                    #368/A, 3rd Main, 4th Phase, 707 CHS, Near Shristi College, Yelahanka New Town, Bengaluru -560064
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" style={{ color: '#006CB5' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-700">+91 7259113288</p>
                  <p className="text-sm text-gray-700">+91 9663333247</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" style={{ color: '#006CB5' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <p className="text-sm text-gray-700">yesh18390@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: '#006CB5' }}>
          <p className="text-sm text-gray-700">
            © 2026 Combat Warrior Taekwon-Do Association of Karnataka. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/club-rules" onClick={scrollToTop} className="text-sm text-gray-700 hover:opacity-70 transition-opacity">Club Rules and Regulations</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;