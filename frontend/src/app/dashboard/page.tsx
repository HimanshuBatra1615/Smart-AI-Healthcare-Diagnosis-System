"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Send, Mic, X, AlertTriangle, 
  ChevronRight, CheckCircle, Clock, Thermometer, Loader2, FileText, LogOut 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [severity, setSeverity] = useState(50);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("Diagnosis");
  const [history, setHistory] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [userName, setUserName] = useState("Authenticated User");
  const [userEmail, setUserEmail] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket Connection
  const connectWebSocket = useCallback(() => {
    // Prevent double connections in React Strict Mode
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    setIsConnecting(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const WS_URL = API_URL.replace("http://", "ws://").replace("https://", "wss://");
    const ws = new WebSocket(`${WS_URL}/api/v1/chat/ws`);
    
    ws.onopen = () => {
      console.log("Connected to Chat WS");
      setIsConnecting(false);
    };
    
    ws.onmessage = (event) => {
      setIsTyping(false);
      const text = event.data;
      setMessages(prev => {
        // Prevent duplicate greeting messages from Strict Mode reconnects
        if (text.includes("Hello! I am your AI Health Assistant") && prev.some(m => m.text === text)) {
          return prev;
        }
        return [...prev, { role: 'ai', text }]
      });
      
      // Basic text extraction for demo purposes on UI
      const extracted = text.match(/experiencing: (.*)\./);
      if (extracted && extracted[1]) {
        const symps = extracted[1].split(',').map((s: string) => s.trim());
        setSymptoms(prev => Array.from(new Set([...prev, ...symps])));
      }
    };
    
    ws.onclose = () => {
      console.log("Disconnected. Reconnecting...");
      // small delay to prevent rapid reconnect loops
      setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = (err) => {
      // Changed from console.error to console.warn to prevent Next.js "1 Issue" red overlay
      console.warn("WS Warning: Connection issue (check if backend is running).");
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connectWebSocket();
    fetchHistory();
    setUserName(localStorage.getItem("userName") || "Authenticated User");
    setUserEmail(localStorage.getItem("userEmail") || "user@example.com");
    return () => {
      if (wsRef.current) {
        // Prevent onclose reconnect loop during component unmount
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/v1/predict/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch(e) { console.error(e); }
  };

  const handleSend = () => {
    if (!chatInput.trim() || !wsRef.current) return;
    
    const userText = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput("");
    setIsTyping(true);
    
    wsRef.current.send(userText);
  };

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Try using Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev + (prev.length > 0 ? " " : "") + transcript);
    };
    
    recognition.start();
  };

  const removeSymptom = (sym: string) => {
    setSymptoms(prev => prev.filter(s => s !== sym));
  };

  const generateReport = async () => {
    if (symptoms.length === 0) return;
    setLoadingReport(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/v1/predict/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ symptoms })
      });
      
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json();
      router.push(`/result?id=${data.diagnosis_id}`);
    } catch(e) {
      alert(e);
      setLoadingReport(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f] text-white">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 glass border-r border-white/5 flex flex-col pt-8"
      >
        <div className="px-6 flex items-center mb-12">
          <Activity className="w-8 h-8 text-teal-400 mr-2" />
          <span className="text-xl font-bold">Health<span className="text-indigo-400">AI</span></span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem active={activeTab === 'Diagnosis'} onClick={() => setActiveTab('Diagnosis')} icon={<Activity className="w-5 h-5" />} label="Diagnosis" />
          <NavItem active={activeTab === 'History'} onClick={() => setActiveTab('History')} icon={<Clock className="w-5 h-5" />} label="History" />
          <NavItem active={activeTab === 'Vitals'} onClick={() => setActiveTab('Vitals')} icon={<Thermometer className="w-5 h-5" />} label="Vitals" />
        </nav>
        
        <div className="p-4 border-t border-white/5 relative">
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-[80px] left-4 right-4 glass-neumorphic border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 p-1"
              >
                <div className="p-3 border-b border-white/5 bg-white/5">
                  <p className="font-bold text-sm text-white truncate px-1">{userName}</p>
                  <p className="text-xs text-gray-400 truncate px-1">{userEmail}</p>
                </div>
                <div className="p-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 font-medium hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate">{userName}</p>
              <p className="text-xs text-gray-400 text-green-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span> Online
              </p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 z-10 w-full max-w-5xl mx-auto flex flex-col space-y-8">
          
          <header className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {activeTab === 'Diagnosis' ? 'Symptom Analysis' : activeTab === 'History' ? 'Diagnosis History' : 'Patient Vitals'}
              </h1>
              <p className="text-gray-400 mt-2">
                {activeTab === 'Diagnosis' ? 'Detail your condition for an AI-powered prediction' : 'Review past diagnostics and risk trends'}
              </p>
            </div>
            {activeTab === 'Diagnosis' && symptoms.length > 0 && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateReport}
                disabled={loadingReport}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-teal-500/20 flex items-center space-x-2 disabled:opacity-50"
              >
                {loadingReport ? (
                  <><span>Processing</span><Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                  <><span>Generate Report</span><CheckCircle className="w-5 h-5" /></>
                )}
              </motion.button>
            )}
          </header>

          {activeTab === 'Diagnosis' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-[500px]">
              {/* Input Panel */}
              <div className="glass-neumorphic rounded-3xl p-6 flex flex-col space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Activity className="w-5 h-5 text-teal-400 mr-2" />
                    Detected Symptoms
                  </h3>
                  <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 rounded-xl bg-black/20 border border-white/5">
                    <AnimatePresence>
                      {symptoms.length === 0 && <span className="text-sm text-gray-500 italic">No symptoms added yet.</span>}
                      {symptoms.map(sym => (
                        <motion.div 
                          key={sym}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="glass px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 border-indigo-500/30 text-indigo-100"
                        >
                          <span>{sym}</span>
                          <X className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors" onClick={() => removeSymptom(sym)} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Overall Severity</h3>
                  <div className="glass p-5 rounded-2xl flex items-center space-x-4">
                    <span className="text-sm text-teal-400">Mild</span>
                    <input 
                      type="range" 
                      min="1" max="100" 
                      value={severity} 
                      onChange={e => setSeverity(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-sm text-red-400">Severe</span>
                  </div>
                </div>

                {severity > 80 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200 leading-relaxed">High severity detected. Please seek immediate emergency medical care if you experience chest pain or severe difficulty breathing.</p>
                  </motion.div>
                )}
              </div>

              {/* AI Assistant Chat */}
              <div className="glass-neumorphic rounded-3xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></div>
                    <h3 className="font-semibold text-gray-200">
                      HealthAI Assistant {isConnecting && <span className="text-xs text-yellow-400 ml-2">(Connecting...)</span>}
                    </h3>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                  {messages.map((m, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i} 
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        m.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'glass border-white/10 text-gray-200 rounded-bl-none'
                      }`}>
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="glass p-3 rounded-2xl rounded-bl-none border-white/10 flex space-x-1 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={startListening}
                      className={`p-3 rounded-full transition-colors font-bold flex items-center justify-center ${
                        isListening 
                          ? 'bg-red-500/20 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                          : 'hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Type a symptom..."
                      disabled={isConnecting}
                      className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white disabled:opacity-50"
                    />
                    <button onClick={handleSend} disabled={isConnecting} className="p-3 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'History' && (
            <div className="glass-neumorphic rounded-3xl p-6">
              {history.length === 0 ? (
                <div className="text-center text-gray-400 py-12">No past history found.</div>
              ) : (
                <div className="space-y-4">
                  {history.map((record: any, idx) => (
                    <div key={idx} className="glass p-5 rounded-2xl flex items-center justify-between border border-white/5 hover:border-indigo-500/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                          <FileText className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{record.disease}</h4>
                          <p className="text-sm text-gray-400">Ref: #{record.diagnosis_id} | Risk: <span className={record.risk_level === 'High' ? 'text-red-400' : 'text-teal-400'}>{record.risk_level}</span></p>
                        </div>
                      </div>
                      <Link href={`/result?id=${record.diagnosis_id}`}>
                        <button className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium flex items-center">
                          View Report <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Vitals' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              
              {/* Heart Rate */}
              <div className="glass-neumorphic p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-pink-500/30 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-pink-500/20 text-pink-400 rounded-xl">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-green-500/20 text-green-400">Normal</span>
                </div>
                <h3 className="text-gray-400 font-medium mb-1">Heart Rate</h3>
                <div className="flex items-end space-x-2">
                  <h2 className="text-4xl font-extrabold text-white">72</h2>
                  <span className="text-gray-500 mb-1 font-medium">bpm</span>
                </div>
                <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-red-500 w-[60%] rounded-full"></div>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="glass-neumorphic p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <AlertTriangle className="w-6 h-6 rotate-180" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-500">Elevated</span>
                </div>
                <h3 className="text-gray-400 font-medium mb-1">Blood Pressure</h3>
                <div className="flex items-end space-x-2">
                  <h2 className="text-4xl font-extrabold text-white">128<span className="text-2xl text-gray-400">/82</span></h2>
                  <span className="text-gray-500 mb-1 font-medium">mmHg</span>
                </div>
                <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 w-[75%] rounded-full"></div>
                </div>
              </div>

              {/* Body Temperature */}
              <div className="glass-neumorphic p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-orange-500/30 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-green-500/20 text-green-400">Normal</span>
                </div>
                <h3 className="text-gray-400 font-medium mb-1">Temperature</h3>
                <div className="flex items-end space-x-2">
                  <h2 className="text-4xl font-extrabold text-white">98.6</h2>
                  <span className="text-gray-500 mb-1 font-medium">°F</span>
                </div>
                <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 w-[40%] rounded-full"></div>
                </div>
              </div>

              {/* Fake Live ECG Chart  */}
              <div className="md:col-span-2 lg:col-span-3 glass-neumorphic p-6 rounded-3xl border border-white/5 overflow-hidden relative">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                  <Activity className="w-5 h-5 text-teal-400 mr-2" />
                  Live Mobile View Feed
                </h3>
                <div className="w-full h-32 relative flex items-center bg-black/20 rounded-xl overflow-hidden border border-white/5">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  
                  {/* Animated CSS SVG line */}
                  <svg className="w-full h-full text-teal-400 opacity-80" preserveAspectRatio="none" viewBox="0 0 1000 100">
                    <path 
                      className="animate-[dash_3s_linear_infinite]"
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="100, 20"
                      strokeDashoffset="0"
                      d="M0 50 H200 L220 30 L250 90 L280 10 L300 50 H450 L470 40 L490 60 L510 50 H800 L820 10 L850 90 L880 20 L900 50 H1000"
                    />
                  </svg>
                  
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ active = false, onClick, icon, label }: { active?: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <div onClick={onClick} className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="ml-3 font-medium text-sm">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
    </div>
  );
}
