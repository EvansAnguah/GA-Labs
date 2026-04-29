import { create } from 'zustand';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export type Template = 'editorial' | 'minimalist';
export type FontPairing = 'serif-sans' | 'mono' | 'outfit' | 'jakarta' | 'space' | 'cormorant' | 'plus-jakarta';
export type AccentColor = 'emerald' | 'indigo' | 'rose' | 'slate' | 'amber' | 'violet';

export interface NavLink {
  id: string;
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  imageBg: string;
  imageUrl?: string;
  link?: string;
  date?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

export interface PortfolioData {
  ownerId: string;
  name: string;
  role: string;
  bio: string;
  profileImage?: string;
  theme: 'light' | 'dark';
  template: Template;
  font: FontPairing;
  accentColor: AccentColor;
  isPublished: boolean;
  seoAutoIndex: boolean;
  navLinks?: NavLink[];
  projects: Project[];
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  certifications?: any[];
  testimonials?: any[];
  socialLinks?: Record<string, string>;
  sectionOrder?: string[];
  hiddenSections?: string[];
  updatedAt: number;
}

interface PortfolioStore {
  data: PortfolioData | null;
  loading: boolean;
  deviceMode: 'desktop' | 'mobile';
  sidebarTab: 'dashboard' | 'search' | 'layers' | 'home' | 'navigation';
  fetchPortfolio: (uid: string) => Promise<void>;
  updateData: (updates: Partial<PortfolioData>, uid: string) => Promise<void>;
  setDeviceMode: (mode: 'desktop' | 'mobile') => void;
  setSidebarTab: (tab: 'dashboard' | 'search' | 'layers' | 'home' | 'navigation') => void;
}

const defaultPortfolio: Omit<PortfolioData, 'ownerId'> = {
  name: '',
  role: 'Creative Professional',
  bio: 'Welcome to my portfolio.',
  theme: 'light',
  template: 'editorial',
  font: 'serif-sans',
  accentColor: 'slate',
  isPublished: false,
  seoAutoIndex: false,
  navLinks: [
    { id: '1', label: 'Work', url: '#projects' },
    { id: '2', label: 'About', url: '#about' },
    { id: '3', label: 'Contact', url: '#contact' }
  ],
  projects: [],
  updatedAt: Date.now()
};

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  data: null,
  loading: true,
  deviceMode: 'desktop',
  sidebarTab: 'layers',
  fetchPortfolio: async (uid: string) => {
    set({ loading: true });
    try {
      const docRef = doc(db, 'portfolios', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set({ data: docSnap.data() as PortfolioData, loading: false });
      } else {
        // Create an empty one
        const newPortfolio: PortfolioData = { ...defaultPortfolio, ownerId: uid, updatedAt: Date.now() };
        await setDoc(docRef, newPortfolio);
        set({ data: newPortfolio, loading: false });
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      set({ loading: false });
    }
  },
  updateData: async (updates: Partial<PortfolioData>, uid: string) => {
    const currentData = get().data;
    if (!currentData) return;
    
    const newData = { ...currentData, ...updates, updatedAt: Date.now() };
    set({ data: newData });
    
    try {
      const docRef = doc(db, 'portfolios', uid);
      // Ensure updatedAt is sent to server as well
      await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
    } catch (error) {
      console.error("Error updating portfolio:", error);
    }
  },
  setDeviceMode: (mode) => set({ deviceMode: mode }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
}));
