import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Star, 
  MessageSquare, 
  PhoneCall, 
  Calendar, 
  Bot, 
  User, 
  CheckCircle,
  ThumbsUp,
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin,
  Globe
} from "lucide-react";

export default function NewLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with navigation */}
      <header className="w-full py-4 px-4 md:px-6 border-b sticky top-0 bg-white z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-catchup-primary" />
            <span className="text-xl font-semibold text-catchup-primary">Catch Up</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900">How It Works</a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">Features</a>
            <a href="#for-who" className="text-sm font-medium text-gray-600 hover:text-gray-900">For Who</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900">Testimonials</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</a>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-catchup-primary text-white hover:bg-catchup-primary/90">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero section */}
        <section className="py-16 md:py-24 bg-catchup-primary text-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Never Miss a Client Again.</h1>
              <p className="text-xl text-blue-100 mb-8">Catch Up handles missed calls, messages, and bookings — automatically.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-catchup-primary hover:bg-gray-100 w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-catchup-primary/90 w-full sm:w-auto">
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Mobile app mockup */}
            <div className="mt-12 flex justify-center">
              <div className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
                <div className="aspect-[9/16] bg-catchup-secondary/10 flex items-center justify-center rounded-xl p-8">
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                    <PhoneCall className="h-16 w-16 text-catchup-primary/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section id="how-it-works" className="py-16 md:py-24 border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-catchup-primary mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Three simple steps to never miss a client again</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-catchup-primary/10 rounded-full flex items-center justify-center mb-4">
                  <PhoneCall className="h-8 w-8 text-catchup-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Connect Your Phone & Calendar</h3>
                <p className="text-gray-600">Link your business phone and calendar to start catching missed opportunities</p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-catchup-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-catchup-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Let Catch Up Respond to Missed Calls</h3>
                <p className="text-gray-600">Automatic SMS responses keep clients engaged when you're busy</p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-catchup-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-catchup-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Clients Book While You Work</h3>
                <p className="text-gray-600">Your shared calendar lets clients book appointments 24/7</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-16 md:py-24 bg-gray-50 border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-catchup-primary mb-4">Features Overview</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to grow your business while staying focused on your work</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-catchup-primary/10 rounded-full flex items-center justify-center mr-3">
                    <PhoneCall className="h-5 w-5 text-catchup-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Missed call detection + auto SMS</h3>
                </div>
                <p className="text-gray-600">Never miss a client when you're busy. Auto-respond with a professional message.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-catchup-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-catchup-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Live booking calendar</h3>
                </div>
                <p className="text-gray-600">Let clients book appointments without back-and-forth phone calls or messages.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-catchup-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Bot className="h-5 w-5 text-catchup-primary" />
                  </div>
                  <h3 className="text-lg font-bold">AI assistant for follow-ups</h3>
                </div>
                <p className="text-gray-600">Smart follow-up messages ensure clients stay engaged even when you're busy.</p>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-catchup-primary/10 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-catchup-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Public profile for clients</h3>
                </div>
                <p className="text-gray-600">Professional online presence that builds trust with new and existing clients.</p>
              </div>
              
              {/* Feature 5 */}
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-catchup-primary/10 rounded-full flex items-center justify-center mr-3">
                    <ThumbsUp className="h-5 w-5 text-catchup-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Reviews + loyalty tracking</h3>
                </div>
                <p className="text-gray-600">Collect reviews and reward loyal clients to build a stronger business.</p>
              </div>
              
              {/* Feature 6 - CTA */}
              <div className="bg-catchup-primary p-6 rounded-xl text-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-4">Ready to catch more clients?</h3>
                <p className="mb-6">Start your 14-day free trial today.</p>
                <Link href="/signup">
                  <Button className="bg-white text-catchup-primary hover:bg-gray-100 w-full">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* For who section */}
        <section id="for-who" className="py-16 md:py-24 border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-catchup-primary mb-4">For Who?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Catch Up is built for every hands-on professional</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {/* Profession 1 */}
              <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold">Electricians</h3>
              </div>
              
              {/* Profession 2 */}
              <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-bold">Tutors</h3>
              </div>
              
              {/* Profession 3 */}
              <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold">Plumbers</h3>
              </div>
              
              {/* Profession 4 */}
              <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-bold">Fitness Coaches</h3>
              </div>
              
              {/* Profession 5 */}
              <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold">Freelancers</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section id="testimonials" className="py-16 md:py-24 bg-gray-50 border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-catchup-primary mb-4">What Our Users Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Hear from professionals who've transformed their business with Catch Up</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-gray-700 mb-6">"Catch Up has been a game changer for my plumbing business. I used to miss 5-10 calls a day while on jobs. Now those calls turn into bookings automatically."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 mr-4 flex-shrink-0 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">MJ</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Mike Johnson</h4>
                    <p className="text-sm text-gray-500">Johnson Plumbing Services</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-gray-700 mb-6">"As a tutor, I'm always with students and can't answer calls. Catch Up responds for me and lets parents book lessons directly - my schedule is now always full!"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 mr-4 flex-shrink-0 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">SD</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah Davis</h4>
                    <p className="text-sm text-gray-500">Math & Science Tutor</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-gray-700 mb-6">"The automated follow-ups are brilliant. I've seen a 30% increase in jobs since using Catch Up - clients love how responsive my business seems."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 mr-4 flex-shrink-0 flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">RT</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Robert Thompson</h4>
                    <p className="text-sm text-gray-500">Elite Electrical Services</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing section */}
        <section id="pricing" className="py-16 md:py-24 border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-catchup-primary mb-4">Simple Pricing</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Free to try. Upgrade only when you're ready to scale.</p>
            </div>
            
            <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
              {/* Free Plan */}
              <div className="bg-white p-8 rounded-xl border shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Free Starter</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-gray-500 ml-2">/ month</span>
                  </div>
                  <p className="text-gray-600 mt-2">Perfect for trying out Catch Up</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Up to 25 missed call responses per month</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Basic booking calendar</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Simple client profile</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Email support</span>
                  </li>
                </ul>
                
                <Link href="/signup">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
              
              {/* Pro Plan */}
              <div className="bg-catchup-primary text-white p-8 rounded-xl shadow-xl relative">
                <div className="absolute top-0 right-0 bg-catchup-accent text-catchup-primary px-3 py-1 text-xs font-bold rounded-bl-lg rounded-tr-lg">
                  POPULAR
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">$19</span>
                    <span className="text-blue-100 ml-2">/ month</span>
                  </div>
                  <p className="text-blue-100 mt-2">For growing businesses</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-catchup-accent mr-2 flex-shrink-0 mt-0.5" />
                    <span>Unlimited missed call responses</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-catchup-accent mr-2 flex-shrink-0 mt-0.5" />
                    <span>Advanced booking with customization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-catchup-accent mr-2 flex-shrink-0 mt-0.5" />
                    <span>AI-powered follow-ups</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-catchup-accent mr-2 flex-shrink-0 mt-0.5" />
                    <span>Client review collection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-catchup-accent mr-2 flex-shrink-0 mt-0.5" />
                    <span>Priority phone & email support</span>
                  </li>
                </ul>
                
                <Link href="/signup">
                  <Button className="w-full bg-white text-catchup-primary hover:bg-gray-100">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-bold text-catchup-primary mb-4">Ready to never miss a client again?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of professionals who've transformed their business with Catch Up.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-catchup-primary text-white hover:bg-catchup-primary/90">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container px-4 md:px-6 mx-auto">
          {/* Logo, tagline and social icons */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-8">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-6 w-6 text-catchup-primary" />
                <span className="text-xl font-semibold text-catchup-primary">Catch Up</span>
              </div>
              <p className="text-gray-600">Made for freelancers and service professionals</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-gray-900">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-gray-900">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-500 hover:text-gray-900">
                <Youtube size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-gray-900">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Footer links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-500 hover:text-gray-900">Features</a></li>
                <li><a href="#pricing" className="text-gray-500 hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">API</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Integration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">About</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Community</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Webinars</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Partners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Cookies</a></li>
                <li>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <select className="bg-transparent border-gray-300 rounded-md text-sm">
                      <option>English</option>
                      <option>Español</option>
                      <option>Français</option>
                    </select>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t pt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Catch Up. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}