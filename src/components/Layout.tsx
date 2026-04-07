import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signIn } from '../firebase';
import Sidebar from './Sidebar';
import { motion } from 'motion/react';
import { isDemoMode, setDemoMode } from '../demoData';

export default function Layout() {
  const [user, loading] = useAuthState(auth);
  const [demo, setDemo] = useState(isDemoMode());

  const toggleDemo = () => {
    const next = !demo;
    setDemoMode(next);
    setDemo(next);
    // Force re-render across the app
    window.dispatchEvent(new Event('demo-mode-change'));
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-warm-white">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 bg-brand-bordeaux rounded-lg flex items-center justify-center text-white font-headline font-bold text-2xl"
        >
          H
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-warm-white p-6">
        <div className="w-16 h-16 bg-brand-bordeaux rounded-xl flex items-center justify-center text-white font-headline font-bold text-4xl mb-8 shadow-xl">
          H
        </div>
        <h1 className="font-headline text-4xl text-brand-bordeaux mb-4 text-center">HIT Content Studio</h1>
        <p className="font-body text-brand-navy/60 mb-8 text-center max-w-md">
          Transform complex clinical research into engaging thought leadership for the EDHEC community.
        </p>
        <button
          onClick={() => signIn()}
          className="btn-primary flex items-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-warm-white flex">
      <Sidebar />
      <main className="flex-1 ml-[64px] p-8">
        {/* Demo Mode toggle */}
        <div className="flex justify-end mb-2">
          <button
            onClick={toggleDemo}
            className={
              demo
                ? "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all bg-brand-teal text-white"
                : "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border border-brand-navy/15 text-brand-navy/40 hover:border-brand-teal hover:text-brand-teal"
            }
          >
            <div className={
              demo
                ? "w-2 h-2 rounded-full bg-white animate-pulse"
                : "w-2 h-2 rounded-full bg-brand-navy/20"
            } />
            Demo Mode
          </button>
        </div>

        {/* Demo banner */}
        {demo && (
          <div className="mb-4 px-4 py-2 bg-brand-teal/10 border border-brand-teal/20 rounded-lg text-brand-teal text-xs font-bold text-center">
            Mode Demo actif
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
