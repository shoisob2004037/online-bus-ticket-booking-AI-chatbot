import { Bus, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <Bus className="w-8 h-8 text-secondary" />
              <span>BusGo</span>
            </div>
            <p className="text-gray-300 text-sm">
              সারা দেশে আরামদায়ক ও নিরাপদ বাস ভ্রমণের বিশ্বস্ত সঙ্গী।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">দ্রুত লিংক</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-secondary transition-colors">হোম</a></li>
              <li><a href="/search" className="hover:text-secondary transition-colors">বাস খুঁজুন</a></li>
              <li><a href="/profile" className="hover:text-secondary transition-colors">আমার বুকিং</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">যোগাযোগ</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary" />
                <span>+880 1234-567890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                <span>support@busgo.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="font-semibold text-lg mb-4">সাপোর্ট সময়সূচি</h3>
            <ul className="space-y-2 text-gray-300">
              <li>সোমবার - শুক্রবার: সকাল ৮টা - রাত ১০টা</li>
              <li>শনিবার: সকাল ৯টা - রাত ৮টা</li>
              <li>রবিবার: সকাল ১০টা - সন্ধ্যা ৬টা</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} BusGo। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
