import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Hash, 
  Calendar as CalendarIcon, 
  Key, 
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { auth, logOut, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { HashtagSet } from '../types';
import { CONTENT_GUIDELINES } from '../constants';
import { isDemoMode } from '../demoData';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Settings() {
  const [user] = useAuthState(auth);
  const [hashtagSets, setHashtagSets] = useState<HashtagSet[]>([]);
  const [newSetName, setNewSetName] = useState('');
  const [newSetTags, setNewSetTags] = useState('');
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'missing_key' | 'error' | 'demo'>('checking');
  const [demo, setDemo] = useState(isDemoMode());

  // Listen for demo mode changes
  useEffect(() => {
    const handler = () => {
      const on = isDemoMode();
      setDemo(on);
      if (on) setApiStatus('demo');
    };
    window.addEventListener('demo-mode-change', handler);
    return () => window.removeEventListener('demo-mode-change', handler);
  }, []);

  const isAdmin = user?.email === 'anna.ritoper@gmail.com';

  useEffect(() => {
    if (user) {
      fetchHashtagSets();
      checkApiStatus();
    }
  }, [user]);

  const checkApiStatus = async () => {
    if (isDemoMode()) {
      setApiStatus('demo');
      return;
    }
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiStatus(data.status === 'ok' ? 'ok' : 'missing_key');
    } catch {
      setApiStatus('error');
    }
  };

  const fetchHashtagSets = async () => {
    const q = query(collection(db, 'hashtagSets'));
    const querySnapshot = await getDocs(q);
    const sets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HashtagSet));
    setHashtagSets(sets);

    if (sets.length === 0 && isAdmin) {
      seedHashtags();
    }
  };

  const seedHashtags = async () => {
    const defaultSets = [
      { name: 'Santé connectée', hashtags: ['#SantéConnectée', '#eSanté', '#InnovationSanté', '#EDHEC'] },
      { name: 'IA en santé', hashtags: ['#IAenSanté', '#DigitalHealth', '#HealthTech', '#AIinHealthcare', '#EDHEC'] },
      { name: 'Baromètre', hashtags: ['#SantéConnectée', '#Ipsos', '#EDHEC', '#Data', '#HealthTech'] },
      { name: 'Événement', hashtags: ['#EDHEC', '#InnovationSanté', '#HealthTech', '#MedTech'] },
      { name: 'Certificats HIT', hashtags: ['#EDHEC', '#HealthInnovation', '#ExecutiveEducation', '#HIT'] },
    ];
    for (const set of defaultSets) {
      await addDoc(collection(db, 'hashtagSets'), set);
    }
    fetchHashtagSets();
  };

  const handleAddSet = async () => {
    if (!newSetName || !newSetTags) return;
    const hashtags = newSetTags.split(',').map(t => t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`);
    await addDoc(collection(db, 'hashtagSets'), { name: newSetName, hashtags });
    setNewSetName('');
    setNewSetTags('');
    setIsAddingSet(false);
    fetchHashtagSets();
  };

  const handleDeleteSet = async (id: string) => {
    await deleteDoc(doc(db, 'hashtagSets', id));
    fetchHashtagSets();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header>
        <h1 className="font-headline text-4xl text-brand-bordeaux">Settings</h1>
        <p className="font-body text-brand-navy/60 mt-2">Manage your workspace, voice profiles, and AI configurations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-12">
          <nav className="space-y-1">
            {['Account', 'Hashtag Manager', 'Calendar', 'API', 'Style Guide'].map(tab => (
              <button
                key={tab}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-brand-navy/60 hover:bg-brand-bordeaux/5 hover:text-brand-bordeaux transition-all"
              >
                {tab}
              </button>
            ))}
          </nav>

        <div className="space-y-12">
          {/* Account Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-brand-bordeaux/10 pb-4">
              <User className="w-5 h-5 text-brand-bordeaux" />
              <h2 className="font-headline text-2xl text-brand-bordeaux">Account</h2>
            </div>
            <div className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={user?.photoURL || ''} className="w-12 h-12 rounded-full" alt="Avatar" />
                <div>
                  <p className="font-bold text-brand-navy">{user?.displayName}</p>
                  <p className="text-xs text-brand-navy/60">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> {isAdmin ? 'Admin' : 'Editor'}
              </div>
            </div>
            <button 
              onClick={() => logOut()}
              className="flex items-center gap-2 text-brand-coral font-bold text-sm hover:underline"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </section>

          {/* Hashtag Manager Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-brand-bordeaux/10 pb-4">
              <Hash className="w-5 h-5 text-brand-bordeaux" />
              <h2 className="font-headline text-2xl text-brand-bordeaux">Hashtag Manager</h2>
            </div>
            
            <div className="space-y-4">
              {hashtagSets.map(set => (
                <div key={set.id} className="card p-4 flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-brand-navy text-sm mb-1">{set.name}</p>
                    <p className="text-[10px] text-brand-navy/40 font-mono">{set.hashtags.join(' ')}</p>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeleteSet(set.id)}
                      className="p-2 text-brand-navy/20 hover:text-brand-coral opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {isAdmin && (
                <div className="pt-4">
                  {isAddingSet ? (
                    <div className="card p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">Set Name</label>
                          <input 
                            type="text" 
                            value={newSetName}
                            onChange={(e) => setNewSetName(e.target.value)}
                            className="input-field" 
                            placeholder="e.g. Innovation" 
                          />
                        </div>
                        <div>
                          <label className="input-label">Hashtags (comma separated)</label>
                          <input 
                            type="text" 
                            value={newSetTags}
                            onChange={(e) => setNewSetTags(e.target.value)}
                            className="input-field" 
                            placeholder="#Health, #Tech" 
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setIsAddingSet(false)} className="text-brand-navy/60 font-bold text-sm">Cancel</button>
                        <button onClick={handleAddSet} className="btn-primary py-2">Add Set</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingSet(true)}
                      className="flex items-center gap-2 text-brand-bordeaux font-bold text-sm hover:underline"
                    >
                      <Plus className="w-4 h-4" /> Add new hashtag set
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* API Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-brand-bordeaux/10 pb-4">
              <Key className="w-5 h-5 text-brand-bordeaux" />
              <h2 className="font-headline text-2xl text-brand-bordeaux">API Configuration</h2>
            </div>
            <div className="card space-y-4">
              <p className="text-sm text-brand-navy/60">
                The API key is managed server-side. Contact the admin if generation is not working.
              </p>
              <div className="pt-4 border-t border-brand-bordeaux/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    apiStatus === 'demo' ? "bg-brand-teal animate-pulse" : apiStatus === 'ok' ? "bg-brand-teal animate-pulse" : apiStatus === 'checking' ? "bg-brand-navy/20 animate-pulse" : "bg-brand-coral"
                  )} />
                  <p className="font-bold text-brand-navy text-sm">
                    {apiStatus === 'demo' ? 'Demo Mode (pas d\'appel API)' : apiStatus === 'ok' ? 'Anthropic Claude Connected' : apiStatus === 'checking' ? 'Checking...' : 'Server not reachable'}
                  </p>
                </div>
                <p className="text-[10px] text-brand-navy/40 font-mono">
                  {apiStatus === 'demo' ? 'Donnees fictives' : 'Model: claude-sonnet-4-6'}
                </p>
              </div>
            </div>
          </section>

          {/* Style Guide Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-brand-bordeaux/10 pb-4">
              <BookOpen className="w-5 h-5 text-brand-bordeaux" />
              <h2 className="font-headline text-2xl text-brand-bordeaux">Style Guide</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="card space-y-4">
                <h3 className="font-headline font-bold text-brand-navy flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-bordeaux" />
                  Text Formatting Rules
                </h3>
                <ul className="space-y-2">
                  {CONTENT_GUIDELINES.textFormatting.map((rule, i) => (
                    <li key={i} className="text-sm text-brand-navy/70 flex gap-3">
                      <span className="text-brand-bordeaux font-bold">{i + 1}.</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card space-y-4">
                <h3 className="font-headline font-bold text-brand-navy flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-teal" />
                  Humanization Rules
                </h3>
                <ul className="space-y-2">
                  {CONTENT_GUIDELINES.humanization.map((rule, i) => (
                    <li key={i} className="text-sm text-brand-navy/70 flex gap-3">
                      <span className="text-brand-teal font-bold">{i + 1}.</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
