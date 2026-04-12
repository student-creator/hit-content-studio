import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Tutorial from './Tutorial';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X } from 'lucide-react';
import { isDemoMode, setDemoMode } from '../demoData';
import { useI18n } from '../i18n';

const GUIDE_HIDDEN_KEY = 'hit-guide-hidden';

function GuideModal({ onClose, onStartTour }: { onClose: () => void; onStartTour: () => void }) {
  const { lang } = useI18n();
  const [hideForever, setHideForever] = useState(false);

  const handleClose = () => {
    if (hideForever) {
      try { localStorage.setItem(GUIDE_HIDDEN_KEY, 'true'); } catch {}
    }
    onClose();
  };

  const stepsFR = [
    { num: '1', title: 'Choisir une voix', desc: 'Selectionnez le profil de la personne qui publiera.' },
    { num: '2', title: 'Remplir le formulaire', desc: 'Sujet, donnees cles, type de contenu, cible, langue.' },
    { num: '3', title: 'Generer', desc: "Cliquez sur Generate et l'IA cree le post dans le ton choisi." },
    { num: '4', title: 'Affiner', desc: 'Utilisez Refine pour ameliorer un brouillon existant.' },
    { num: '5', title: 'Sauvegarder', desc: 'Enregistrez dans la bibliotheque ou ajoutez au calendrier.' },
    { num: '6', title: 'Visuels', desc: 'Creez des infographies et carrousels dans Visual Studio.' },
  ];
  const stepsEN = [
    { num: '1', title: 'Pick a voice', desc: 'Select the team member whose profile will post.' },
    { num: '2', title: 'Fill the form', desc: 'Topic, key data, content type, target, language.' },
    { num: '3', title: 'Generate', desc: 'Click Generate and the AI writes the post in the selected voice.' },
    { num: '4', title: 'Refine', desc: 'Use Refine to improve an existing draft.' },
    { num: '5', title: 'Save', desc: 'Save to the library or add to the editorial calendar.' },
    { num: '6', title: 'Visuals', desc: 'Create infographics and carousels in Visual Studio.' },
  ];
  const steps = lang === 'FR' ? stepsFR : stepsEN;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-brand-navy/30 backdrop-blur-sm z-[200]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-brand-warm-white rounded-2xl shadow-2xl z-[210] overflow-hidden"
      >
        <div className="bg-brand-bordeaux px-8 py-6 flex items-center justify-between">
          <h2 className="font-headline text-2xl text-white font-bold">HIT Content Studio</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-8 py-2 bg-brand-bordeaux/90">
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
            {lang === 'FR' ? 'Guide rapide' : 'Quick guide'}
          </p>
        </div>
        <div className="px-8 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {steps.map(step => (
            <div key={step.num} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-brand-bordeaux/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-brand-bordeaux">{step.num}</span>
              </div>
              <div>
                <p className="font-bold text-brand-navy text-sm">{step.title}</p>
                <p className="text-brand-navy/60 text-sm mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-8 py-5 border-t border-brand-bordeaux/10 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hideForever}
              onChange={(e) => setHideForever(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-brand-navy/20 text-brand-bordeaux accent-brand-bordeaux"
            />
            <span className="text-xs text-brand-navy/50">
              {lang === 'FR' ? 'Ne plus afficher' : "Don't show again"}
            </span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => { onStartTour(); onClose(); }}
              className="px-4 py-2 border border-brand-bordeaux text-brand-bordeaux rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-bordeaux/5 transition-all"
            >
              {lang === 'FR' ? 'Visite guidee' : 'Start tour'}
            </button>
            <button
              onClick={handleClose}
              className="px-5 py-2 bg-brand-bordeaux text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-bordeaux/90 transition-all"
            >
              {lang === 'FR' ? 'Compris' : 'Got it'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function Layout() {
  const [demo, setDemo] = useState(isDemoMode());
  const [showGuide, setShowGuide] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const { lang, setLang, t } = useI18n();

  const toggleDemo = () => {
    const next = !demo;
    setDemoMode(next);
    setDemo(next);
    window.dispatchEvent(new Event('demo-mode-change'));
  };

  const startTour = () => setTourKey(k => k + 1);

  return (
    <div className="min-h-screen bg-brand-warm-white flex flex-col">
      {/* EDHEC persistent banner */}
      <header className="bg-brand-bordeaux text-white flex items-center justify-between px-6 py-4 shadow-sm z-40 h-[72px]">
        <div className="flex items-center gap-4">
          <img src="/EDHEC_Logo_horizontal_white.png" alt="EDHEC" className="h-10 w-auto object-contain" />
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/20">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">
              {t('chrome.chair')}
            </span>
            <span className="text-sm font-bold text-white">HIT Content Studio</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Lang pill */}
          <div className="flex bg-white/10 rounded-full p-0.5 text-[10px] font-bold">
            <button
              onClick={() => setLang('EN')}
              className={`px-3 py-1 rounded-full transition-all ${lang === 'EN' ? 'bg-white text-brand-bordeaux' : 'text-white/70 hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('FR')}
              className={`px-3 py-1 rounded-full transition-all ${lang === 'FR' ? 'bg-white text-brand-bordeaux' : 'text-white/70 hover:text-white'}`}
            >
              FR
            </button>
          </div>
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/30 text-white hover:bg-white hover:text-brand-bordeaux transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {t('chrome.guide')}
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        <Tutorial launchKey={tourKey} />
        <Sidebar />
        <main className="flex-1 ml-[64px] p-8">
          <div className="flex justify-end items-center gap-2 mb-2">
            <button
              onClick={toggleDemo}
              className={
                demo
                  ? 'flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all bg-brand-teal text-white'
                  : 'flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border border-brand-navy/15 text-brand-navy/40 hover:border-brand-teal hover:text-brand-teal'
              }
            >
              <div className={demo ? 'w-2 h-2 rounded-full bg-white animate-pulse' : 'w-2 h-2 rounded-full bg-brand-navy/20'} />
              {t('chrome.demo')}
            </button>
          </div>

          {demo && (
            <div className="mb-4 px-4 py-2 bg-brand-teal/10 border border-brand-teal/20 rounded-lg text-brand-teal text-xs font-bold text-center">
              {t('chrome.demoActive')}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {showGuide && <GuideModal onClose={() => setShowGuide(false)} onStartTour={startTour} />}
      </AnimatePresence>
    </div>
  );
}
