import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  PenTool, 
  RotateCcw, 
  Copy, 
  Calendar as CalendarIcon, 
  Image as ImageIcon, 
  Flag,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, getDocs, addDoc, Timestamp, orderBy } from 'firebase/firestore';
import { VoiceProfile, Platform, Language, PostStatus, Draft, StyleRule, Cible } from '../types';
import { SIMONE_WHALE_DEFAULT, formatStyleRules, HARDCODED_STYLE_RULES } from '../constants';
import { generatePost, generateVisualSvg, getLengthBounds, countWords, truncateToWords } from '../services/aiService';
import VoiceCreator from '../components/VoiceCreator';
import { clsx, type ClassValue } from 'clsx';
import html2canvas from 'html2canvas';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Generate() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'generate' | 'refine'>('generate');
  const [topic, setTopic] = useState('');
  const [stats, setStats] = useState('');
  const [draftInput, setDraftInput] = useState('');
  const [contentType, setContentType] = useState('Baromètre');
  const [postLength, setPostLength] = useState('Medium');
  const [language, setLanguage] = useState<Language | 'FR+EN'>('FR');
  const [platform, setPlatform] = useState<Platform>('LinkedIn');
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile | null>(SIMONE_WHALE_DEFAULT);
  const [voices, setVoices] = useState<VoiceProfile[]>([SIMONE_WHALE_DEFAULT]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVoiceCreatorOpen, setIsVoiceCreatorOpen] = useState(false);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [lengthWarning, setLengthWarning] = useState('');
  const [isHashtagsExpanded, setIsHashtagsExpanded] = useState(false);
  const [selectedHashtagSet, setSelectedHashtagSet] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [cta, setCta] = useState('');
  const [cible, setCible] = useState<Cible | null>(null);
  const [styleRules, setStyleRules] = useState<StyleRule[]>([]);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const q = query(collection(db, 'voiceProfiles'));
        const querySnapshot = await getDocs(q);
        const voicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoiceProfile));
        if (voicesData.length > 0) {
          setVoices(voicesData);
          if (!selectedVoice || selectedVoice.id === 'simone-whale-default') {
            setSelectedVoice(voicesData[0]);
          }
        }
      } catch (e) {
        console.error('fetch voices failed', e);
      }
    };
    fetchVoices();
  }, []);

  useEffect(() => {
    const fetchStyleRules = async () => {
      try {
        const q = query(collection(db, 'styleRules'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userRules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StyleRule));
        setStyleRules([...HARDCODED_STYLE_RULES, ...userRules]);
      } catch (error) {
        console.error("Error fetching style rules:", error);
        setStyleRules(HARDCODED_STYLE_RULES);
      }
    };
    fetchStyleRules();
  }, []);

  const handleGenerate = async () => {
    if (!selectedVoice) return;
    setIsGenerating(true);
    setGeneratedContent('');
    
    try {
      const additionalRules = formatStyleRules(styleRules);
      const fullText = await generatePost({
        voiceName: selectedVoice.name,
        systemPromptFragment: selectedVoice.systemPromptFragment,
        platform,
        contentType,
        lengthTarget: postLength,
        charLimit: platform === 'LinkedIn' ? 3000 : 1000,
        language,
        topic,
        stats,
        link,
        cta,
        hashtags: selectedHashtagSet || '',
        draftInput,
        mode,
        cible: cible || undefined,
        additionalRules,
        onChunk: (chunk) => {
          setGeneratedContent(prev => prev + chunk);
        }
      });
      const { max: maxWords } = getLengthBounds(postLength);
      let finalText = fullText || '';
      if (countWords(finalText) > maxWords) {
        finalText = truncateToWords(finalText, maxWords);
        setLengthWarning(`Output exceeded ${maxWords} words and was truncated.`);
      } else {
        setLengthWarning('');
      }
      if (finalText) setGeneratedContent(finalText);
    } catch (error: any) {
      console.error("Generation failed:", error);
      setGeneratedContent(`[Generation error: ${error.message || 'Unknown error'}. Please try again.]`);
    } finally {
      setIsGenerating(false);
    }
  };

  const [showVisualGenerator, setShowVisualGenerator] = useState(false);
  const [visualHeadline, setVisualHeadline] = useState('');
  const [visualSubtitle, setVisualSubtitle] = useState('');
  const [visualStats, setVisualStats] = useState('');
  const [visualSvg, setVisualSvg] = useState('');
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

  useEffect(() => {
    if (topic) setVisualHeadline(topic);
    if (stats) setVisualStats(stats);
  }, [topic, stats]);

  const handleGenerateVisual = async () => {
    setIsGeneratingVisual(true);
    try {
      const additionalRules = formatStyleRules(styleRules);
      const svg = await generateVisualSvg({
        categoryLabel: contentType.toUpperCase(),
        headline: visualHeadline,
        subtitle: visualSubtitle,
        statsArray: visualStats,
        aspectRatio: platform === 'LinkedIn' ? '1:1' : '9:16',
        additionalRules
      });
      setVisualSvg(svg || '');
    } catch (error) {
      console.error("Visual generation failed:", error);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  const handleDownloadPng = async () => {
    const element = document.getElementById('visual-preview');
    if (!element) return;
    const canvas = await html2canvas(element, { 
      backgroundColor: null,
      scale: 2,
      useCORS: true
    });
    const link = document.createElement('a');
    link.download = `HIT-Visual-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto" data-tour="module-content">
      {/* Voice Profile Selector */}
      <div data-tour="voice-selector" className="mb-6 bg-white rounded-2xl p-4 border border-brand-bordeaux/5 shadow-sm relative">
        <label className="text-[10px] font-bold text-brand-coral uppercase tracking-[0.2em] mb-2 block">Posting As</label>
        <button
          type="button"
          onClick={() => setIsVoiceDropdownOpen(o => !o)}
          className="flex items-center gap-4 w-full text-left"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-headline font-bold text-sm overflow-hidden flex-shrink-0"
            style={{ backgroundColor: selectedVoice?.avatarColor || '#6B1E2E' }}
          >
            {selectedVoice?.avatarPhoto ? (
              <img src={selectedVoice.avatarPhoto} alt={selectedVoice.name} className="w-full h-full object-cover" />
            ) : (
              selectedVoice?.name.charAt(0) || '?'
            )}
          </div>
          <div className="flex flex-col flex-1">
            <span className="font-headline text-base text-brand-bordeaux font-bold leading-tight">
              {selectedVoice?.name || 'Select a voice'}
            </span>
            <span className="text-xs text-brand-navy/50 font-medium">
              {selectedVoice?.role || ''}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-brand-navy/40 transition-transform", isVoiceDropdownOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
          {isVoiceDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full mt-1 bg-white border border-brand-bordeaux/10 rounded-xl shadow-lg z-30 overflow-hidden"
            >
              {voices.map(voice => (
                <button
                  key={voice.id}
                  onClick={() => { setSelectedVoice(voice); setIsVoiceDropdownOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-warm-white transition-all",
                    selectedVoice?.id === voice.id && "bg-brand-bordeaux/5"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-headline font-bold text-xs overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: voice.avatarColor }}
                  >
                    {voice.avatarPhoto ? (
                      <img src={voice.avatarPhoto} alt={voice.name} className="w-full h-full object-cover" />
                    ) : (
                      voice.name.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-brand-bordeaux leading-tight">{voice.name}</span>
                    <span className="text-[10px] text-brand-navy/50">{voice.role}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-brand-bordeaux">Craft your post.</h1>
        <p className="font-body text-brand-navy/60 mt-2">Craft content for the EDHEC Management in Innovative Health Chair.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
        {/* Left Panel - Inputs */}
        <div className="card space-y-6">
          <div data-tour="mode-toggle" className="flex bg-brand-warm-white p-1 rounded-lg border border-brand-bordeaux/10">
            <button
              onClick={() => setMode('generate')}
              className={cn(
                "flex-1 py-2 rounded-md font-body font-bold text-xs transition-all",
                mode === 'generate' ? "bg-white text-brand-bordeaux shadow-sm" : "text-brand-navy/40 hover:text-brand-navy"
              )}
            >
              ✨ Generate from scratch
            </button>
            <button
              onClick={() => setMode('refine')}
              className={cn(
                "flex-1 py-2 rounded-md font-body font-bold text-xs transition-all",
                mode === 'refine' ? "bg-white text-brand-bordeaux shadow-sm" : "text-brand-navy/40 hover:text-brand-navy"
              )}
            >
              ✏️ Refine a draft
            </button>
          </div>

          {mode === 'generate' ? (
            <>
              <div>
                <label className="input-label">Topic / sujet</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Baromètre santé connectée 2026, Webinaire IA en santé, MedInTechs 2026"
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Key facts & data points</label>
                <textarea
                  rows={4}
                  value={stats}
                  onChange={(e) => setStats(e.target.value)}
                  placeholder="e.g. 54% des Français prêts à utiliser l'IA pour leur santé, 63% des femmes ont du mal à accéder à un spécialiste"
                  className="input-field resize-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="input-label">Your draft / idée de départ</label>
              <textarea
                rows={8}
                value={draftInput}
                onChange={(e) => setDraftInput(e.target.value)}
                placeholder="Paste your rough draft or bullet points here..."
                className="input-field resize-none"
              />
            </div>
          )}

          <div data-tour="content-type">
            <label className="input-label">Content Type</label>
            <div className="flex flex-wrap gap-2">
              {['Baromètre', 'Événement', 'Webinaire', 'Certificats HIT', 'Thought leadership', 'Newsletter'].map(type => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                    contentType === type ? "bg-brand-bordeaux text-white border-brand-bordeaux" : "bg-white text-brand-navy/60 border-brand-bordeaux/10"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Cible (target audience)</label>
            <div className="flex flex-wrap gap-2">
              {(['Professionnels de sante', 'Decideurs', 'Etudiants', 'Grand public', 'Partenaires', 'Academiques'] as Cible[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCible(cible === c ? null : c)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                    cible === c ? "bg-brand-teal text-white border-brand-teal" : "bg-white text-brand-navy/60 border-brand-bordeaux/10"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Post Length</label>
              <select 
                value={postLength}
                onChange={(e) => setPostLength(e.target.value)}
                className="input-field text-xs"
              >
                <option value="Short">Short (150 to 300 words)</option>
                <option value="Medium">Medium (300 to 800 words)</option>
                <option value="Long">Long (800 to 1500 words)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Language</label>
              <div className="flex bg-brand-warm-white p-1 rounded-lg border border-brand-bordeaux/10">
                {['FR', 'EN', 'FR+EN'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang as any)}
                    className={cn(
                      "flex-1 py-1 rounded-md font-body font-bold text-[10px] transition-all",
                      language === lang ? "bg-white text-brand-bordeaux shadow-sm" : "text-brand-navy/40"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Platform</label>
            <div className="flex bg-brand-warm-white p-1 rounded-lg border border-brand-bordeaux/10">
              {['LinkedIn', 'WhatsApp'].map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p as Platform)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md font-body font-bold text-xs transition-all",
                    platform === p ? "bg-white text-brand-bordeaux shadow-sm" : "text-brand-navy/40"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-brand-bordeaux/5 pt-4">
            <button
              onClick={() => setIsHashtagsExpanded(!isHashtagsExpanded)}
              className="flex items-center justify-between w-full text-brand-bordeaux font-bold text-xs uppercase tracking-widest"
            >
              Hashtags
              {isHashtagsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {isHashtagsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-3 space-y-2"
                >
                  {/* Mock hashtag sets */}
                  {['Santé connectée', 'IA en santé', 'Baromètre', 'Événement', 'Certificats HIT'].map(set => (
                    <button
                      key={set}
                      onClick={() => setSelectedHashtagSet(set)}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-md text-[10px] font-medium transition-all",
                        selectedHashtagSet === set ? "bg-brand-bordeaux/10 text-brand-bordeaux" : "hover:bg-brand-bordeaux/5 text-brand-navy/60"
                      )}
                    >
                      {set}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <button
              data-tour="generate-button"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedVoice || (mode === 'generate' ? !topic : !draftInput)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.div>
                  GENERATING...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === 'generate' ? 'GENERATE POST' : 'REFINE DRAFT'}
                </>
              )}
            </button>
            {!selectedVoice && (
              <p className="text-center text-[10px] font-bold text-brand-coral uppercase tracking-widest">
                Select a voice to continue
              </p>
            )}
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="space-y-8">
          <div className="card min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <label className="input-label">Generated Content</label>
              <span className={cn(
                "text-[10px] font-bold",
                countWords(generatedContent) > getLengthBounds(postLength).max ? "text-brand-coral" : "text-brand-navy/40"
              )}>
                {countWords(generatedContent)} words / max {getLengthBounds(postLength).max} | {generatedContent.length} chars
              </span>
            </div>
            {lengthWarning && (
              <div className="mb-3 px-3 py-2 bg-brand-coral/10 border border-brand-coral/30 rounded-md text-[11px] font-bold text-brand-coral">
                {lengthWarning}
              </div>
            )}

            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="flex-1 w-full bg-brand-warm-white/30 border-l-4 border-brand-bordeaux p-6 font-body text-sm leading-relaxed resize-none focus:outline-none"
              placeholder="Your generated post will appear here..."
            />

            <div className="mt-6 flex flex-wrap gap-3">
              <button 
                onClick={handleGenerate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-brand-bordeaux/10 rounded-lg text-[10px] font-bold text-brand-bordeaux uppercase tracking-widest hover:bg-brand-bordeaux/5 transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Regenerate
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-brand-bordeaux/10 rounded-lg text-[10px] font-bold text-brand-bordeaux uppercase tracking-widest hover:bg-brand-bordeaux/5 transition-all">
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-brand-bordeaux/10 rounded-lg text-[10px] font-bold text-brand-bordeaux uppercase tracking-widest hover:bg-brand-bordeaux/5 transition-all">
                <CalendarIcon className="w-3 h-3" /> Save to calendar
              </button>
              <button 
                onClick={() => setShowVisualGenerator(!showVisualGenerator)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-brand-bordeaux/10 rounded-lg text-[10px] font-bold text-brand-teal uppercase tracking-widest hover:bg-brand-teal/5 transition-all"
              >
                <ImageIcon className="w-3 h-3" /> Generate visual
              </button>
              <button className="p-2 border border-brand-bordeaux/10 rounded-lg text-brand-coral hover:bg-brand-coral/5 transition-all">
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showVisualGenerator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="card space-y-6 overflow-hidden"
              >
                <h3 className="font-headline text-2xl text-brand-teal">Visual Generator</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="input-label">Visual Headline</label>
                    <input 
                      type="text" 
                      value={visualHeadline}
                      onChange={(e) => setVisualHeadline(e.target.value)}
                      className="input-field" 
                    />
                  </div>
                  <div>
                    <label className="input-label">Subtitle</label>
                    <input 
                      type="text" 
                      value={visualSubtitle}
                      onChange={(e) => setVisualSubtitle(e.target.value)}
                      className="input-field" 
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Stats Array (one per line)</label>
                  <textarea 
                    rows={3}
                    value={visualStats}
                    onChange={(e) => setVisualStats(e.target.value)}
                    className="input-field resize-none" 
                  />
                </div>
                <button 
                  onClick={handleGenerateVisual}
                  disabled={isGeneratingVisual}
                  className="btn-secondary w-full"
                >
                  {isGeneratingVisual ? 'GENERATING VISUAL...' : 'GENERATE VISUAL'}
                </button>

                {visualSvg && (
                  <div className="mt-8 space-y-4">
                    <div 
                      id="visual-preview"
                      className="w-full bg-white border border-brand-bordeaux/10 rounded-lg overflow-hidden shadow-inner"
                      dangerouslySetInnerHTML={{ __html: visualSvg }}
                    />
                    <div className="flex gap-3">
                      <button 
                        onClick={handleDownloadPng}
                        className="flex-1 py-2 border border-brand-teal/20 rounded-lg text-[10px] font-bold text-brand-teal uppercase tracking-widest hover:bg-brand-teal/5 transition-all"
                      >
                        Download PNG
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-brand-navy/5 rounded-xl p-8 border border-brand-bordeaux/5">
            <h3 className="text-[10px] font-bold text-brand-coral uppercase tracking-widest mb-6">
              {platform} Preview
            </h3>
            
            {platform === 'LinkedIn' ? (
              <div className="bg-white rounded-md shadow-sm border border-black/5 overflow-hidden max-w-[550px] mx-auto">
                <div className="p-3 flex items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-headline font-bold text-xl"
                    style={{ backgroundColor: selectedVoice?.avatarColor || '#6B1E2E' }}
                  >
                    {selectedVoice?.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black/90">{selectedVoice?.name || 'User Name'}</p>
                    <p className="text-[10px] text-black/60 truncate max-w-[300px]">{selectedVoice?.role || 'Professional Role'}</p>
                    <p className="text-[10px] text-black/40">1h • 🌐</p>
                  </div>
                </div>
                <div className="px-4 pb-4 text-sm text-black/90 whitespace-pre-wrap">
                  {generatedContent || "The evolution of Digital Twins in healthcare isn't just about data: it's about the strategic future of health management. 🏥"}
                </div>
                {visualSvg && (
                  <div className="px-4 pb-4">
                    <div 
                      className="w-full rounded-md overflow-hidden border border-black/5"
                      dangerouslySetInnerHTML={{ __html: visualSvg }}
                    />
                  </div>
                )}
                <div className="border-t border-black/5 p-2 flex justify-around">
                  {['Like', 'Comment', 'Repost', 'Send'].map(action => (
                    <button key={action} className="text-xs font-bold text-black/60 hover:bg-black/5 px-4 py-2 rounded-md transition-all">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-[350px] mx-auto">
                <div className="bg-[#E2FED6] rounded-2xl rounded-tl-none p-4 shadow-sm relative">
                  <div className="text-sm text-black/90 whitespace-pre-wrap">
                    {generatedContent || "The evolution of Digital Twins in healthcare isn't just about data: it's about the strategic future of health management. 🏥"}
                  </div>
                  <div className="text-[10px] text-black/40 text-right mt-1">
                    10:45 AM
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voices Slide-over */}
      <AnimatePresence>
        {isVoiceCreatorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVoiceCreatorOpen(false)}
              className="fixed inset-0 bg-brand-navy/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[110] p-12 overflow-y-auto"
            >
              <VoiceCreator 
                onClose={() => setIsVoiceCreatorOpen(false)}
                onSuccess={(newVoice) => {
                  setVoices(prev => [...prev, newVoice]);
                  setSelectedVoice(newVoice);
                  setIsVoiceCreatorOpen(false);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
