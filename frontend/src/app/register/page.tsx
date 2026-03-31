"use client";

import { motion } from "framer-motion";
import NextLink from "next/link";
import { useState, useEffect } from "react";
import { User, Activity, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let score = 0;
    if (password.length > 5) score += 25;
    if (password.length > 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    setStrength(score);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }
      
      localStorage.setItem("token", data.access_token);
      if (data.name) localStorage.setItem("userName", data.name);
      if (data.email) localStorage.setItem("userEmail", data.email);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-neumorphic p-10 rounded-3xl w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <Activity className="w-10 h-10 text-indigo-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-gray-400 text-center mb-6 text-sm">Join the next generation of healthcare</p>

        {error && <div className="mb-4 text-red-400 text-sm text-center p-2 bg-red-400/10 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm text-white placeholder-gray-500"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm text-white placeholder-gray-500"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm text-white placeholder-gray-500"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            {password.length > 0 && (
              <div className="mt-2 space-y-1 mt-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                  <motion.div 
                    className={`h-full ${
                      strength < 50 ? 'bg-red-500' : strength < 100 ? 'bg-yellow-400' : 'bg-teal-400'
                    }`} 
                    animate={{ width: `${strength}%` }} 
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
                <div className="flex justify-end pr-1 text-[10px] text-gray-400">
                  {strength < 50 ? 'Weak' : strength < 100 ? 'Good' : 'Strong'}
                </div>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full mt-2 bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all ${loading ? 'opacity-70' : ''}`}
          >
            <span>{loading ? "Registering..." : "Complete Registration"}</span>
            <CheckCircle2 className="w-5 h-5" />
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">Already have an account? </span>
          <NextLink href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Sign In
          </NextLink>
        </div>
      </motion.div>
    </div>
  );
}
