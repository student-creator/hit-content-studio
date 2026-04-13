import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Edit3,
  ArrowRight,
  Languages,
  PenTool,
  Image as ImageIcon,
  Upload,
  X as CloseIcon,
  RotateCcw
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { VoiceProfile, Language, EmojiUsage } from '../types';
import { SIMONE_WHALE_DEFAULT } from '../constants';
import { analyseTone } from '../services/aiService';
import VoiceCreator from '../components/VoiceCreator';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PRESET_COLORS = [
  '#6B1E2E', // Bordeaux
  '#D4614A', // Coral
  '#2A7D6B', // Teal
  '#1A1F3C', // Navy
  '#F59E0B', // Amber
  '#10B981', // Sage
  '#EC4899', // Dusty Rose
  '#374151', // Charcoal
];

export default function Voices() {
  const [voices, setVoices] = useState<VoiceProfile[]>([SIMONE_WHALE_DEFAULT]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { fetchVoices(); }, []);

  const fetchVoices = async () => {
    try {
      const q = query(collection(db, 'voiceProfiles'));
      const querySnapshot = await getDocs(q);
      const voicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoiceProfile));
      if (voicesData.length > 0) setVoices(voicesData);
    } catch (e) {
      console.error('fetch voices failed', e);
    }
  };

  const LS_KEY = 'hit-voice-photos';
  const getLocalPhotos = (): Record<string, string> => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  };
  const setLocalPhoto = (id: string, dataUrl: string) => {
    const map = getLocalPhotos();
    map[id] = dataUrl;
    try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch {}
    setVoices(vs => vs.map(v => v.id === id ? { ...v, avatarPhoto: dataUrl } : v));
  };
  const handlePhotoUpload = (voiceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLocalPhoto(voiceId, reader.result as string);
    reader.readAsDataURL(file);
  };
  // Hydrate photos from localStorage on first mount
  useEffect(() => {
    const map = getLocalPhotos();
    if (Object.keys(map).length === 0) return;
    setVoices(vs => vs.map(v => map[v.id] ? { ...v, avatarPhoto: map[v.id] } : v));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voices.length]);

  return (
    <div className="max-w-7xl mx-auto" data-tour="module-voices">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-headline text-3xl font-bold text-brand-bordeaux">Voices</h2>
        <button
          data-tour="voices-create"
          onClick={() => setIsCreating(true)}
          className="p-2 bg-brand-bordeaux text-white rounded-full hover:bg-brand-bordeaux/90 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid gap-6 mb-12" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {voices.map(voice => (
          <div key={voice.id} className="card p-6 hover:border-brand-bordeaux/30 transition-all group">
            <div className="flex items-start gap-4 mb-4">
              <label className="relative w-20 h-20 rounded-full cursor-pointer flex-shrink-0 group/photo" title="Upload profile photo">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-headline font-bold text-2xl overflow-hidden"
                  style={{ backgroundColor: voice.avatarColor }}
                >
                  {voice.avatarPhoto ? (
                    <img src={voice.avatarPhoto} alt={voice.name} className="w-full h-full object-cover" />
                  ) : (
                    voice.name.charAt(0)
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-brand-navy/50 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-all">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(voice.id, e)} />
              </label>
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-lg text-brand-bordeaux truncate">{voice.name}</p>
                <p className="text-xs text-brand-navy/60 leading-snug">{voice.role}</p>
                <div className="flex gap-1 mt-2">
                  {voice.languages.map(l => (
                    <span key={l} className="text-[9px] font-bold text-brand-navy/50 bg-brand-warm-white px-1.5 py-0.5 rounded">{l}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {voice.styleTags.slice(0, 4).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-brand-bordeaux/5 text-brand-bordeaux text-[9px] font-bold rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-bordeaux/5">
              <label className="text-brand-navy/40 hover:text-brand-bordeaux cursor-pointer p-1" title="Upload photo">
                <Upload className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(voice.id, e)} />
              </label>
              <button className="text-brand-navy/40 hover:text-brand-bordeaux p-1"><Edit3 className="w-3.5 h-3.5" /></button>
              <button className="text-brand-navy/40 hover:text-brand-coral p-1"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Wizard */}
      <div>
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-8"
            >
              <VoiceCreator 
                onClose={() => setIsCreating(false)} 
                onSuccess={() => {
                  setIsCreating(false);
                  fetchVoices();
                }} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-12"
            >
              <div className="w-20 h-20 bg-brand-bordeaux/5 rounded-full flex items-center justify-center text-brand-bordeaux mb-6">
                <PenTool className="w-10 h-10" />
              </div>
              <h3 className="font-headline text-3xl text-brand-bordeaux mb-4">Build AI Tone Profiles</h3>
              <p className="text-brand-navy/60 max-w-md mb-8">
                Extract the unique writing style of your team members to generate posts that sound exactly like them.
              </p>
              <button 
                onClick={() => setIsCreating(true)}
                className="btn-primary"
              >
                Create New Profile
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const RotateCcwIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);
