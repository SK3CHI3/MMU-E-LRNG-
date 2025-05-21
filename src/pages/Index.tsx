
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  GraduationCap,
  Book,
  Users,
  ArrowRight,
  Award,
  Globe,
  Lightbulb,
  Clock,
  MessageSquare,
  BarChart4,
  Brain,
  Laptop,
  Zap,
  Clock as Clock24,
  Smartphone,
  Moon,
  Sun
} from "lucide-react";
import { useState, useEffect } from "react";
import { initScrollAnimations } from "@/utils/scrollAnimations";

const Index = () => {
  // Initialize scroll animations
  useEffect(() => {
    const cleanup = initScrollAnimations();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Glass Metamorphic Header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-4 py-4">
          <header className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg py-4 px-6 mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-xl text-primary dark:text-white">MMU Digital Campus</h1>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">Multimedia University</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <Button asChild size="sm" variant="outline" className="border-primary/30 text-primary dark:border-white/30 dark:text-white hover:bg-primary/10 dark:hover:bg-white/10 transition-all duration-300 hover-lift text-xs md:text-sm px-2 md:px-3">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90 transition-all duration-300 hover-lift text-xs md:text-sm px-2 md:px-3">
                    <Link to="/register">Sign Up</Link>
                  </Button>
                  <div className="hidden md:block">
                    <a href="#" className="text-sm text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-white transition-all duration-300">
                      Help
                    </a>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-24"></div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwYzkuOTQgMCAxOCA4LjA2IDE4IDE4aDEyYzAgOS45NCA4LjA2IDE4IDE4IDE4djEyYy05Ljk0IDAtMTgtOC4wNi0xOC0xOEgzNnoiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvZz48L3N2Zz4=')]"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium animate-fadeInDown">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-primary mr-2 animate-subtlePulse">✓</span>
                <span>MMU Digital Campus Experience</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-fadeInUp">
                Elevating Learning,<br /> <span className="text-accent">Empowering Futures</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-100 animate-fadeInUp animation-delay-200">
                Experience modern education redefined with AI-powered learning, real-time progress,
                and effortless collaboration.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 animate-fadeInUp animation-delay-400">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 transition-all duration-300 hover:shadow-md hover-lift w-full sm:w-auto">
                  <Link to="/login" className="flex items-center justify-center">
                    <span>Login</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 transition-all duration-300 hover:shadow-md hover-lift w-full sm:w-auto">
                  <Link to="/register" className="flex items-center justify-center">
                    <span>Sign Up</span>
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="bg-primary/20 text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-md hover-lift w-full sm:w-auto">
                  <Link to="/dashboard" className="flex items-center justify-center">
                    <span>Explore as Guest</span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-tr from-accent/30 to-white/20 rounded-full opacity-20 blur-3xl absolute -z-10"></div>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl shadow-xl overflow-hidden">
                  {/* Public Notifications Section */}
                  <div className="bg-accent/20 backdrop-blur p-3 border-b border-white/10">
                    <h4 className="font-medium text-white flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-accent animate-subtlePulse mr-2"></span>
                      Public Notifications
                    </h4>
                    <div className="mt-2 max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      <div className="py-2 border-b border-white/10 animate-fadeIn">
                        <p className="text-sm text-white/90">Registration for Fall 2023 semester is now open</p>
                        <p className="text-xs text-white/70 mt-1">Posted 2 days ago</p>
                      </div>
                      <div className="py-2 border-b border-white/10 animate-fadeIn animation-delay-200">
                        <p className="text-sm text-white/90">New AI Learning Assistant features available</p>
                        <p className="text-xs text-white/70 mt-1">Posted 5 days ago</p>
                      </div>
                      <div className="py-2 animate-fadeIn animation-delay-400">
                        <p className="text-sm text-white/90">Campus maintenance scheduled for next weekend</p>
                        <p className="text-xs text-white/70 mt-1">Posted 1 week ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-6 p-6">
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg flex items-center gap-4 transition-all duration-300 hover:bg-white/15 hover-bright">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Book className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Courses</p>
                        <p className="font-semibold animate-countUp">50+</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg flex items-center gap-4 transition-all duration-300 hover:bg-white/15 hover-bright">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Students</p>
                        <p className="font-semibold animate-countUp">8,000+</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg flex items-center gap-4 transition-all duration-300 hover:bg-white/15 hover-bright">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Programs</p>
                        <p className="font-semibold animate-countUp">25+</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg flex items-center gap-4 transition-all duration-300 hover:bg-white/15 hover-bright">
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
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-primary mb-4">
              All-in-One Learning Experience
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to succeed in your academic journey, accessible anytime, anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift reveal flex flex-col h-full">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 md:mb-6">
                <Clock className="h-6 w-6 md:h-7 md:w-7 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-gray-900 dark:text-white">Live Classes</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Attend interactive virtual classes with real-time participation and engagement.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift reveal reveal-delay-100 flex flex-col h-full">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 md:mb-6">
                <Book className="h-6 w-6 md:h-7 md:w-7 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-gray-900 dark:text-white">Course Catalog</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Browse and enroll in a wide range of courses across various disciplines.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift reveal reveal-delay-200 flex flex-col h-full">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 md:mb-6">
                <MessageSquare className="h-6 w-6 md:h-7 md:w-7 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-gray-900 dark:text-white">Discussion Forums</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Engage in academic discussions with peers and instructors on course topics.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift reveal reveal-delay-300 flex flex-col h-full">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 md:mb-6">
                <BarChart4 className="h-6 w-6 md:h-7 md:w-7 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-gray-900 dark:text-white">Grade Tracking</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Monitor your academic progress with detailed grade analytics and reports.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift reveal reveal-delay-400 flex flex-col h-full">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 md:mb-6">
                <Brain className="h-6 w-6 md:h-7 md:w-7 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-gray-900 dark:text-white">AI Learning Assistant</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Get personalized academic support with our AI-powered learning assistant.
              </p>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-12">
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90 hover-lift w-full sm:w-auto px-8 py-6 sm:py-6 text-base">
              <Link to="/login" className="inline-flex items-center justify-center gap-2">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-primary mb-4">
              What Our Students Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hear from students and faculty about their experience with MMU's Digital Campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl border border-gray-100 dark:border-gray-600 hover-lift reveal">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center mr-4">
                  <span className="text-primary dark:text-white font-bold">JS</span>
                </div>
                <div>
                  <h4 className="font-semibold dark:text-white">Jane Smith</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Computer Science Student</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-200 italic">
                "The AI learning assistant has been a game-changer for my studies. It's like having a tutor available 24/7 to help with difficult concepts."
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl border border-gray-100 dark:border-gray-600 hover-lift reveal reveal-delay-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center mr-4">
                  <span className="text-primary dark:text-white font-bold">MK</span>
                </div>
                <div>
                  <h4 className="font-semibold dark:text-white">Dr. Michael Kumar</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Engineering Faculty</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-200 italic">
                "The platform has transformed how I teach. The interactive features and real-time feedback mechanisms have significantly improved student engagement."
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl border border-gray-100 dark:border-gray-600 hover-lift reveal reveal-delay-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center mr-4">
                  <span className="text-primary dark:text-white font-bold">AL</span>
                </div>
                <div>
                  <h4 className="font-semibold dark:text-white">Amina Lowe</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Business Administration Student</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-200 italic">
                "The discussion forums have connected me with peers across different campuses. I've gained valuable insights and perspectives I wouldn't have otherwise."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why MMU LMS Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-primary mb-4">
              Why MMU LMS?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our digital campus is designed with your academic success in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover-lift reveal flex flex-col h-full">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Laptop className="h-7 w-7 md:h-8 md:w-8 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-white">Accessible</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Access your courses and resources from anywhere, anytime, on any device.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover-lift reveal reveal-delay-100 flex flex-col h-full">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Zap className="h-7 w-7 md:h-8 md:w-8 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-white">Fast</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Optimized performance ensures quick loading times and smooth experience.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover-lift reveal reveal-delay-200 flex flex-col h-full">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Clock24 className="h-7 w-7 md:h-8 md:w-8 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-white">24/7 AI Tutor</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Get help with your studies any time of day with our AI-powered learning assistant.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover-lift reveal reveal-delay-300 flex flex-col h-full">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Smartphone className="h-7 w-7 md:h-8 md:w-8 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-white">Mobile Ready</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Fully responsive design works seamlessly on smartphones and tablets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 mt-auto relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwYzkuOTQgMCAxOCA4LjA2IDE4IDE4aDEyYzAgOS45NCA4LjA2IDE4IDE4IDE4djEyYy05Ljk0IDAtMTgtOC4wNi0xOC0xOEgzNnoiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvZz48L3N2Zz4=')]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-white">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xl font-bold text-white">MMU LMS</div>
              </div>
              <p className="max-w-xs opacity-90">
                Multimedia University's official digital learning management system.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a href="#" className="text-white hover:text-accent transition hover-lift">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-accent transition hover-lift">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-accent transition hover-lift">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-accent transition hover-lift">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="mb-6 md:mb-0">
                <h4 className="text-white font-medium mb-4 text-base md:text-lg">Quick Links</h4>
                <ul className="space-y-2 md:space-y-3">
                  <li><a href="https://www.mmu.ac.ke" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">Main Website</a></li>
                  <li><a href="#" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">Library</a></li>
                  <li><a href="#" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">Academic Calendar</a></li>
                  <li><a href="#" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">Campus Map</a></li>
                </ul>
              </div>
              <div className="mb-6 md:mb-0">
                <h4 className="text-white font-medium mb-4 text-base md:text-lg">Resources</h4>
                <ul className="space-y-2 md:space-y-3">
                  <li><a href="#" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">Help Center</a></li>
                  <li><a href="#" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">FAQs</a></li>
                  <li><a href="#" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">Student Guide</a></li>
                  <li><a href="#" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">Privacy Policy</a></li>
                  <li><a href="#" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">Terms of Use</a></li>
                </ul>
              </div>
              <div className="mb-6 md:mb-0">
                <h4 className="text-white font-medium mb-4 text-base md:text-lg">Contact</h4>
                <ul className="space-y-2 md:space-y-3">
                  <li><a href="mailto:support@mmu.ac.ke" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">support@mmu.ac.ke</a></li>
                  <li><a href="tel:+254722000000" className="text-sm md:text-base opacity-75 hover:opacity-100 hover:text-accent transition">+254 722 000 000</a></li>
                  <li className="text-sm md:text-base opacity-75">P.O. Box 15653 - 00503, Nairobi, Kenya</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feedback Button */}
          <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
            <Button className="bg-accent text-primary hover:bg-accent/90 shadow-lg hover-lift text-xs md:text-sm px-2 py-1 md:px-3 md:py-2">
              <MessageSquare className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm opacity-75">
            <p>© {new Date().getFullYear()} Multimedia University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
