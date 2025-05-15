import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, MessageSquare, Twitter, Instagram, Youtube, Linkedin, Github } from "lucide-react";

export default function NewLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with navigation */}
      <header className="w-full py-4 px-4 md:px-6 border-b sticky top-0 bg-white z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-catchup-primary" />
            <span className="text-xl font-semibold text-catchup-primary">FreelanceFlow</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#products" className="text-sm font-medium text-gray-600 hover:text-gray-900">Products</a>
            <a href="#solutions" className="text-sm font-medium text-gray-600 hover:text-gray-900">Solutions</a>
            <a href="#community" className="text-sm font-medium text-gray-600 hover:text-gray-900">Community</a>
            <a href="#resources" className="text-sm font-medium text-gray-600 hover:text-gray-900">Resources</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900">Contact</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Link</a>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-black text-white hover:bg-gray-800">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero section with title, subtitle and buttons */}
        <section className="py-16 md:py-24 border-b border-pink-200">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold tracking-tighter mb-4">Title</h1>
              <p className="text-xl text-gray-500 mb-8">Subtitle</p>
              <div className="flex gap-4">
                <Button variant="outline" size="lg">Button</Button>
                <Button size="lg" className="bg-black text-white hover:bg-gray-800">Button</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Image placeholder section */}
        <section className="py-24 bg-gray-100 border-b border-pink-200">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex justify-center">
              <div className="w-full max-w-lg rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16L8.58579 11.4142C9.36683 10.6332 10.6332 10.6332 11.4142 11.4142L16 16M14 14L15.5858 12.4142C16.3668 11.6332 17.6332 11.6332 18.4142 12.4142L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="py-16 md:py-24 border-b border-pink-200">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold">Heading</h2>
              <p className="text-gray-500 mt-2">Subheading</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* First row of quotes */}
              {[1, 2, 3].map((index) => (
                <div key={`quote-${index}`} className="border rounded-lg p-6">
                  <p className="font-medium mb-4">"Quote"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Title</h4>
                      <p className="text-sm text-gray-500">Description</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Second row of quotes */}
              {[4, 5, 6].map((index) => (
                <div key={`quote-${index}`} className="border rounded-lg p-6">
                  <p className="font-medium mb-4">"Quote"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium">Title</h4>
                      <p className="text-sm text-gray-500">Description</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer with links and resources */}
      <footer className="py-12 border-t">
        <div className="container px-4 md:px-6 mx-auto">
          {/* Logo and social icons */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-8">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-catchup-primary" />
                <span className="text-xl font-semibold text-catchup-primary">FreelanceFlow</span>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Use cases</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">UI design</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">UX design</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Wireframing</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Diagramming</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Brainstorming</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Online whiteboard</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Team collaboration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Design</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Prototyping</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Development features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Design systems</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Collaboration features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Design process</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Figma</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Best practices</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Colors</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Color wheel</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Support</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Developers</a></li>
                <li><a href="#" className="text-gray-500 hover:text-gray-900">Resource library</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}