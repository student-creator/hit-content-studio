import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  PenLine,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Users
} from 'lucide-react';
import { EDHEC_LOGO_PATH } from '../edhecLogo';
import { useI18n } from '../i18n';

export default function ModuleSelector() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();

  const modules = [
    { id: 'content', title: t('hub.content.title'), description: t('hub.content.desc'), icon: PenLine, path: '/generate', iconColor: 'text-brand-bordeaux', topColor: '#6B1E2E' },
    { id: 'visual', title: t('hub.visual.title'), description: t('hub.visual.desc'), icon: ImageIcon, path: '/visuals', iconColor: 'text-brand-coral', topColor: '#E07065' },
    { id: 'calendar', title: t('hub.calendar.title'), description: t('hub.calendar.desc'), icon: CalendarIcon, path: '/calendar', iconColor: 'text-brand-teal', topColor: '#2A7D6B' },
    { id: 'voices', title: t('hub.voices.title'), description: t('hub.voices.desc'), icon: Users, path: '/voices', iconColor: 'text-[#D4A017]', topColor: '#D4A017' },
  ];

  return (
    <div className="relative min-h-screen bg-brand-warm-white flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="absolute top-6 right-6 flex bg-brand-bordeaux/10 rounded-full p-0.5 text-[10px] font-bold">
        <button
          onClick={() => setLang('EN')}
          className={`px-3 py-1 rounded-full transition-all ${lang === 'EN' ? 'bg-brand-bordeaux text-white' : 'text-brand-bordeaux/70 hover:text-brand-bordeaux'}`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('FR')}
          className={`px-3 py-1 rounded-full transition-all ${lang === 'FR' ? 'bg-brand-bordeaux text-white' : 'text-brand-bordeaux/70 hover:text-brand-bordeaux'}`}
        >
          FR
        </button>
      </div>
      <header className="mb-16 text-center">
        <motion.img
          src={EDHEC_LOGO_PATH}
          alt="EDHEC Business School"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-14 mx-auto mb-8 object-contain"
        />
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-headline font-bold text-brand-bordeaux mb-4"
        >
          {t('hub.heading')}
        </motion.h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="h-1 bg-brand-bordeaux/20 mx-auto rounded-full"
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl w-full">
        {modules.map((module, index) => (
          <motion.button
            key={module.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(module.path)}
            style={{ borderTopWidth: 3, borderTopColor: module.topColor }}
            className="group relative flex flex-col items-start p-8 md:p-10 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
          >
            <div className={`p-4 rounded-2xl bg-brand-warm-white mb-6 group-hover:scale-110 transition-transform duration-300 ${module.iconColor}`}>
              <module.icon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-headline text-brand-navy mb-2 group-hover:text-brand-bordeaux transition-colors">
              {module.title}
            </h2>
            <p className="text-brand-navy/60 font-body leading-relaxed">
              {module.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
