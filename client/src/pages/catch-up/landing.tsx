import { Link } from "wouter";
import { Calendar, Phone, Star, Bot, Clock, MapPin, Shield } from "lucide-react";
import { AppButton } from "@/components/ui/catch-up/app-button";
import { AppCard, AppCardBody, AppCardHeader } from "@/components/ui/catch-up/app-card";

/**
 * Catch Up Landing Page
 * Showcase of the app's features with CTA to sign up
 */
export function CatchUpLandingPage() {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <header className="bg-catchup-primary px-4 py-3 md:py-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <Star className="h-6 w-6 text-catchup-accent" />
            </div>
            <span className="text-xl font-semibold text-white">Catch Up</span>
          </div>
          
          <nav className="hidden md:flex space-x-6 text-white">
            <a href="#features" className="hover:text-white/80">Features</a>
            <a href="#how-it-works" className="hover:text-white/80">How It Works</a>
            <a href="#pricing" className="hover:text-white/80">Pricing</a>
            <a href="#testimonials" className="hover:text-white/80">Testimonials</a>
          </nav>
          
          <div className="flex space-x-3">
            <Link href="/catch-up/login">
              <AppButton variant="outlined" className="border-white text-white hover:bg-white/10">
                Log In
              </AppButton>
            </Link>
            <Link href="/catch-up/signup" className="hidden md:inline-block">
              <AppButton variant="accent">
                Sign Up Free
              </AppButton>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-catchup-primary to-catchup-primary/90 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Never Miss a Call or Appointment Again
              </h1>
              <p className="text-xl mb-8 text-white/80">
                Catch Up is the all-in-one platform for freelancers and service providers to manage clients, appointments, and communications in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/catch-up/signup">
                  <AppButton variant="accent" size="lg" className="w-full sm:w-auto">
                    Start Free Trial
                  </AppButton>
                </Link>
                <a href="#features">
                  <AppButton variant="outlined" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    See Features
                  </AppButton>
                </a>
              </div>
            </div>
            
            <div className="hidden md:block bg-white p-6 rounded-xl shadow-xl">
              {/* Mock UI Preview */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-catchup-primary text-xl font-semibold">Your Dashboard</h2>
                <Clock className="h-5 w-5 text-catchup-primary" />
              </div>
              <div className="space-y-4">
                <div className="bg-catchup-primary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-catchup-primary" />
                      <span className="font-medium text-catchup-primary">Today's Appointments</span>
                    </div>
                    <span className="bg-catchup-primary text-white px-2 py-1 rounded-full text-xs">3</span>
                  </div>
                </div>
                <div className="bg-catchup-primary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-catchup-primary" />
                      <span className="font-medium text-catchup-primary">Missed Calls</span>
                    </div>
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">2</span>
                  </div>
                </div>
                <div className="bg-catchup-primary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-catchup-primary" />
                      <span className="font-medium text-catchup-primary">AI Suggestions</span>
                    </div>
                    <span className="bg-catchup-accent text-catchup-primary px-2 py-1 rounded-full text-xs">5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-catchup-primary mb-12">
            Features That Make Your Work Easier
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AppCard>
              <AppCardHeader
                title="Smart Calendar"
                icon={<Calendar className="h-5 w-5" />}
              />
              <AppCardBody>
                <p className="text-catchup-text-secondary">
                  Intelligent scheduling that prevents double-bookings and sends automatic reminders to clients, reducing no-shows by up to 80%.
                </p>
              </AppCardBody>
            </AppCard>
            
            <AppCard>
              <AppCardHeader
                title="Call Management"
                icon={<Phone className="h-5 w-5" />}
              />
              <AppCardBody>
                <p className="text-catchup-text-secondary">
                  Never miss an important call again. Catch Up logs all calls, enables quick callbacks, and can even send automated responses.
                </p>
              </AppCardBody>
            </AppCard>
            
            <AppCard>
              <AppCardHeader
                title="AI Assistant"
                icon={<Bot className="h-5 w-5" />}
              />
              <AppCardBody>
                <p className="text-catchup-text-secondary">
                  Let our AI help manage your business with smart suggestions, automated responses, and optimized scheduling recommendations.
                </p>
              </AppCardBody>
            </AppCard>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-catchup-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers and service providers who have transformed their business with Catch Up.
          </p>
          <Link href="/catch-up/signup">
            <AppButton variant="accent" size="lg">
              Sign Up Free Today
            </AppButton>
          </Link>
          <p className="mt-4 text-white/70">No credit card required. Free 14-day trial.</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Star className="h-4 w-4 text-catchup-accent" />
                </div>
                <span className="text-lg font-semibold">Catch Up</span>
              </div>
              <p className="text-gray-400">
                The all-in-one platform for service professionals to manage their business.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Testimonials</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Catch Up. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}