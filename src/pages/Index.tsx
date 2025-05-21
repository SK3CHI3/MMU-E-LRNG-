
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, Book, Users, ArrowRight, Award, Globe, Lightbulb } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-purple-700 mr-2">✓</span>
                <span>MMU Digital Campus Experience</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Elevating Learning,<br /> Empowering Futures
              </h1>
              <p className="text-lg md:text-xl text-gray-200">
                Welcome to MMU's digital campus platform. Access your courses, resources, 
                and academic tools all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
                  <Link to="/login">Login to Portal</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full opacity-20 blur-3xl absolute -z-10"></div>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 shadow-xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Book className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Courses</p>
                        <p className="font-semibold">50+</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Students</p>
                        <p className="font-semibold">8,000+</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Programs</p>
                        <p className="font-semibold">25+</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Network</p>
                        <p className="font-semibold">Global</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All-in-One Learning Experience
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in your academic journey, accessible anytime, anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                <GraduationCap className="h-7 w-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Digital Classroom</h3>
              <p className="text-gray-600">
                Access course materials, attend virtual classes, and participate in discussions all in one place.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                <Book className="h-7 w-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Resource Library</h3>
              <p className="text-gray-600">
                A vast collection of e-books, journals, and academic resources to support your research.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                <Lightbulb className="h-7 w-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AI Study Assistant</h3>
              <p className="text-gray-600">
                Get personalized academic support with our AI-powered study assistant, Comrade AI.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="default" className="bg-purple-700 hover:bg-purple-800">
              <Link to="/login" className="inline-flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-purple-600">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="text-xl font-bold text-white">MMU LMS</div>
              </div>
              <p className="max-w-xs opacity-75">
                Multimedia University of Kenya's official digital learning management system.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Links</h4>
                <ul className="space-y-3">
                  <li><a href="https://www.mmu.ac.ke" target="_blank" rel="noopener noreferrer" className="opacity-75 hover:opacity-100 transition">Main Website</a></li>
                  <li><a href="#" className="opacity-75 hover:opacity-100 transition">Library</a></li>
                  <li><a href="#" className="opacity-75 hover:opacity-100 transition">Academic Calendar</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4">Resources</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="opacity-75 hover:opacity-100 transition">Help Center</a></li>
                  <li><a href="#" className="opacity-75 hover:opacity-100 transition">FAQs</a></li>
                  <li><a href="#" className="opacity-75 hover:opacity-100 transition">Student Guide</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4">Contact</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="opacity-75 hover:opacity-100 transition">support@mmu.ac.ke</a></li>
                  <li><a href="#" className="opacity-75 hover:opacity-100 transition">+254 020 XXX XXXX</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm opacity-75">
            <p>© {new Date().getFullYear()} Multimedia University of Kenya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
