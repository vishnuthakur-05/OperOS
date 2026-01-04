import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

import { UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import {
   ShieldAlert, BrainCircuit, Scale, HeartPulse, Activity, ArrowRight, X, Lock, Mail,
   CheckCircle2, XCircle, Zap, Clock, FileText, ChevronRight, Menu, Play, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// --- HELPER: SCROLL REVEAL ANIMATION ---
const ScrollReveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
   const [isVisible, setIsVisible] = useState(false);
   const ref = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setIsVisible(true);
               observer.disconnect(); // Trigger once
            }
         },
         { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
      );

      if (ref.current) {
         observer.observe(ref.current);
      }

      return () => {
         if (ref.current) observer.disconnect();
      };
   }, []);

   return (
      <div
         ref={ref}
         style={{ transitionDelay: `${delay}ms` }}
         className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${className}`}
      >
         {children}
      </div>
   );
};

// --- HELPER: HERO TEXT CURTAIN REVEAL ---
const HeroTextReveal = ({ text, delay = 0, gradient = false }: { text: string, delay?: number, gradient?: boolean }) => {
   const [start, setStart] = useState(false);

   useEffect(() => {
      const timer = setTimeout(() => setStart(true), delay);
      return () => clearTimeout(timer);
   }, [delay]);

   return (
      <div className="overflow-hidden leading-[1.1]">
         <div className={`transition-transform duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) ${start ? 'translate-y-0' : 'translate-y-[110%]'}`}>
            <span className={gradient ? "text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-blue-500 to-purple-600 animate-gradient-x" : ""}>
               {text}
            </span>
         </div>
      </div>
   );
};

// --- HELPER: 3D FLIP CARD ---
const FlipCard = ({ icon: Icon, title, desc, color, bg }: any) => {
   return (
      <div className="group h-[320px] w-full perspective-[1000px] cursor-pointer">
         <div className="relative h-full w-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180 shadow-xl rounded-3xl">

            {/* FRONT */}
            <div className="absolute inset-0 h-full w-full backface-hidden rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-8 shadow-sm">
               <div className={`w-20 h-20 rounded-3xl ${bg} flex items-center justify-center ${color} mb-8 transition-transform duration-500 group-hover:scale-110`}>
                  <Icon className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center">{title}</h3>
               <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">Hover to Reveal</p>
            </div>

            {/* BACK */}
            <div className="absolute inset-0 h-full w-full backface-hidden rotate-y-180 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white flex flex-col items-center justify-center p-8 text-center border border-slate-800 dark:border-slate-700">
               <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6`}>
                  <Icon className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold mb-4">{title}</h3>
               <p className="text-slate-300 leading-relaxed text-sm">{desc}</p>
               <div className="mt-6 flex items-center text-brand-400 text-xs font-bold uppercase tracking-widest">
                  Active Agent <Zap className="w-3 h-3 ml-1" />
               </div>
            </div>
         </div>
      </div>
   );
};

