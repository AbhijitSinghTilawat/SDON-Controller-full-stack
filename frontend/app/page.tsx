"use client";

import { useState } from "react";

const NODES = ["A", "B", "C", "D", "E"];

interface RouteResult {
  path: string[];
  cost: number;
  new_path: string[];
  new_cost: number;
  image_url: string;
}

function PathDisplay({ label, path, cost, highlight = false }: {
  label: string;
  path: string[];
  cost: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${highlight
      ? "border-cyan-500/40 bg-cyan-950/30"
      : "border-slate-700/60 bg-slate-800/40"
    }`}>
      <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">{label}</p>
      <div className="flex items-center gap-1 flex-wrap mb-3">
        {path.map((node, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className={`
              inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold font-mono
              ${highlight
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                : "bg-slate-700/60 text-slate-200 border border-slate-600/50"
              }
            `}>{node}</span>
            {i < path.length - 1 && (
              <svg className={`w-4 h-4 ${highlight ? "text-cyan-600" : "text-slate-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Total Cost:</span>
        <span className={`text-sm font-bold font-mono ${highlight ? "text-cyan-300" : "text-slate-200"}`}>
          {cost}
        </span>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, exclude }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  exclude?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-800/80 border border-slate-700 text-slate-100 font-mono text-sm rounded-lg px-4 py-2.5 pr-9 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 cursor-pointer transition-colors"
        >
          {NODES.filter((n) => n !== exclude).map((n) => (
            <option key={n} value={n} className="bg-slate-800">{n}</option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default function SDONController() {
  const [source, setSource] = useState("A");
  const [destination, setDestination] = useState("E");
  const [failU, setFailU] = useState("C");
  const [failV, setFailV] = useState("D");
  const [result, setResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompute = async () => {
    if (source === destination) {
      setError("Source and destination must be different nodes.");
      return;
    }
    if (failU === failV) {
      setError("Failure link endpoints must be different nodes.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination, fail_u: failU, fail_v: failV }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Server error: ${res.status}`);
      }

      const data: RouteResult = await res.json();

      if (!data.path || data.path.length === 0) {
        throw new Error("No valid path found between the selected nodes.");
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Cannot connect to backend. Ensure the Flask server is running at http://127.0.0.1:5000.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080d14] text-white font-sans">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(100,220,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(100,220,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-cyan-800/60 bg-cyan-950/30 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Controller Online
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            SDON{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Controller
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-mono">
            Software Defined Optical Network — Route Computation Engine
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden">

          {/* Card header bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800 bg-slate-900/80">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="ml-2 text-xs font-mono text-slate-500">route_planner.tsx</span>
          </div>

          <div className="p-6 space-y-6">

            {/* Route selection */}
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Route Configuration
              </p>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Source Node" value={source} onChange={setSource} exclude={destination} />
                <SelectField label="Destination Node" value={destination} onChange={setDestination} exclude={source} />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-800/80" />

            {/* Failure link */}
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M9 10h.01M15 10h.01M12 14s-2 2-3 2c-1.5 0-3-1.5-3-3" />
                </svg>
                Simulated Link Failure
              </p>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Failure Edge — Node U" value={failU} onChange={setFailU} exclude={failV} />
                <SelectField label="Failure Edge — Node V" value={failV} onChange={setFailV} exclude={failU} />
              </div>
            </div>

            {/* Compute button */}
            <button
              onClick={handleCompute}
              disabled={loading}
              className="
                w-full py-3 rounded-xl font-mono text-sm font-semibold tracking-widest uppercase
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-gradient-to-r from-cyan-600 to-blue-600
                hover:from-cyan-500 hover:to-blue-500
                active:scale-[0.98]
                shadow-lg shadow-cyan-900/30
                flex items-center justify-center gap-3
              "
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Computing Route…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                  </svg>
                  Compute Route
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="flex gap-3 items-start rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-3">
                <svg className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-sm text-rose-300 font-mono">{error}</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4 pt-1">
                <p className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Computation Results
                </p>

                <PathDisplay
                  label="Original Path"
                  path={result.path}
                  cost={result.cost}
                />

                {/* Failure indicator */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-rose-800/40 bg-rose-950/20">
                  <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-xs font-mono text-rose-300">
                    Link failure simulated on edge{" "}
                    <span className="font-bold">{failU} — {failV}</span>
                    . Rerouting…
                  </p>
                </div>

                <PathDisplay
                  label="Rerouted Path (Post-Failure)"
                  path={result.new_path}
                  cost={result.new_cost}
                  highlight
                />

                {/* Network graph */}
                {result.image_url && (
                  <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/60">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Network Topology Graph</span>
                    </div>
                    <div className="p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${result.image_url}?t=${Date.now()}`}
                        alt="Network topology graph"
                        className="w-full rounded-lg object-contain max-h-80"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs font-mono text-slate-600 mt-8">
          SDON Controller · Flask backend @ 127.0.0.1:5000
        </p>
      </div>
    </main>
  );
}