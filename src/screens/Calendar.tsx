import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  X,
  ExternalLink
} from 'lucide-react';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { CalendarEntry, VoiceProfile, PostStatus, Platform, Language } from '../types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, getDay } from 'date-fns';
import { isDemoMode, DEMO_CALENDAR_ENTRIES } from '../demoData';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STATUS_OPTIONS: PostStatus[] = ['A rediger', 'Brouillon', 'Pret', 'Publie'];

const STATUS_STYLES: Record<string, string> = {
  'Publie': 'bg-brand-bordeaux text-white',
  'Pret': 'bg-brand-teal/10 text-brand-teal border border-brand-teal',
  'Brouillon': 'bg-brand-coral/10 text-brand-coral border border-dashed border-brand-coral',
  'A rediger': 'bg-brand-navy/5 text-brand-navy/60 border border-brand-navy/20',
};

const STATUS_DOT: Record<string, string> = {
  'Publie': 'bg-brand-bordeaux',
  'Pret': 'bg-brand-teal',
  'Brouillon': 'bg-brand-coral',
  'A rediger': 'bg-brand-navy/20',
};

interface EntryForm {
  voiceName: string;
  avatarColor: string;
  platform: Platform;
  language: Language | 'FR+EN';
  theme: string;
  topic: string;
  status: PostStatus;
  date: string; // yyyy-MM-dd for input[type=date]
}

const EMPTY_FORM: EntryForm = {
  voiceName: '',
  avatarColor: '#6B1E2E',
  platform: 'LinkedIn',
  language: 'FR',
  theme: '',
  topic: '',
  status: 'A rediger',
  date: format(new Date(), 'yyyy-MM-dd'),
};

