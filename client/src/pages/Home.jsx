import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, CreditCard, Headphones, Bus, MapPin, Users, ChevronDown, ChevronUp } from 'lucide-react';
import SearchForm from '../components/SearchForm';
// Remove Chatbot import from here

const features = [
  {
    icon: Shield,
    title: 'নিরাপদ ভ্রমণ',
    description: 'আপনার নিরাপত্তার জন্য সব বাস নিয়মিত জীবাণুমুক্ত ও রক্ষণাবেক্ষণ করা হয়'
  },
  {
    icon: Clock,
    title: 'সময়মতো সেবা',
    description: 'সব রুটে সময়মতো ছাড়া ও পৌঁছানো নিশ্চিত করি'
  },
  {
    icon: CreditCard,
    title: 'সহজ পেমেন্ট',
    description: 'ঝামেলাবিহীন বুকিংয়ের জন্য একাধিক পেমেন্ট অপশন'
  },
  {
    icon: Headphones,
    title: '২৪/৭ সহায়তা',
    description: 'আমাদের কাস্টমার সার্ভিস টিম সবসময় সহায়তার জন্য প্রস্তুত'
  }
];

const stats = [
  { icon: Bus, value: '500+', label: 'বাস' },
  { icon: MapPin, value: '100+', label: 'রুট' },
  { icon: Users, value: '1M+', label: 'সন্তুষ্ট যাত্রী' }
];

const popularRoutes = [
  { from: 'Dhaka', to: 'Chittagong', price: 850 },
  { from: 'Dhaka', to: "Cox's Bazar", price: 1500 },
  { from: 'Dhaka', to: 'Sylhet', price: 700 },
  { from: 'Chittagong', to: "Cox's Bazar", price: 550 },
  { from: 'Dhaka', to: 'Rajshahi', price: 650 },
  { from: 'Dhaka', to: 'Khulna', price: 800 }
];

