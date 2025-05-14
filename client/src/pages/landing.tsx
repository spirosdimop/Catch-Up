import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ArrowRight, Bot, CheckCircle, Clock, Globe, Mail, User, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === "full-name" ? "fullName" : id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send registration request to backend
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email, // Use email as username
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          const errorMessage = data.errors.map((err: any) => err.message).join(', ');
          throw new Error(errorMessage || data.message || 'Registration failed');
        }
        throw new Error(data.message || 'Registration failed');
      }
      
      toast({
        title: "Success!",
        description: "Your account has been created. Welcome to FreelanceFlow!",
        variant: "default"
      });
      
      // Clear the form
      setFormData({
        fullName: "",
        email: "",
        password: ""
      });
      
      // Redirect to login or dashboard after a delay
      setTimeout(() => {
        window.location.href = '/login'; // Redirect to login page
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-background">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FreelanceFlow</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <a href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </a>
          <a href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </a>
          <a href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
            Testimonials
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/catchup">
            <Button variant="outline" size="sm" className="bg-blue-50 text-[#0F1D3A] hover:bg-blue-100">
              Try Catch Up
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">
              Sign up
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-[#0F1D3A] to-[#172B52] text-white">
        <div className="container px-4 md:px-6 space-y-10 md:space-y-16">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-[#1E3A70] px-3 py-1 text-sm text-white">
              Freelancer Management Platform
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Everything You Need to Manage Your Freelance Business
            </h1>
            <p className="max-w-[700px] text-blue-200 md:text-xl">
              Streamline client management, project tracking, invoicing, and scheduling with our all-in-one platform designed for freelancers.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="px-8 bg-white text-[#0F1D3A] hover:bg-blue-100">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="px-8 text-white border-white hover:bg-[#1E3A70]">
                  Explore Features
                </Button>
              </a>
            </div>
          </div>
          <div className="mx-auto flex justify-center">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-[#1E3A70] bg-[#0F1D3A] shadow-xl">
              <div className="aspect-[16/9] flex items-center justify-center">
                <img 
                  src="/attached_assets/Screenshot 2025-05-13 at 9.24.26 AM.png" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-[#0F1D3A] font-medium">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#0F1D3A]">
                Everything You Need in One Platform
              </h2>
              <p className="max-w-[700px] text-gray-600 md:text-xl">
                Our comprehensive suite of tools helps you manage clients, track time, send invoices, and schedule meetings effortlessly.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-blue-100 p-6 shadow-md bg-white hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-full bg-blue-50">
                <Users className="h-10 w-10 text-[#0F1D3A]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F1D3A]">Client Management</h3>
              <p className="text-sm text-gray-600 text-center">
                Keep all client information organized and easily accessible in one place.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-blue-100 p-6 shadow-md bg-white hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-full bg-blue-50">
                <Clock className="h-10 w-10 text-[#0F1D3A]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F1D3A]">Time Tracking</h3>
              <p className="text-sm text-gray-600 text-center">
                Track time spent on projects and tasks to ensure accurate billing.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-blue-100 p-6 shadow-md bg-white hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-full bg-blue-50">
                <svg 
                  className="h-10 w-10 text-[#0F1D3A]" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0F1D3A]">Invoicing</h3>
              <p className="text-sm text-gray-600 text-center">
                Create and send professional invoices to clients with ease.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-blue-100 p-6 shadow-md bg-white hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-full bg-blue-50">
                <svg 
                  className="h-10 w-10 text-[#0F1D3A]" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0F1D3A]">Scheduling</h3>
              <p className="text-sm text-gray-600 text-center">
                Manage appointments and meetings with an integrated calendar.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-blue-100 p-6 shadow-md bg-white hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-full bg-blue-50">
                <svg 
                  className="h-10 w-10 text-[#0F1D3A]" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0F1D3A]">Project Tracking</h3>
              <p className="text-sm text-gray-600 text-center">
                Keep track of project progress, deadlines, and deliverables.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-blue-100 p-6 shadow-md bg-white hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-full bg-blue-50">
                <Globe className="h-10 w-10 text-[#0F1D3A]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F1D3A]">Client Portal</h3>
              <p className="text-sm text-gray-600 text-center">
                Let clients book appointments and view project progress through a dedicated portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24 bg-[#F0F5FF]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-white px-3 py-1 text-sm text-[#0F1D3A] font-medium">
                Pricing
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#0F1D3A]">
                Simple, Transparent Pricing
              </h2>
              <p className="max-w-[700px] text-gray-600 md:text-xl">
                Choose the plan that works best for your freelance business.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-8">
            {/* Free Plan */}
            <div className="flex flex-col overflow-hidden rounded-lg border-2 border-blue-100 bg-white shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#0F1D3A]">Free</h3>
                <div className="mt-4 text-4xl font-bold text-[#0F1D3A]">$0</div>
                <p className="mt-1 text-sm text-gray-500">Forever free</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">5 clients</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Basic project tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Simple invoicing</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Calendar management</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/signup">
                    <Button className="w-full bg-[#0F1D3A] hover:bg-[#172B52] text-white">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="flex flex-col overflow-hidden rounded-lg border-2 border-blue-300 bg-white shadow-lg relative scale-105 z-10">
              <div className="absolute top-0 right-0 bg-[#0F1D3A] px-3 py-1 text-xs font-medium text-white rounded-bl-lg">
                Popular
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#0F1D3A]">Pro</h3>
                <div className="mt-4 text-4xl font-bold text-[#0F1D3A]">$19</div>
                <p className="mt-1 text-sm text-gray-500">Per month, billed monthly</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Unlimited clients</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Advanced project tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Custom invoices</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Time tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Client portal</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/signup">
                    <Button className="w-full bg-[#0F1D3A] hover:bg-[#172B52] text-white">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Business Plan */}
            <div className="flex flex-col overflow-hidden rounded-lg border-2 border-blue-100 bg-white shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#0F1D3A]">Business</h3>
                <div className="mt-4 text-4xl font-bold text-[#0F1D3A]">$49</div>
                <p className="mt-1 text-sm text-gray-500">Per month, billed monthly</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Everything in Pro</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Team management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Advanced reporting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">API access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Priority support</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/signup">
                    <Button className="w-full bg-[#0F1D3A] hover:bg-[#172B52] text-white">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-[#0F1D3A] font-medium">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#0F1D3A]">
                Trusted by Freelancers Worldwide
              </h2>
              <p className="max-w-[700px] text-gray-600 md:text-xl">
                See what other freelancers are saying about our platform.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {/* Testimonial 1 */}
            <div className="flex flex-col space-y-2 rounded-lg border-2 border-blue-100 p-6 shadow-md bg-white hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">
                "This platform has completely transformed how I manage my freelance business. I've saved hours on admin tasks and can focus on what I do best."
              </p>
              <div className="flex items-center pt-4 border-t border-blue-50 mt-4">
                <div className="h-10 w-10 rounded-full bg-[#0F1D3A] text-white flex items-center justify-center font-bold">SJ</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#0F1D3A]">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Web Designer</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="flex flex-col space-y-2 rounded-lg border-2 border-blue-100 p-6 shadow-md bg-white hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">
                "The invoicing and payment tracking features alone are worth the subscription. My cash flow has improved significantly since I started using this platform."
              </p>
              <div className="flex items-center pt-4 border-t border-blue-50 mt-4">
                <div className="h-10 w-10 rounded-full bg-[#0F1D3A] text-white flex items-center justify-center font-bold">DC</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#0F1D3A]">David Chen</p>
                  <p className="text-xs text-gray-500">Digital Marketer</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="flex flex-col space-y-2 rounded-lg border-2 border-blue-100 p-6 shadow-md bg-white hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">
                "The scheduling tool has eliminated the back-and-forth emails with clients. They can now book appointments directly through my profile page."
              </p>
              <div className="flex items-center pt-4 border-t border-blue-50 mt-4">
                <div className="h-10 w-10 rounded-full bg-[#0F1D3A] text-white flex items-center justify-center font-bold">JM</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#0F1D3A]">Emily Rodriguez</p>
                  <p className="text-xs text-gray-500">Consultant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up Section */}
      <section className="w-full py-16 bg-[#F0F5FF]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-[#0F1D3A] font-medium">
                Join our community
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-[#0F1D3A]">
                Sign Up Today and Transform Your Freelance Business
              </h2>
              <p className="text-gray-600 md:text-lg">
                Create your account in seconds and start managing your freelance business more efficiently. Our platform helps you save time, stay organized, and focus on what you do best.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
                  <span>Free 14-day trial, no credit card required</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
                  <span>Quick and easy setup process</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
                  <span>Access to all features during trial</span>
                </li>
              </ul>
            </div>
            <div className="w-full lg:w-1/2">
              <Card className="p-6 shadow-lg border-2 border-blue-100">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-1">
                    <Label htmlFor="full-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="full-name" 
                        placeholder="John Doe" 
                        className="pl-10"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        className="pl-10"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#0F1D3A] hover:bg-[#172B52] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Creating your account..."
                    ) : (
                      <>
                        Create Free Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-gray-500">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-[#0F1D3A] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                Ready to Streamline Your Freelance Business?
              </h2>
              <p className="max-w-[700px] md:text-xl text-blue-200">
                Join thousands of freelancers who have transformed their workflow with our platform.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <Link href="/signup">
                <Button size="lg" className="px-8 bg-white text-[#0F1D3A] hover:bg-blue-100 text-lg font-medium">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 bg-[#0F1D3A] text-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center border-t border-blue-800 pt-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Bot className="h-6 w-6 text-white mr-2" />
              <span className="text-xl font-bold text-white">FreelanceFlow</span>
            </div>
            <p className="text-sm text-blue-200 mb-4 md:mb-0">
              © 2025 FreelanceFlow. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}