export default function Calendar() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EntryForm>(EMPTY_FORM);
  const [demo, setDemo] = useState(isDemoMode());

  // Listen for demo mode changes
  useEffect(() => {
    const handler = () => setDemo(isDemoMode());
    window.addEventListener('demo-mode-change', handler);
    return () => window.removeEventListener('demo-mode-change', handler);
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const voicesSnap = await getDocs(collection(db, 'voiceProfiles'));
    const voicesData = voicesSnap.docs.map(d => ({ id: d.id, ...d.data() } as VoiceProfile));
    setVoices(voicesData);

    const entriesSnap = await getDocs(query(collection(db, 'calendarEntries'), orderBy('date', 'asc')));
    const entriesData = entriesSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    } as CalendarEntry));
    setEntries(entriesData);

    const isAdmin = user?.email === 'anna.ritoper@gmail.com';
    if (entriesData.length === 0 && isAdmin) {
      await seedCalendar();
    }
  };

  const seedCalendar = async () => {
    const seedData = [
      { date: new Date(2026, 0, 13), voiceName: 'Loick', avatarColor: '#D4614A', language: 'FR', theme: "Retour d'experience", topic: "Images_Valeur, Financement et Gestion financiere des systemes de Sante", status: 'A rediger' },
      { date: new Date(2026, 0, 28), voiceName: 'EDHEC', avatarColor: '#6B1E2E', language: 'FR', theme: "Barometre/Data Privacy Day", topic: "IA et sante : 94% des Francais estiment que les patients doivent etre informes", status: 'Publie' },
      { date: new Date(2026, 1, 24), voiceName: 'EDHEC', avatarColor: '#6B1E2E', language: 'FR', theme: "Sante connectee", topic: "27% seulement des patients chroniques utilisent les outils connectes", status: 'Publie' },
      { date: new Date(2026, 1, 28), voiceName: 'EDHEC', avatarColor: '#6B1E2E', language: 'FR', theme: "Evenement MedInTechs", topic: "MedInTechs 2026 Stand C21", status: 'Publie' },
      { date: new Date(2026, 2, 8), voiceName: 'EDHEC', avatarColor: '#6B1E2E', language: 'FR', theme: "Barometre/8 Mars", topic: "3 posts: inegalites acces soins femmes, IA et adhesion femmes, donnees de sante", status: 'Publie' },
      { date: new Date(2026, 2, 9), voiceName: 'EDHEC', avatarColor: '#6B1E2E', language: 'FR', theme: "MedInTechs", topic: "Repost MedInTechs Day 2", status: 'Publie' },
      { date: new Date(2026, 3, 8), voiceName: 'EDHEC', avatarColor: '#6B1E2E', language: 'FR', theme: "Barometre", topic: "Journee mondiale de la sante : les chiffres cles du Barometre 2026", status: 'Pret' },
      { date: new Date(2026, 3, 15), voiceName: 'Simone Whale', avatarColor: '#6B1E2E', language: 'FR', theme: "Leadership", topic: "Digital transformation in hospitals: a leadership challenge", status: 'Brouillon' },
      { date: new Date(2026, 3, 22), voiceName: 'EDHEC', avatarColor: '#6B1E2E', language: 'FR+EN', theme: "Certificats HIT", topic: "Ouverture des inscriptions : certificat IA et Management en Sante", status: 'A rediger' },
      { date: new Date(2026, 3, 28), voiceName: 'Loick', avatarColor: '#D4614A', language: 'FR', theme: "Webinaire", topic: "Replay webinaire : IA generative et parcours patient", status: 'A rediger' },
      { date: new Date(2026, 4, 20), voiceName: 'Loick', avatarColor: '#D4614A', language: 'FR', theme: "Innovation", topic: "The future of AI in cardiology", status: 'Pret' },
    ];

    for (const item of seedData) {
      await addDoc(collection(db, 'calendarEntries'), {
        ...item,
        date: Timestamp.fromDate(item.date),
        voiceProfileId: 'seed',
        platform: 'LinkedIn',
        createdAt: Timestamp.now()
      });
    }
    fetchData();
  };

  // CRUD operations
  const openCreateForm = (day?: Date) => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      date: format(day || new Date(), 'yyyy-MM-dd'),
    });
    setShowForm(true);
  };

  const openEditForm = (entry: CalendarEntry) => {
    setEditingId(entry.id);
    setForm({
      voiceName: entry.voiceName,
      avatarColor: entry.avatarColor || '#6B1E2E',
      platform: entry.platform,
      language: entry.language,
      theme: entry.theme,
      topic: entry.topic,
      status: entry.status,
      date: format(entry.date.toDate(), 'yyyy-MM-dd'),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const dateObj = new Date(form.date + 'T12:00:00');
    const data = {
      voiceName: form.voiceName,
      avatarColor: form.avatarColor,
      platform: form.platform,
      language: form.language,
      theme: form.theme,
      topic: form.topic,
      status: form.status,
      date: Timestamp.fromDate(dateObj),
    };

    if (editingId) {
      await updateDoc(doc(db, 'calendarEntries', editingId), data);
    } else {
      await addDoc(collection(db, 'calendarEntries'), {
        ...data,
        voiceProfileId: '',
        createdAt: Timestamp.now(),
      });
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'calendarEntries', id));
    fetchData();
  };

  const handleStatusChange = async (id: string, status: PostStatus) => {
    await updateDoc(doc(db, 'calendarEntries', id), { status });
    fetchData();
  };

  const openInGenerate = (entry: CalendarEntry) => {
    const params = new URLSearchParams({
      topic: entry.topic,
      voice: entry.voiceName,
      platform: entry.platform,
      language: entry.language,
    });
    navigate(`/generate?${params.toString()}`);
  };

  // Calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month to align with Monday (getDay: 0=Sun, 1=Mon ... 6=Sat)
  const startDayOfWeek = getDay(monthStart);
  const padCount = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const paddedDays: (Date | null)[] = [...Array(padCount).fill(null), ...days];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const allEntries = demo ? [...entries, ...DEMO_CALENDAR_ENTRIES] : entries;

  const getEntriesForDay = (day: Date) =>
    allEntries.filter(e => isSameDay(e.date.toDate(), day));

  const selectedDayEntries = selectedDay ? getEntriesForDay(selectedDay) : [];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
      {/* Main Calendar */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-3xl text-brand-bordeaux">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-brand-bordeaux/5 rounded-full transition-all"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={nextMonth} className="p-2 hover:bg-brand-bordeaux/5 rounded-full transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <button
            onClick={() => openCreateForm()}
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus className="w-4 h-4" /> Add Post
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-brand-bordeaux/5 border border-brand-bordeaux/5 rounded-xl overflow-hidden shadow-sm">
          {weekDays.map(day => (
            <div key={day} className="bg-brand-warm-white p-4 text-center text-[10px] font-bold uppercase tracking-widest text-brand-navy/40">
              {day}
            </div>
          ))}
          {paddedDays.map((day, idx) => {
            if (!day) {
              return <div key={`pad-${idx}`} className="bg-white min-h-[120px] p-2 opacity-30" />;
            }
            const dayEntries = getEntriesForDay(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "bg-white min-h-[120px] p-2 transition-all cursor-pointer hover:bg-brand-warm-white",
                  !isSameMonth(day, currentDate) && "opacity-30",
                  isSelected && "ring-2 ring-inset ring-brand-bordeaux/30",
                  isToday(day) && "bg-brand-bordeaux/5"
                )}
              >
                <span className={cn(
                  "text-xs font-bold",
                  isToday(day) ? "text-brand-bordeaux" : "text-brand-navy/40"
                )}>{format(day, 'd')}</span>
                <div className="mt-1 space-y-1">
                  {dayEntries.slice(0, 3).map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-1 group"
                    >
                      <div
                        className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", STATUS_DOT[entry.status] || 'bg-brand-navy/20')}
                      />
                      <span className="text-[9px] text-brand-navy/70 truncate leading-tight">{entry.topic}</span>
                    </div>
                  ))}
                  {dayEntries.length > 3 && (
                    <span className="text-[9px] text-brand-navy/40 font-bold">+{dayEntries.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-6 justify-center">
          {STATUS_OPTIONS.map(status => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", STATUS_DOT[status] || 'bg-brand-navy/20')} />
              <span className="text-[10px] font-bold text-brand-navy/60 uppercase tracking-widest">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar: selected day entries */}
      <div className="space-y-8">
        <section>
          <h3 className="font-headline text-2xl text-brand-bordeaux italic mb-6">
            {selectedDay ? format(selectedDay, 'EEEE d MMMM') : 'Select a day'}
          </h3>

          {selectedDay && (
            <button
              onClick={() => openCreateForm(selectedDay)}
              className="w-full mb-4 flex items-center justify-center gap-2 py-2 border-2 border-dashed border-brand-bordeaux/20 rounded-lg text-brand-bordeaux/60 text-xs font-bold hover:border-brand-bordeaux/40 hover:text-brand-bordeaux transition-all"
            >
              <Plus className="w-4 h-4" /> Add entry for this day
            </button>
          )}

          {selectedDayEntries.length === 0 && selectedDay && (
            <p className="text-sm text-brand-navy/40 text-center py-8">No entries for this day</p>
          )}

          <div className="space-y-4">
            {selectedDayEntries.map(entry => (
              <div key={entry.id} className="card p-4 space-y-3 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: entry.avatarColor || '#6B1E2E' }}
                    >
                      {entry.voiceName.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold text-brand-navy">{entry.voiceName}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openInGenerate(entry)}
                      className="p-1.5 text-brand-teal hover:bg-brand-teal/10 rounded-md transition-all"
                      title="Open in Generate"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditForm(entry)}
                      className="p-1.5 text-brand-navy/40 hover:text-brand-bordeaux hover:bg-brand-bordeaux/5 rounded-md transition-all"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-brand-navy/40 hover:text-brand-coral hover:bg-brand-coral/5 rounded-md transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-brand-navy/80 line-clamp-2">{entry.topic}</p>
                {entry.theme && (
                  <p className="text-[10px] text-brand-navy/40">{entry.theme}</p>
                )}

                <div className="flex items-center justify-between">
                  <select
                    value={entry.status}
                    onChange={(e) => handleStatusChange(entry.id, e.target.value as PostStatus)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight appearance-none cursor-pointer",
                      STATUS_STYLES[entry.status] || 'bg-brand-navy/5 text-brand-navy/60'
                    )}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="text-[10px] font-bold text-brand-coral uppercase tracking-widest">{entry.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-brand-navy/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[110] p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline text-2xl text-brand-bordeaux">
                  {editingId ? 'Edit entry' : 'New calendar entry'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-brand-navy/5 rounded-full text-brand-navy/40">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="input-label">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Voice / Author</label>
                    <input
                      type="text"
                      value={form.voiceName}
                      onChange={(e) => setForm({ ...form, voiceName: e.target.value })}
                      className="input-field"
                      placeholder="e.g. Simone Whale"
                      list="voice-options"
                    />
                    <datalist id="voice-options">
                      {voices.map(v => (
                        <option key={v.id} value={v.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="input-label">Platform</label>
                    <select
                      value={form.platform}
                      onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                      className="input-field"
                    >
                      <option>LinkedIn</option>
                      <option>WhatsApp</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Language</label>
                    <select
                      value={form.language}
                      onChange={(e) => setForm({ ...form, language: e.target.value as Language | 'FR+EN' })}
                      className="input-field"
                    >
                      <option>FR</option>
                      <option>EN</option>
                      <option>FR+EN</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}
                      className="input-field"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Theme / Category</label>
                  <input
                    type="text"
                    value={form.theme}
                    onChange={(e) => setForm({ ...form, theme: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Barometre, Evenement, Leadership"
                  />
                </div>
                <div>
                  <label className="input-label">Topic / Description</label>
                  <textarea
                    rows={3}
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="input-field resize-none"
                    placeholder="What is this post about?"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-brand-navy/60 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.voiceName || !form.topic}
                  className="btn-primary py-2"
                >
                  {editingId ? 'Save changes' : 'Add to calendar'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
