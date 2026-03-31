"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Activity, AlertTriangle, CheckCircle, FileText, 
  Download, ArrowLeft, Brain, ShieldAlert, Calendar 
} from "lucide-react";
import Link from "next/link";

interface PredictionData {
  diagnosis_id: number;
  disease: string;
  probability: number;
  risk_level: string;
  feature_importance: Record<string, number>;
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const idQuery = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PredictionData | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!idQuery) {
        setLoading(false);
        setError("No diagnosis ID provided.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/v1/predict/${idQuery}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error(res.status === 404 ? "Diagnosis not found" : "Server Error");
        }
        
        const prediction = await res.json();
        setData(prediction);
      } catch (e: any) {
        console.error("Failed to fetch prediction:", e);
        setError(e.message || "Failed to load prediction data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrediction();
  }, [idQuery]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f] text-white flex-col space-y-6">
        <div className="relative w-24 h-24">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 border-4 border-t-teal-400 border-r-indigo-500 border-b-transparent border-l-transparent rounded-full"
          />
          <Activity className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
        </div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">
          Loading AI Diagnosis...
        </h2>
        <p className="text-gray-400 text-sm">Retrieving analysis record #{idQuery}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f] text-white flex-col space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Error Loading Report</h2>
        <p className="text-gray-400">{error || "Data unavailable"}</p>
        <Link href="/dashboard">
          <button className="mt-4 px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors">
            Return to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-y-auto print:bg-white print:text-black pt-8 pb-20">
      
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-8 flex justify-between items-center print:hidden">
        <Link href="/dashboard" className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Dashboard</span>
        </Link>
        <button 
          onClick={handlePrint}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center space-x-2 text-sm font-medium border border-white/10"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </nav>

      <main className="max-w-4xl mx-auto mt-20 p-8 md:p-12 glass-neumorphic rounded-3xl print:shadow-none print:glass-none print:border-none print:mt-0 print:p-0">
        
        <header className="border-b border-white/10 pb-8 flex justify-between items-start print:border-gray-200">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-8 h-8 text-teal-400 print:text-teal-600" />
              <span className="text-2xl font-bold tracking-wider">Health<span className="text-indigo-400 print:text-indigo-600">AI</span></span>
            </div>
            <p className="text-sm text-gray-400 print:text-gray-500 flex items-center mt-4">
              <Calendar className="w-4 h-4 mr-2" />
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-200 print:text-black">Clinical Prediction Report</h2>
            <p className="text-gray-400 print:text-gray-500 text-sm">Ref ID: #{data.diagnosis_id}</p>
          </div>
        </header>

        {data.risk_level === "High" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-start space-x-4 print:bg-red-50 print:border-red-500">
            <ShieldAlert className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-400 print:text-red-700">Medical Attention Recommended</h3>
              <p className="text-sm text-red-200 print:text-red-600 mt-1">Based on the provided symptoms, the risk level is assessed as HIGH. Please consult a healthcare professional immediately.</p>
            </div>
          </motion.div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 print:text-gray-500 font-semibold mb-4">Primary Prediction</h3>
            <div className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 print:text-black pb-2 capitalize">
              {data.disease}
            </div>
            <p className="text-gray-400 print:text-gray-600 leading-relaxed max-w-xl">
              Our Random Forest evaluation model has matched the provided clinical symptom vectors to the signature patterns of this condition.
            </p>
          </div>

          <div className="glass p-6 rounded-2xl flex flex-col justify-center items-center border border-indigo-500/30 print:border-gray-300 print:bg-gray-50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent print:hidden" />
            
            <svg viewBox="0 0 36 36" className="w-24 h-24 z-10">
              <path
                className="text-gray-800 print:text-gray-200"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="3"
              />
              <motion.path
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${data.probability * 100}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={data.probability > 0.8 ? "text-teal-400 print:text-teal-600" : "text-yellow-400 print:text-yellow-600"}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="3"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10 pt-2">
              <span className="text-3xl font-bold">{(data.probability * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Confidence</span>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-bold mb-6 flex items-center print:text-black">
            <Brain className="w-6 h-6 mr-3 text-indigo-400 print:text-indigo-600" />
            Explainable AI (Reasoning)
          </h3>
          <div className="space-y-4 max-w-2xl">
            {Object.entries(data.feature_importance).map(([feature, weight], idx) => (
              <div key={idx} className="flex items-center">
                <div className="w-40 text-sm text-gray-300 font-medium capitalize print:text-gray-700 truncate" title={feature}>{feature.replace(/_/g, ' ')}</div>
                <div className="flex-1 h-3 bg-gray-800 rounded-full mx-4 overflow-hidden print:bg-gray-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(5, weight * 100)}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className={`h-full rounded-full ${weight > 0.2 ? 'bg-gradient-to-r from-indigo-500 to-teal-400' : 'bg-gradient-to-r from-gray-500 to-gray-400'}`}
                  />
                </div>
                <div className="w-12 text-xs text-right text-gray-500 print:text-gray-800">{(weight * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 p-6 border border-white/10 rounded-2xl bg-white/5 print:border-gray-200 print:bg-gray-50">
          <h4 className="font-bold flex items-center mb-2 print:text-black">
            <FileText className="w-5 h-5 mr-2 text-gray-400 print:text-gray-600" />
            Note to Physicians
          </h4>
          <p className="text-sm text-gray-400 print:text-gray-600 leading-relaxed">
            This predictive report is generated by a Machine Learning (XGBoost) model trained on synthesized clinical datasets. 
            It is intended as a clinical decision support tool and does not replace professional medical judgment, diagnosis, or treatment.
          </p>
        </div>
      </main>

      <div className="max-w-4xl mx-auto mt-8 flex justify-end space-x-4 print:hidden px-4 md:px-0">
        <button 
          onClick={() => alert("Connecting to an available Tele-Doctor...\n\n(Note: This is a placeholder feature for the demo. In a real application, this would launch a video consultation room.)")}
          className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25 cursor-pointer flex items-center space-x-2"
        >
          <span>Consult Tele-Doctor</span>
        </button>
      </div>

    </div>
  );
}
