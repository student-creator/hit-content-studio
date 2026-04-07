// Demo Mode: all hardcoded content for offline demonstration
// No em dashes (U+2014/U+2013) anywhere in this file

import { Timestamp } from 'firebase/firestore';
import { CalendarEntry, Draft } from './types';

// ── localStorage helpers ──

const DEMO_KEY = 'hit-demo-mode';

export function isDemoMode(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDemoMode(on: boolean): void {
  try {
    localStorage.setItem(DEMO_KEY, on ? 'true' : 'false');
  } catch {
    // ignore
  }
}

// ── Generate Post demo content ──

export const DEMO_POST_TEXT = `\u{1F4CA} Sante connectee et IA : ou en sont les Francais ?

Notre barometre Ipsos x Chaire Management in Innovative Health (EDHEC) revele des chiffres revelateurs :

\u{1F449} 74% des Francais utilisent ou envisagent d'utiliser l'IA generative
\u{1F449} 54% dans le cadre de leur sante
\u{1F449} 63% des femmes declarent avoir un acces difficile a un medecin specialiste (vs 56% en moyenne)

La sante connectee peut-elle contribuer a reduire ces inegalites ?

Les Francais reconnaissent qu'elle peut apporter plus de rapidite, plus de praticite et aider a faire face aux tensions d'acces aux soins.

L'innovation en sante doit aussi etre un levier d'equite.

Decouvrez l'integralite du barometre :
\u{1F449} https://lnkd.in/ensTwMru

#SanteConnectee #eSante #IAenSante #EDHEC #Ipsos`;

// ── Visual Studio demo SVG ──

export const DEMO_SVG = `<svg viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="#FAF8F4"/>
  <!-- Corner brackets -->
  <line x1="40" y1="40" x2="80" y2="40" stroke="#6B1E2E" stroke-width="2"/>
  <line x1="40" y1="40" x2="40" y2="80" stroke="#6B1E2E" stroke-width="2"/>
  <line x1="1040" y1="1000" x2="1040" y2="1040" stroke="#6B1E2E" stroke-width="2"/>
  <line x1="1000" y1="1040" x2="1040" y2="1040" stroke="#6B1E2E" stroke-width="2"/>
  <!-- Category -->
  <text x="540" y="160" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="13" fill="#D4614A" letter-spacing="3" text-transform="uppercase">BAROMETRE SANTE CONNECTEE</text>
  <!-- Headline -->
  <text x="540" y="260" text-anchor="middle" font-family="Playfair Display, serif" font-size="42" fill="#6B1E2E" font-weight="bold">63% des femmes ont un acces</text>
  <text x="540" y="315" text-anchor="middle" font-family="Playfair Display, serif" font-size="42" fill="#6B1E2E" font-weight="bold">difficile au specialiste</text>
  <!-- Subtitle -->
  <text x="540" y="375" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="18" fill="#555">Barometre Ipsos x EDHEC 2026</text>
  <!-- Bar chart -->
  <rect x="200" y="460" width="420" height="60" rx="8" fill="#D4614A"/>
  <text x="640" y="500" font-family="DM Sans, sans-serif" font-size="14" fill="#555">Femmes : 63%</text>
  <rect x="200" y="540" width="373" height="60" rx="8" fill="#2A7D6B"/>
  <text x="593" y="580" font-family="DM Sans, sans-serif" font-size="14" fill="#555">Moyenne : 56%</text>
  <!-- Large stats -->
  <text x="310" y="730" text-anchor="middle" font-family="Playfair Display, serif" font-size="80" fill="#D4614A" font-weight="bold">74%</text>
  <text x="310" y="770" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="14" fill="#555">utilisent ou envisagent</text>
  <text x="310" y="790" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="14" fill="#555">l'IA generative</text>
  <text x="770" y="730" text-anchor="middle" font-family="Playfair Display, serif" font-size="80" fill="#2A7D6B" font-weight="bold">54%</text>
  <text x="770" y="770" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="14" fill="#555">dans le cadre</text>
  <text x="770" y="790" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="14" fill="#555">de leur sante</text>
  <!-- Source -->
  <text x="80" y="1010" font-family="DM Sans, sans-serif" font-size="12" fill="#888">Source : Barometre Ipsos x EDHEC, 2026</text>
  <!-- EDHEC branding -->
  <text x="960" y="1000" text-anchor="end" font-family="Playfair Display, serif" font-size="18" fill="#6B1E2E" font-weight="bold">EDHEC</text>
  <text x="960" y="1020" text-anchor="end" font-family="DM Sans, sans-serif" font-size="11" fill="#6B1E2E">Business School</text>
</svg>`;

// ── Calendar demo entries ──

function ts(year: number, month: number, day: number): Timestamp {
  return Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0));
}