interface LandingPageProps {
   onLogin: (email: string) => void;
   initialView?: 'HERO' | 'ROLES';
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, initialView = 'HERO' }) => {
   const [view, setView] = useState<'HERO' | 'ROLES'>(initialView);
   const [showModal, setShowModal] = useState(false);
   const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   // Use Global Theme Context
   const { isDarkMode, toggleTheme } = useTheme();

   // Effect to update view if initialView prop changes
   useEffect(() => {
      setView(initialView);
   }, [initialView]);

   const handleGetStarted = () => {
      setView('ROLES');
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const scrollToSection = (id: string) => {
      const el = document.getElementById(id);
      if (el) {
         el.scrollIntoView({ behavior: 'smooth' });
         setIsMobileMenuOpen(false);
      }
   };

   const handleRoleSelect = (role: UserRole) => {
      setSelectedRole(role);
      if (role === UserRole.EMPLOYEE) setEmail('employee@operos.com');
      if (role === UserRole.MANAGER) setEmail('manager@operos.com');
      if (role === UserRole.HR) setEmail('hr@operos.com');
      setShowModal(true);
      setError('');
   };

   const handleSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      try {
         await signInWithEmailAndPassword(auth, email, password);
         // Login successful - App.tsx onAuthStateChanged will handle the rest
      } catch (err: any) {
         console.error("Login Error:", err);
         setError('Login failed. Please check your credentials.');
      }
   };

   // --- VIEW: HERO & LANDING CONTENT ---
   if (view === 'HERO') {
      return (
         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-200 overflow-x-hidden selection:bg-brand-500/30">

            {/* INJECT CUSTOM CSS FOR 3D TRANSFORMS */}
            <style>{`
          .perspective-[1000px] { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
          .group:hover .group-hover\\:rotate-y-180 { transform: rotateY(180deg); }
        `}</style>

            {/* Sticky Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
               <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                     <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                        O
                     </div>
                     <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">OperOS</span>
                  </div>

                  {/* Desktop Links & Actions */}
                  <div className="hidden md:flex items-center gap-6">
                     <div className="flex items-center gap-6 mr-6 border-r border-slate-200 dark:border-slate-800 pr-6 h-6">
                        <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</button>
                        <button onClick={() => scrollToSection('comparison')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Why OperOS</button>
                     </div>

                     <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        title="Toggle Theme"
                     >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                     </button>

                     <Button onClick={handleGetStarted} variant="primary" className="rounded-full px-6 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:-translate-y-0.5">
                        Get Started
                     </Button>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center gap-4 md:hidden">
                     <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                     >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                     </button>
                     <button className="p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                     </button>
                  </div>
               </div>

               {/* Mobile Menu */}
               {isMobileMenuOpen && (
                  <div className="absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
                     <button onClick={() => scrollToSection('features')} className="text-left text-lg font-medium py-2">Features</button>
                     <button onClick={() => scrollToSection('comparison')} className="text-left text-lg font-medium py-2">Why OperOS</button>
                     <Button onClick={handleGetStarted} className="w-full justify-center">Get Started</Button>
                  </div>
               )}
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-16 lg:pt-48 lg:pb-24 overflow-hidden w-full">
               {/* Background Blobs */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-brand-500/10 dark:bg-brand-500/5 rounded-[100%] blur-3xl -z-10 animate-pulse duration-[5000ms]"></div>

               <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 text-center relative z-10">
                  {/* Removed "Live Preview v2.0" Badge as requested */}

                  <div className="mb-8">
                     <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white flex flex-col items-center gap-2">
                        <HeroTextReveal text="Stop Managing." delay={200} />
                        <HeroTextReveal text="Start Automating." delay={800} gradient />
                     </h1>
                  </div>

                  <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-[1200ms]">
                     OperOS replaces the chaos of spreadsheets and static HR software with intelligent agents that predict burnout, balance teams, and hire without bias.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-[1400ms]">
                     <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto rounded-full text-lg h-14 px-8 shadow-xl shadow-brand-500/20 hover:scale-105 transition-transform">
                        Launch Workspace <ArrowRight className="ml-2 w-5 h-5" />
                     </Button>
                     <button onClick={() => scrollToSection('comparison')} className="w-full sm:w-auto h-14 px-8 rounded-full font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                        <Play className="w-4 h-4 fill-current" /> See the difference
                     </button>
                  </div>
               </div>
            </main>

            {/* Feature Pillars (3D Flip Cards) */}
            <section id="features" className="py-20 bg-white dark:bg-slate-900/50 relative w-full">
               <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12">
                  <ScrollReveal>
                     <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Three Agents. Infinite Productivity.</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Hover over an agent to reveal their capabilities.</p>
                     </div>
                  </ScrollReveal>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                     <ScrollReveal delay={100}>
                        <FlipCard
                           icon={HeartPulse}
                           title="Burnout Shield"
                           desc="I continuously monitor cognitive load and task volume, automatically intervening with wellness breaks before your employees crash."
                           color="text-red-500"
                           bg="bg-red-50 dark:bg-red-900/10"
                        />
                     </ScrollReveal>

                     <ScrollReveal delay={300}>
                        <FlipCard
                           icon={BrainCircuit}
                           title="Team Balancer"
                           desc="I am an orchestration engine that dynamically reallocates tasks based on real-time capacity and skill matching to ensure optimal velocity."
                           color="text-purple-500"
                           bg="bg-purple-50 dark:bg-purple-900/10"
                        />
                     </ScrollReveal>

                     <ScrollReveal delay={500}>
                        <FlipCard
                           icon={Scale}
                           title="Bias-Free Hiring"
                           desc="I am a blind-screening agent that parses resumes for raw capability, stripping away demographic noise to find the best talent."
                           color="text-emerald-500"
                           bg="bg-emerald-50 dark:bg-emerald-900/10"
                        />
                     </ScrollReveal>
                  </div>
               </div>
            </section>

            {/* Comparison Section (Manual vs AI) */}
            <section id="comparison" className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 w-full">
               <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12">
                  <ScrollReveal>
                     <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">The Paradigm Shift</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">See how OperOS transforms disparate tasks into a unified, intelligent workflow.</p>
                     </div>
                  </ScrollReveal>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
                     {/* Left: The Old Way */}
                     <ScrollReveal delay={100}>
                        <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 relative overflow-hidden h-full group hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-300 to-slate-400 group-hover:from-red-300 group-hover:to-red-400 transition-all"></div>
                           <div className="flex items-center gap-3 mb-8">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"><Clock className="w-6 h-6" /></div>
                              <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-400">Manual HR</h3>
                           </div>
                           <ul className="space-y-8">
                              <li className="flex items-start gap-4 opacity-70">
                                 <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                 <div>
                                    <p className="font-semibold text-lg text-slate-900 dark:text-white">Reactive Firefighting</p>
                                    <p className="text-slate-500">Dealing with burnout only after resignation letters.</p>
                                 </div>
                              </li>
                              <li className="flex items-start gap-4 opacity-70">
                                 <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                 <div>
                                    <p className="font-semibold text-lg text-slate-900 dark:text-white">Subjective Hiring</p>
                                    <p className="text-slate-500">Resume screening based on gut feeling and bias.</p>
                                 </div>
                              </li>
                              <li className="flex items-start gap-4 opacity-70">
                                 <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                 <div>
                                    <p className="font-semibold text-lg text-slate-900 dark:text-white">Siloed Spreadsheets</p>
                                    <p className="text-slate-500">Data scattered across emails, Drive, and Slack.</p>
                                 </div>
                              </li>
                           </ul>
                        </div>
                     </ScrollReveal>

                     {/* Right: The OperOS Way */}
                     <ScrollReveal delay={300}>
                        <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-800 border-2 border-brand-500 dark:border-brand-600 relative overflow-hidden shadow-2xl shadow-brand-500/10 transform md:-translate-y-4 h-full">
                           <div className="absolute top-0 right-0 p-3 bg-brand-500 text-white text-xs font-bold rounded-bl-2xl">INTELLIGENT</div>
                           <div className="flex items-center gap-3 mb-8">
                              <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600"><Zap className="w-6 h-6" /></div>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">OperOS Agents</h3>
                           </div>
                           <ul className="space-y-8">
                              <li className="flex items-start gap-4">
                                 <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                                 <div>
                                    <p className="font-bold text-lg text-slate-900 dark:text-white">Predictive Wellness</p>
                                    <p className="text-slate-500">Agents intervene with breaks before stress peaks.</p>
                                 </div>
                              </li>
                              <li className="flex items-start gap-4">
                                 <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                                 <div>
                                    <p className="font-bold text-lg text-slate-900 dark:text-white">Data-Driven Recruitment</p>
                                    <p className="text-slate-500">AI extracts skills and anonymizes profiles instantly.</p>
                                 </div>
                              </li>
                              <li className="flex items-start gap-4">
                                 <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                                 <div>
                                    <p className="font-bold text-lg text-slate-900 dark:text-white">Centralized Intelligence</p>
                                    <p className="text-slate-500">One dashboard acting as the brain of your workforce.</p>
                                 </div>
                              </li>
                           </ul>
                           <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-700">
                              <Button onClick={handleGetStarted} className="w-full justify-center group h-12 text-base">
                                 Experience the difference <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                              </Button>
                           </div>
                        </div>
                     </ScrollReveal>
                  </div>
               </div>
            </section>

            {/* Minimal Footer (Cleaned) */}
            <footer className="bg-white dark:bg-slate-900 py-8 border-t border-slate-200 dark:border-slate-800 relative">
               <ScrollReveal>
                  <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 flex justify-center">
                     <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-xs">O</div>
                        <span className="font-bold text-slate-900 dark:text-white">OperOS</span>
                     </div>
                  </div>
               </ScrollReveal>

            </footer>








         </div>
      );
   }

   // --- VIEW: ROLE SELECTION ---
   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 font-sans selection:bg-brand-500/30 transition-colors duration-500">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
         </div>

         <div className="absolute top-8 left-8 flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" onClick={() => setView('HERO')}>
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold">O</div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">OperOS</span>
         </div>

         <div className="max-w-5xl w-full animate-in zoom-in-95 duration-500">
            <div className="mb-8">
               <BackButton onClick={() => setView('HERO')} label="Return to Home" />
            </div>

            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Who are you?</h2>
               <p className="text-slate-500 text-lg">Select your persona to access the workspace.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

               {/* Employee Card */}
               <button
                  onClick={() => handleRoleSelect(UserRole.EMPLOYEE)}
                  className="group relative text-left h-full outline-none"
               >
                  <div className="h-full bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-8 rounded-3xl hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2">
                     <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                        <Activity className="w-8 h-8" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Employee</h3>
                     <p className="text-slate-500 mb-8 leading-relaxed text-sm">Access personal stats, your active tasks, and the Burnout Shield protection layer.</p>
                     <div className="flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-2 transition-transform">
                        Enter Workspace <ArrowRight className="ml-2 w-4 h-4" />
                     </div>
                  </div>
               </button>

               {/* Manager Card */}
               <button
                  onClick={() => handleRoleSelect(UserRole.MANAGER)}
                  className="group relative text-left h-full outline-none"
               >
                  <div className="h-full bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-8 rounded-3xl hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2">
                     <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                        <BrainCircuit className="w-8 h-8" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manager</h3>
                     <p className="text-slate-500 mb-8 leading-relaxed text-sm">Lead your team with AI insights, stress heatmaps, and load balancing.</p>
                     <div className="flex items-center text-sm font-bold text-purple-600 group-hover:translate-x-2 transition-transform">
                        Control Center <ArrowRight className="ml-2 w-4 h-4" />
                     </div>
                  </div>
               </button>

               {/* HR Card */}
               <button
                  onClick={() => handleRoleSelect(UserRole.HR)}
                  className="group relative text-left h-full outline-none"
               >
                  <div className="h-full bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-8 rounded-3xl hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-2">
                     <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                        <Scale className="w-8 h-8" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">HR Gatekeeper</h3>
                     <p className="text-slate-500 mb-8 leading-relaxed text-sm">Manage the recruitment pipeline with our Bias-Free Hiring Agent.</p>
                     <div className="flex items-center text-sm font-bold text-emerald-600 group-hover:translate-x-2 transition-transform">
                        Open Gatekeeper <ArrowRight className="ml-2 w-4 h-4" />
                     </div>
                  </div>
               </button>

            </div>
         </div>

         {/* Login Modal */}
         {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                  <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                     <X className="w-5 h-5" />
                  </button>

                  <div className="p-10">
                     <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-4 shadow-sm">
                           <Lock className="w-6 h-6 text-slate-900 dark:text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h3>
                        <p className="text-slate-500 mt-2">Accessing {selectedRole?.toLowerCase()} privileges</p>
                     </div>

                     <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                           <div className="relative">
                              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                              <input
                                 type="email"
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                 placeholder="name@operos.com"
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                           <div className="relative">
                              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                              <input
                                 type="password"
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}
                                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                 placeholder="••••••••"
                              />
                           </div>
                        </div>

                        {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 dark:bg-red-900/20 py-2.5 rounded-lg animate-pulse">{error}</p>}

                        <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl font-bold shadow-xl shadow-slate-900/10 transition-all text-base hover:scale-[1.02]">
                           Access Workspace
                        </Button>

                        <div className="text-center mt-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                           <p className="text-xs text-slate-500">Demo Password</p>
                           <code className="text-sm font-mono font-bold text-slate-900 dark:text-white">admin123</code>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};