const faqs = [
  {
    question: "আমি কীভাবে বাস টিকিট বুক করবো?",
    answer: "টিকিট বুক করা খুব সহজ। উপরের সার্চ ফর্মে কোথা থেকে, কোথায়, ভ্রমণের তারিখ ও পছন্দের সময় দিন। এরপর 'বাস খুঁজুন' ক্লিক করে বাস নির্বাচন করুন, সিট বেছে নিন এবং পেমেন্ট সম্পন্ন করুন। বুকিং কনফার্মেশন ইমেইল ও SMS-এ পাবেন।"
  },
  {
    question: "আমি কি টিকিট বাতিল করতে পারবো?",
    answer: "হ্যাঁ, যাত্রার ২ ঘণ্টা আগে পর্যন্ত টিকিট বাতিল করতে পারবেন। বাস অপারেটরের নীতিমালা অনুযায়ী ক্যান্সেল চার্জ প্রযোজ্য হতে পারে। আপনার অ্যাকাউন্টে লগইন করে 'আমার বুকিং' থেকে টিকিট বাতিল করুন।"
  },
  {
    question: "কোন কোন পেমেন্ট পদ্ধতি গ্রহণ করা হয়?",
    answer: "আমরা bKash, Nagad, Rocket, ক্রেডিট/ডেবিট কার্ড এবং মোবাইল ব্যাংকিংসহ একাধিক পেমেন্ট পদ্ধতি গ্রহণ করি। সব পেমেন্ট নিরাপদ ও এনক্রিপ্টেড।"
  },
  {
    question: "বুকিং করার পর টিকিট কীভাবে পাবো?",
    answer: "পেমেন্ট সফল হলে আপনার ই-টিকিট ইমেইল ও SMS-এ পাঠানো হবে। 'আমার বুকিং' থেকেও ডাউনলোড করতে পারবেন। বাসে ওঠার সময় ই-টিকিট (মোবাইল বা প্রিন্ট) দেখালেই হবে।"
  },
  {
    question: "আমি কি নিজের সিট পছন্দ করে নিতে পারবো?",
    answer: "হ্যাঁ। বুকিংয়ের সময় আপনি সিট লেআউট দেখতে পাবেন এবং পছন্দের সিট নির্বাচন করতে পারবেন। উইন্ডো সিট, আইল সিটসহ বিভিন্ন অপশন সিট খালি থাকলে পাবেন।"
  },
  {
    question: "বাস দেরি হলে কী হবে?",
    answer: "আমরা রিয়েল-টাইমে সব বাস ট্র্যাক করি। বাস দেরি হলে SMS-এর মাধ্যমে জানিয়ে দেওয়া হবে। বুকিংয়ের 'Track Bus' অপশন থেকেও লোকেশন দেখতে পারবেন।"
  },
  {
    question: "ছাত্র বা গ্রুপ বুকিংয়ে কি ছাড় আছে?",
    answer: "হ্যাঁ, বৈধ আইডি সহ শিক্ষার্থী এবং গ্রুপ বুকিংয়ের জন্য বিশেষ ছাড় রয়েছে। চলমান অফার ও ডিসকাউন্ট কোড দেখতে 'Offers' সেকশন দেখুন।"
  },
  {
    question: "কাস্টমার সাপোর্টে কীভাবে যোগাযোগ করবো?",
    answer: "আমাদের কাস্টমার সাপোর্ট ২৪/৭ সক্রিয়। +880 1234-567890 নম্বরে কল, support@busgo.com-এ ইমেইল, বা ওয়েবসাইটের লাইভ চ্যাটে যোগাযোগ করতে পারেন।"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const handleRouteClick = (from, to) => {
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen relative">
      
      {/* Chatbot is now in Navbar, so remove from here */}

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary to-primary/90 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              বাস টিকিট বুক করুন
              <span className="text-secondary block mt-2">যেকোনো সময়, যেকোনো জায়গা থেকে</span>
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              BusGo-এর সাথে আরামদায়ক ভ্রমণ করুন। শত শত বাস থেকে খুঁজুন,
              পছন্দের সিট নির্বাচন করুন এবং কয়েক মিনিটে বুকিং সম্পন্ন করুন।
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto">
            <SearchForm />
          </div>

        
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-secondary" />
                </div>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">কেন BusGo বেছে নেবেন?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              সেরা সেবা দিয়ে আমরা সেরা বাস বুকিং অভিজ্ঞতা দেই
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg text-primary mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">জনপ্রিয় রুট</h2>
            <p className="text-gray-600">আমাদের যাত্রীদের সবচেয়ে বেশি ভ্রমণ করা রুট</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoutes.map((route) => (
              <div
                key={`${route.from}-${route.to}`}
                onClick={() => handleRouteClick(route.from, route.to)}
                className="bg-background rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-primary">
                      {route.from} → {route.to}
                    </div>
                    <div className="text-sm text-gray-500">প্রতিদিন একাধিক বাস</div>
                  </div>
                </div>
                <div className="text-secondary font-bold">শুরু ৳{route.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">প্রায় জিজ্ঞাসিত প্রশ্ন</h2>
            <p className="text-gray-600">
              বুকিং, পেমেন্ট এবং ভ্রমণ সম্পর্কিত সাধারণ প্রশ্নের উত্তর জানুন
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-primary">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-secondary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-secondary" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              এখনও প্রশ্ন আছে?{' '}
              <button className="text-secondary font-semibold hover:underline">
                চ্যাটবটের সাথে কথা বলুন ন্যাভ মেনু থেকে
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">ভ্রমণ শুরু করতে প্রস্তুত?</h2>
          <p className="text-gray-200 mb-8">
            এখনই বাস টিকিট বুক করুন এবং আরামদায়ক ভ্রমণ উপভোগ করুন
          </p>
          <button
            onClick={() => {
              const searchForm = document.querySelector('form');
              if (searchForm) {
                searchForm.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/search');
              }
            }}
            className="inline-block bg-secondary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors"
          >
            বাস খুঁজুন
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