export const DEMO_CALENDAR_ENTRIES: CalendarEntry[] = [
  {
    id: 'demo-cal-1',
    date: ts(2026, 4, 8),
    voiceProfileId: 'demo',
    voiceName: 'Deborah',
    avatarColor: '#2A7D6B',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'HIT Certificates',
    topic: 'Temoignage participant HIT Certificate',
    status: 'Publie',
    createdAt: ts(2026, 4, 1),
  },
  {
    id: 'demo-cal-2',
    date: ts(2026, 4, 10),
    voiceProfileId: 'demo',
    voiceName: 'Loick',
    avatarColor: '#D4614A',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'Strategie et Leadership',
    topic: 'Leadership en sante : les competences cles',
    status: 'Publie',
    createdAt: ts(2026, 4, 1),
  },
  {
    id: 'demo-cal-3',
    date: ts(2026, 4, 15),
    voiceProfileId: 'demo',
    voiceName: 'Deborah',
    avatarColor: '#2A7D6B',
    platform: 'LinkedIn',
    language: 'FR+EN',
    theme: 'HIT Certificates',
    topic: 'Healthcare Innovation : pourquoi se former',
    status: 'Pret',
    createdAt: ts(2026, 4, 1),
  },
  {
    id: 'demo-cal-4',
    date: ts(2026, 4, 17),
    voiceProfileId: 'demo',
    voiceName: 'Loick',
    avatarColor: '#D4614A',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'Barometre',
    topic: 'IA et confiance des patients',
    status: 'Brouillon',
    createdAt: ts(2026, 4, 1),
  },
  {
    id: 'demo-cal-5',
    date: ts(2026, 4, 22),
    voiceProfileId: 'demo',
    voiceName: 'Deborah',
    avatarColor: '#2A7D6B',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'Webinaire',
    topic: 'Webinaire menopause et travail',
    status: 'A rediger',
    createdAt: ts(2026, 4, 1),
  },
  {
    id: 'demo-cal-6',
    date: ts(2026, 4, 24),
    voiceProfileId: 'demo',
    voiceName: 'Loick',
    avatarColor: '#D4614A',
    platform: 'LinkedIn',
    language: 'EN',
    theme: 'Thought leadership',
    topic: 'Digital health trends 2026',
    status: 'A rediger',
    createdAt: ts(2026, 4, 1),
  },
];

// ── Library demo drafts ──

export const DEMO_DRAFTS: Draft[] = [
  {
    id: 'demo-draft-1',
    voiceProfileId: 'simone-whale-default',
    voiceName: 'Simone Whale',
    platform: 'LinkedIn',
    language: 'FR',
    contentType: 'Barometre',
    topic: 'Sante connectee et IA : ou en sont les Francais ?',
    stats: '74% IA generative, 54% sante, 63% femmes acces specialiste',
    generatedText: DEMO_POST_TEXT,
    editedText: '',
    status: 'Publie',
    createdAt: ts(2026, 3, 8),
    updatedAt: ts(2026, 3, 8),
  },
  {
    id: 'demo-draft-2',
    voiceProfileId: 'simone-whale-default',
    voiceName: 'Simone Whale',
    platform: 'LinkedIn',
    language: 'FR',
    contentType: 'Evenement',
    topic: 'MedInTechs 2026 : retrouvez la Chaire au stand C21',
    stats: '3 jours, 200+ exposants, stand C21',
    generatedText: `\u{1F3E5} MedInTechs 2026 : la Chaire Management in Innovative Health (EDHEC) sera presente !

Retrouvez-nous au stand C21 du 9 au 11 mars pour echanger sur :

\u{1F449} Les resultats de notre barometre 2026 sur la sante connectee
\u{1F449} Nos programmes de formation en management de l'innovation en sante
\u{1F449} Les perspectives de l'IA generative dans le parcours patient

Venez decouvrir comment l'innovation transforme le management de la sante.

\u{1F4CD} Paris Expo, Porte de Versailles
\u{1F4C5} 9, 10, 11 mars 2026

On vous attend !

#MedInTechs #EDHEC #InnovationSante #HealthTech #eSante`,
    editedText: '',
    status: 'Publie',
    createdAt: ts(2026, 2, 28),
    updatedAt: ts(2026, 2, 28),
  },
  {
    id: 'demo-draft-3',
    voiceProfileId: 'simone-whale-default',
    voiceName: 'Simone Whale',
    platform: 'LinkedIn',
    language: 'FR',
    contentType: 'Barometre',
    topic: 'IA en sante : 94% des Francais veulent etre informes',
    stats: '94% information patients, 67% confiance IA supervisee',
    generatedText: `\u{1F4CA} IA et sante : les Francais veulent savoir.

Notre barometre Ipsos x Chaire Management in Innovative Health (EDHEC) revele un chiffre fort :

\u{1F449} 94% des Francais estiment que les patients doivent etre informes quand l'IA est utilisee dans leur parcours de soin.

Ce n'est pas un rejet de la technologie. Au contraire :
\u{1F449} 67% font confiance a l'IA quand elle est supervisee par un professionnel de sante.

Le message est clair : les Francais veulent de la transparence, pas de la mefiance.

L'adoption de l'IA en sante passera par la confiance. Et la confiance passe par l'information.

#IAenSante #SanteConnectee #EDHEC #Ipsos #eSante #DigitalHealth`,
    editedText: '',
    status: 'Pret',
    createdAt: ts(2026, 1, 28),
    updatedAt: ts(2026, 1, 28),
  },
];
