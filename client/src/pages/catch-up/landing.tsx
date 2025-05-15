import { Link } from "wouter";
import { 
  Star, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Users, 
  Phone,
  CheckCircle,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { AppButton } from "@/components/ui/catch-up/app-button";
import { AppCard } from "@/components/ui/catch-up/app-card";
import { ServiceCard } from "@/components/ui/catch-up/service-card";

/**
 * Catch Up Landing Page
 */
export default function CatchUpLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-catchup-primary sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Star className="h-5 w-5 text-catchup-accent" />
                </div>
                <span className="text-lg font-semibold text-white">Catch Up</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/catch-up">
                <span className="text-white hover:text-white/80 font-medium cursor-pointer">Home</span>
              </Link>
              <Link href="/catch-up/features">
                <span className="text-white/90 hover:text-white font-medium cursor-pointer">Features</span>
              </Link>
              <Link href="/catch-up/pricing">
                <span className="text-white/90 hover:text-white font-medium cursor-pointer">Pricing</span>
              </Link>
              <Link href="/catch-up/contact">
                <span className="text-white/90 hover:text-white font-medium cursor-pointer">Contact</span>
              </Link>
            </nav>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/catch-up/login">
                <span className="text-white hover:text-white/80 font-medium cursor-pointer">Log in</span>
              </Link>
              <Link href="/catch-up/signup">
                <AppButton variant="accent" size="sm">
                  Sign up
                </AppButton>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-catchup-primary border-t border-white/10 py-4">
            <div className="container mx-auto px-4 space-y-3">
              <Link href="/catch-up">
                <span className="block text-white hover:text-white/80 font-medium py-2 cursor-pointer">Home</span>
              </Link>
              <Link href="/catch-up/features">
                <span className="block text-white/90 hover:text-white font-medium py-2 cursor-pointer">Features</span>
              </Link>
              <Link href="/catch-up/pricing">
                <span className="block text-white/90 hover:text-white font-medium py-2 cursor-pointer">Pricing</span>
              </Link>
              <Link href="/catch-up/contact">
                <span className="block text-white/90 hover:text-white font-medium py-2 cursor-pointer">Contact</span>
              </Link>
              <div className="pt-3 flex flex-col space-y-3">
                <Link href="/catch-up/login">
                  <span className="block text-white hover:text-white/80 font-medium py-2 cursor-pointer">Log in</span>
                </Link>
                <Link href="/catch-up/signup">
                  <AppButton variant="accent" size="sm" fullWidth>
                    Sign up
                  </AppButton>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Hero Section */}
      <section className="bg-catchup-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Manage Your Business, Anywhere, Anytime
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Catch Up is your all-in-one solution for managing appointments, clients, and communications in one seamless platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/catch-up/signup">
                  <AppButton variant="accent" size="lg" className="w-full sm:w-auto" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                    Get Started
                  </AppButton>
                </Link>
                <Link href="/catch-up/demo">
                  <AppButton variant="outlined" size="lg" className="w-full sm:w-auto border-white text-white">
                    See a Demo
                  </AppButton>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm opacity-80">
                <CheckCircle className="h-4 w-4 text-catchup-accent" />
                <span>No credit card required</span>
                <span className="mx-2">•</span>
                <CheckCircle className="h-4 w-4 text-catchup-accent" />
                <span>14-day free trial</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-6 shadow-xl relative">
                <div className="absolute -left-4 -top-4 bg-catchup-accent rounded-full p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <img 
                  src="https://placehold.co/500x400/0A2540/FFFFFF?text=App+Screenshot" 
                  alt="Catch Up App Interface" 
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-catchup-primary mb-4">All-in-One Business Management</h2>
            <p className="text-catchup-text-secondary text-lg max-w-2xl mx-auto">
              Everything you need to streamline operations, increase bookings, and delight your clients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Calendar className="h-6 w-6" />}
              title="Smart Scheduling"
              description="Manage your appointments with an intuitive calendar interface. Send automated reminders to reduce no-shows."
            />
            <FeatureCard 
              icon={<MessageSquare className="h-6 w-6" />}
              title="Client Communication"
              description="Keep in touch with your clients through in-app messaging. Send updates, reminders, and personalized offers."
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Client Management"
              description="Store client information securely and access their history instantly. Build better relationships with personalized service."
            />
            <FeatureCard 
              icon={<Phone className="h-6 w-6" />}
              title="Call Tracking"
              description="Never miss an important call. Log calls and set follow-up reminders to stay on top of client needs."
            />
            <FeatureCard 
              icon={<Star className="h-6 w-6" />}
              title="Service Management"
              description="Create and manage your service offerings with custom pricing, duration, and availability settings."
            />
            <FeatureCard 
              icon={<Clock className="h-6 w-6" />}
              title="Time Tracking"
              description="Track time spent on clients and projects. Generate detailed reports for billing and business insights."
            />
          </div>
        </div>
      </section>
      
      {/* Services Showcase */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-catchup-primary mb-4">Perfect for Service Professionals</h2>
            <p className="text-catchup-text-secondary text-lg max-w-2xl mx-auto">
              Whether you're a freelancer or small business owner, Catch Up adapts to your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              name="Beauty Services"
              duration={60}
              price={75}
              description="Hair styling, makeup, nail care, and other beauty services."
              icon={<Star className="h-5 w-5" />}
              onBook={() => console.log("Book beauty service")}
              onDetails={() => console.log("View beauty service details")}
            />
            <ServiceCard
              name="Home Repair"
              duration={120}
              price={150}
              description="Plumbing, electrical, carpentry, and general home repairs."
              icon={<Star className="h-5 w-5" />}
              onBook={() => console.log("Book home repair")}
              onDetails={() => console.log("View home repair details")}
            />
            <ServiceCard
              name="Consulting"
              duration={90}
              price={200}
              description="Business strategy, marketing, and professional consulting."
              icon={<Star className="h-5 w-5" />}
              onBook={() => console.log("Book consulting")}
              onDetails={() => console.log("View consulting details")}
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-catchup-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Thousands of businesses trust Catch Up to manage their daily operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Catch Up has completely transformed how I run my salon. I've reduced no-shows by 60% with automated reminders!"
              author="Sarah J."
              role="Hair Stylist"
            />
            <TestimonialCard
              quote="As a freelance consultant, keeping track of clients was a nightmare until I found Catch Up. Now everything is organized in one place."
              author="Michael T."
              role="Business Consultant"
            />
            <TestimonialCard
              quote="The calendar and client management features have saved me countless hours. I can focus on my work instead of paperwork."
              author="Elena R."
              role="Interior Designer"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-catchup-primary mb-4">Ready to Get Started?</h2>
          <p className="text-catchup-text-secondary text-lg max-w-2xl mx-auto mb-8">
            Join thousands of professionals who are streamlining their business operations with Catch Up.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catch-up/signup">
              <AppButton variant="filled" size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                Start Free Trial
              </AppButton>
            </Link>
            <Link href="/catch-up/demo">
              <AppButton variant="outlined" size="lg">
                Request a Demo
              </AppButton>
            </Link>
          </div>
          <p className="mt-4 text-sm text-catchup-text-secondary">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Star className="h-5 w-5 text-catchup-accent" />
                </div>
                <span className="text-lg font-semibold">Catch Up</span>
              </div>
              <p className="text-gray-400 mb-4">
                The all-in-one business management platform for service professionals.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Legal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-gray-400 text-sm">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} Catch Up. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
                <a href="#" className="hover:text-white">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <AppCard className="h-full">
      <div className="p-6">
        <div className="h-12 w-12 rounded-full bg-catchup-primary/10 flex items-center justify-center mb-4">
          <div className="text-catchup-primary">{icon}</div>
        </div>
        <h3 className="text-xl font-semibold text-catchup-primary mb-3">{title}</h3>
        <p className="text-catchup-text-secondary">{description}</p>
      </div>
    </AppCard>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role }: { quote: string, author: string, role: string }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-[20px]">
      <div className="mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="inline-block h-5 w-5 text-catchup-accent mr-1" fill="currentColor" />
        ))}
      </div>
      <p className="mb-4 text-white/90">{quote}</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm opacity-80">{role}</p>
      </div>
    </div>
  );
};