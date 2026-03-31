"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, Brain, Shield, User, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-8 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center space-x-2">
          <Activity className="w-8 h-8 text-teal-400" />
          <span className="text-xl font-bold tracking-wider">Health<span className="text-indigo-400">AI</span></span>
        </div>
        <div className="flex space-x-6 items-center">
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-200">
            Sign In
          </Link>
          <Link href="/register">
            <button className="px-6 py-2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-500/40 hover:text-white transition-all duration-300 flex items-center space-x-2">
              <span>Get Started</span>
              <User className="w-4 h-4 ml-1" />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 px-4 text-center z-10 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-8 border border-teal-500/30">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-sm font-medium text-teal-200">V1.0 Early Access Live</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Intelligent Health <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400">
              Diagnostics
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the future of personal healthcare. Our state-of-the-art AI analyzes your symptoms instantly, providing highly accurate clinical insights and feature-level explanations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/dashboard">
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-semibold text-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center group">
                Start Smart Diagnosis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4 sm:px-12 md:px-24 mb-20">
          <FeatureCard 
            icon={<Brain className="w-8 h-8 text-indigo-400" />}
            title="Explainable AI"
            desc="Understand exactly how our XGBoost & Random Forest models arrived at your diagnosis."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Activity className="w-8 h-8 text-teal-400" />}
            title="Real-time Tracking"
            desc="Monitor your risk score and vital trends instantly with WebSocket powered connections."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-purple-400" />}
            title="Secure & Private"
            desc="Your data is protected with enterprise-grade JWT encryption and PostgreSQL safeguards."
            delay={0.6}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-neumorphic p-8 rounded-3xl flex flex-col items-start transition-all"
    >
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">
        {desc}
      </p>
    </motion.div>
  );
}
