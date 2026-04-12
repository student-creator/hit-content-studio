// Demo Mode: all hardcoded content for offline demonstration
// No em dashes (U+2014/U+2013) anywhere in this file

import { Timestamp } from 'firebase/firestore';
import { CalendarEntry, Draft } from './types';
import { edhecLogoSvgGroup } from './edhecLogo';

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
  <!-- EDHEC logo (bottom right) -->
  ${edhecLogoSvgGroup(820, 960, 0.35)}
</svg>`;

// ── Calendar demo entries ──

function ts(year: number, month: number, day: number): Timestamp {
  return Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0));
}

export const DEMO_CALENDAR_ENTRIES: CalendarEntry[] = [
  {
    id: 'demo-cal-1',
    date: ts(2026, 4, 7),
    voiceProfileId: 'demo',
    voiceName: 'Deborah',
    avatarColor: '#2A7D6B',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'HIT Content',
    topic: 'Certificat IA et Management en Sante : dernieres places disponibles',
    status: 'Pret',
    createdAt: ts(2026, 4, 1),
  },
  {
    id: 'demo-cal-2',
    date: ts(2026, 4, 21),
    voiceProfileId: 'demo',
    voiceName: 'Deborah',
    avatarColor: '#2A7D6B',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'HIT Content',
    topic: 'Temoignage alumni : comment le certificat HIT a transforme ma pratique',
    status: 'A rediger',
    createdAt: ts(2026, 4, 1),
  },
  {
    id: 'demo-cal-3',
    date: ts(2026, 4, 9),
    voiceProfileId: 'demo',
    voiceName: 'Loick',
    avatarColor: '#D4614A',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'Strategie',
    topic: 'Strategie hospitaliere : trois leviers pour integrer l\'IA generative',
    status: 'Pret',
    createdAt: ts(2026, 4, 1),
  },
  {
    id: 'demo-cal-4',
    date: ts(2026, 4, 23),
    voiceProfileId: 'demo',
    voiceName: 'Loick',
    avatarColor: '#D4614A',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'Strategie',
    topic: 'Leadership en sante : piloter la transformation numerique sans perdre le sens',
    status: 'A rediger',
    createdAt: ts(2026, 4, 1),
  },
  {
    id: 'demo-cal-5',
    date: ts(2026, 4, 2),
    voiceProfileId: 'demo',
    voiceName: 'EDHEC',
    avatarColor: '#6B1E2E',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'Barometre',
    topic: 'Barometre Ipsos x EDHEC : 63% des femmes ont un acces difficile au specialiste',
    status: 'Publie',
    createdAt: ts(2026, 3, 28),
  },
  {
    id: 'demo-cal-6',
    date: ts(2026, 4, 15),
    voiceProfileId: 'demo',
    voiceName: 'Simone Whale',
    avatarColor: '#6B1E2E',
    platform: 'LinkedIn',
    language: 'FR',
    theme: 'Webinaire',
    topic: 'Replay webinaire : IA generative et parcours patient',
    status: 'Brouillon',
    createdAt: ts(2026, 4, 10),
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
    status: 'Pret',
    createdAt: ts(2026, 4, 5),
    updatedAt: ts(2026, 4, 5),
  },
  {
    id: 'demo-draft-3',
    voiceProfileId: 'simone-whale-default',
    voiceName: 'Loick',
    platform: 'LinkedIn',
    language: 'FR',
    contentType: 'Post',
    topic: 'Strategie hospitaliere et IA generative',
    stats: 'Trois leviers d\'integration',
    generatedText: `Integrer l'IA generative dans une strategie hospitaliere sans casser l'existant : trois leviers a activer.

1. Cadrer les cas d'usage a fort impact clinique et administratif.
2. Former les equipes a l'esprit critique face aux sorties des modeles.
3. Piloter par la donnee et mesurer l'effet reel sur le parcours patient.

Sujet a creuser pour un prochain post. Vos retours d'experience m'interessent.`,
    editedText: '',
    status: 'Brouillon',
    createdAt: ts(2026, 4, 9),
    updatedAt: ts(2026, 4, 10),
  },
  {
    id: 'demo-draft-4',
    voiceProfileId: 'simone-whale-default',
    voiceName: 'Simone Whale',
    platform: 'LinkedIn',
    language: 'FR',
    contentType: 'Newsletter',
    topic: 'Newsletter HIT : avril 2026',
    stats: 'Certificat HIT, Barometre, MedInTechs replay',
    generatedText: `Chers lecteurs,

Dans cette edition d'avril 2026 de la newsletter de la Chaire Management in Innovative Health (EDHEC) :

Le Barometre Ipsos x EDHEC 2026 est sorti. Les chiffres cles sur la sante connectee, l'IA generative et l'acces aux soins.

Les inscriptions au Certificat IA et Management en Sante sont ouvertes. Prochaine promotion en septembre 2026.

Le replay du webinaire sur l'IA generative et le parcours patient est disponible en acces libre.

A lire aussi : trois articles signes par nos alumni sur la transformation numerique des hopitaux.

Bonne lecture,
L'equipe HIT`,
    editedText: '',
    status: 'Brouillon',
    createdAt: ts(2026, 4, 11),
    updatedAt: ts(2026, 4, 11),
  },
];
