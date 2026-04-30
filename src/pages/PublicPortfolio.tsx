import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2, Linkedin, Github, Mail, ArrowUpRight, Menu, X } from 'lucide-react';
import { PortfolioData } from '../store/usePortfolioStore';
import { cn } from '../lib/utils';

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!slug) return;
      try {
        // Query portfolios where they are published and the owner matches the slug
        // or actually right now we are just indexing by UID.
        // Let's first search by ownerId matching slug (acting as uid for now)
        // or check if there is a 'slug' field in the future.
        const qC = query(collection(db, 'portfolios'), where('ownerId', '==', slug), where('isPublished', '==', true));
        const docSnap = await getDocs(qC);
        
        if (!docSnap.empty) {
          setData(docSnap.docs[0].data() as PortfolioData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
          <p className="text-slate-500">Portfolio not found or is unpublished.</p>
        </div>
      </div>
    );
  }

  const fontClass = cn(
    data.font === 'mono' ? 'font-mono' : '',
    data.font === 'serif-sans' ? 'font-sans' : '',
    data.font === 'outfit' ? 'font-[Outfit]' : '',
    data.font === 'jakarta' ? 'font-[Plus_Jakarta_Sans]' : '',
    data.font === 'space' ? 'font-[Space_Grotesk]' : '',
    data.font === 'cormorant' ? 'font-[Cormorant_Garamond]' : ''
  );

  const serifClass = cn(
    (data.font === 'serif-sans' || data.font === 'cormorant') ? 'font-serif' : 'font-sans'
  );

  const getHoverStyles = (isActive: boolean = false) => {
    const effect = data.hoverEffect || 'underline';
    const accent = data.accentColor;
    const isDark = data.theme === 'dark';

    const accentColorClass = 
      accent === 'emerald' ? "emerald-500" :
      accent === 'indigo' ? "indigo-500" :
      accent === 'rose' ? "rose-500" :
      accent === 'amber' ? "amber-500" :
      accent === 'violet' ? "violet-500" : (isDark ? "white" : "slate-900");

    const baseClass = "transition-all duration-300 relative group cursor-pointer";
    
    switch (effect) {
      case 'background':
        return cn(baseClass, `hover:text-white px-3 py-1 rounded-md hover:bg-${accentColorClass}`);
      case 'scale':
        return cn(baseClass, "hover:scale-110");
      case 'glow':
        return cn(baseClass, `hover:drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]`);
      case 'strikethrough':
        return cn(baseClass, "hover:line-through decoration-2");
      case 'underline':
      default:
        return cn(baseClass, "pb-1");
    }
  };

  const getUnderlineClass = () => {
    const accent = data.accentColor;
    const isDark = data.theme === 'dark';
    const accentColorClass = 
      accent === 'emerald' ? "bg-emerald-500" :
      accent === 'indigo' ? "bg-indigo-500" :
      accent === 'rose' ? "bg-rose-500" :
      accent === 'amber' ? "bg-amber-500" :
      accent === 'violet' ? "bg-violet-500" : (isDark ? "bg-white" : "bg-slate-900");
    
    return cn("absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full", accentColorClass);
  };

  const renderSection = (type: string) => {
    switch (type) {
      case 'projects':
        return (
          <section id="projects" key="projects" className="bg-slate-50/50 py-16 md:py-32 rounded-3xl md:rounded-[3rem] mx-4 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-end justify-between mb-12 md:mb-20">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Selected Works</h2>
                <div className="h-[1px] flex-1 mx-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />
                <p className="text-xs text-slate-500 font-medium hidden md:block">01 — PROJECTS</p>
              </div>
              <div className={cn("grid gap-12 md:gap-20", data.template === 'minimalist' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}>
                {data.projects?.map((p, index) => (
                   <a 
                     href={p.link || '#'} 
                     key={p.id || `project-${index}`} 
                     className="group block cursor-pointer"
                     target="_blank" 
                     rel="noopener noreferrer"
                   >
                      <div className={cn("aspect-[4/3] md:aspect-[4/5] rounded-3xl mb-8 overflow-hidden relative shadow-md bg-white transition-all duration-700 ease-out group-hover:shadow-3xl group-hover:-translate-y-4", p.imageBg)}>
                         {p.imageUrl ? (
                            <img 
                              src={p.imageUrl} 
                              alt={p.title} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                         ) : (
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <span className="bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                 View Project
                               </span>
                            </div>
                         )}
                      </div>
                      <div className="flex items-start justify-between px-2">
                        <div>
                          <h3 className={cn("text-3xl font-medium mb-3 tracking-tight", serifClass)}>{p.title}</h3>
                          {p.description && <p className="text-sm text-slate-500 leading-relaxed max-w-[90%]">{p.description}</p>}
                        </div>
                        {p.link && (
                          <div className={cn(
                            "p-2 rounded-full transition-all duration-500",
                            data.accentColor === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
                            data.accentColor === 'indigo' ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" :
                            data.accentColor === 'rose' ? "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white" :
                            data.accentColor === 'amber' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white" :
                            data.accentColor === 'violet' ? "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white" :
                            "bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                          )}>
                            <ArrowUpRight className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                   </a>
                ))}
              </div>
            </div>
          </section>
        );
      case 'experience':
        return (
          <section id="experience" key="experience" className="max-w-4xl mx-auto px-6 py-16 md:py-32">
            <div className="flex items-center gap-4 mb-12 md:mb-20 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
               <span>02</span>
               <span>Experience</span>
               <div className="h-[1px] w-12 bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-16 md:space-y-24">
              {data.experience?.map((exp, index) => (
                <div key={exp.id || `exp-${index}`} className="group grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
                  <div className="text-[11px] md:text-sm font-bold text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase tracking-widest md:pt-2">
                     {exp.startDate} <span className="mx-1 text-slate-200 dark:text-slate-700">—</span> {exp.endDate || 'Present'}
                  </div>
                  <div className="md:col-span-3">
                    <h3 className={cn("text-2xl md:text-3xl font-medium mb-1 md:mb-2 tracking-tight", serifClass)}>{exp.role}</h3>
                    <div className={cn("text-base md:text-lg font-medium mb-4 md:mb-6 italic", 
                       data.accentColor === 'emerald' ? "text-emerald-600" :
                       data.accentColor === 'indigo' ? "text-indigo-600" :
                       data.accentColor === 'rose' ? "text-rose-600" :
                       data.accentColor === 'amber' ? "text-amber-600" :
                       data.accentColor === 'violet' ? "text-violet-600" : "text-slate-600"
                    )}>{exp.company}</div>
                    <p className="text-slate-500 leading-relaxed text-base md:text-lg max-w-2xl">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case 'education':
        return (
          <section id="education" key="education" className="max-w-4xl mx-auto px-6 py-16 md:py-32 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-10 md:mb-12">Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {data.education?.map((edu, index) => (
                <div key={edu.id || `edu-${index}`}>
                  <div className={cn("text-[10px] md:text-xs font-bold mb-2 md:mb-3", 
                    data.accentColor === 'emerald' ? "text-emerald-500" :
                    data.accentColor === 'indigo' ? "text-indigo-500" :
                    data.accentColor === 'rose' ? "text-rose-500" :
                    data.accentColor === 'amber' ? "text-amber-500" :
                    data.accentColor === 'violet' ? "text-violet-500" : "text-slate-900 dark:text-white"
                  )}>{edu.year}</div>
                  <h3 className={cn("text-xl md:text-2xl font-medium mb-1 md:mb-2", serifClass)}>{edu.degree}</h3>
                  <p className="text-sm md:text-base text-slate-500">{edu.institution}</p>
                </div>
              ))}
            </div>
          </section>
        );
      case 'skills':
        return (
          <section id="skills" key="skills" className="bg-slate-900 text-white py-20 md:py-32 rounded-3xl md:rounded-[3.5rem] mx-4 mb-4">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-10 md:mb-12">Core Expertise</h2>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {data.skills?.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 border border-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>
        );
      case 'about':
        return (
          <section id="about" key="about" className="max-w-4xl mx-auto px-6 py-16 md:py-32">
             <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-8 md:mb-12">About Me</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className={cn("text-2xl md:text-4xl leading-snug", serifClass)}>
                   {data.bio}
                </div>
                <div className="text-base md:text-lg text-slate-500 leading-relaxed md:space-y-6">
                   <p>Based in Earth. Creative professional dedicated to building meaningful digital experiences.</p>
                   <p>{data.role} with a focus on simplicity, functionality, and aesthetic excellence.</p>
                </div>
             </div>
          </section>
        );
      case 'contact':
        return (
          <section id="contact" key="contact" className="max-w-4xl mx-auto px-6 py-16 md:py-32 border-t border-slate-100 dark:border-slate-800 text-center">
            <h2 className={cn("text-3xl md:text-6xl font-medium mb-8 md:mb-12 tracking-tight", serifClass)}>
              Let's create something <br className="hidden md:block" /> meaningful together.
            </h2>
            <a href={`mailto:${data.socialLinks?.email || ''}`} className={cn(
              "inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 rounded-full text-white font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all cursor-pointer",
              data.accentColor === 'emerald' ? "bg-emerald-500" :
              data.accentColor === 'indigo' ? "bg-indigo-500" :
              data.accentColor === 'rose' ? "bg-rose-500" :
              data.accentColor === 'amber' ? "bg-amber-500" :
              data.accentColor === 'violet' ? "bg-violet-500" : "bg-slate-900"
            )}>
              <Mail className="w-5 h-5" />
              Get in touch
            </a>
          </section>
        );
      default:
        return null;
    }
  };

  const navLinksToRender = data.navLinks || [];
  const heroConfig = data.heroConfig || { alignment: 'left', padding: 'medium', textColor: 'auto' };

  return (
    <div className={cn("min-h-screen bg-white text-slate-900 transition-colors duration-500 overflow-x-hidden", fontClass, data.theme === 'dark' ? "bg-slate-950 text-white" : "")}>
      <nav className="max-w-4xl mx-auto px-6 py-8 md:py-12 flex justify-between items-center relative z-[100]">
        <div className={cn("text-lg md:text-xl font-bold uppercase tracking-widest cursor-pointer", serifClass)}>
          {data.name || 'Portfolio'}
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {navLinksToRender.map((link) => (
            <a 
              key={link.id} 
              href={link.url}
              className={getHoverStyles()}
            >
              {link.label}
              {data.hoverEffect === 'underline' && <span className={getUnderlineClass()} />}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile menu overlay */}
        <div className={cn(
          "fixed inset-0 bg-white dark:bg-slate-950 z-[90] md:hidden transition-all duration-500 flex flex-col items-center justify-center gap-8",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-y-4"
        )}>
           {navLinksToRender.map((link) => (
            <a 
              key={link.id} 
              href={link.url}
              onClick={() => setMobileMenuOpen(false)}
              className={cn("text-2xl font-bold uppercase tracking-[0.2em]", serifClass, 
                data.accentColor === 'emerald' && "text-emerald-500",
                data.accentColor === 'indigo' && "text-indigo-500",
                data.accentColor === 'rose' && "text-rose-500",
                data.accentColor === 'amber' && "text-amber-500",
                data.accentColor === 'violet' && "text-violet-500"
              )}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-6 mt-8">
             {data.socialLinks?.linkedin && (
                <a href={data.socialLinks.linkedin} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><Linkedin className="w-5 h-5" /></a>
             )}
             {data.socialLinks?.github && (
                <a href={data.socialLinks.github} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><Github className="w-5 h-5" /></a>
             )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header 
        className={cn(
          "relative overflow-hidden transition-all duration-700",
          heroConfig.padding === 'small' ? 'py-12 md:py-20' : heroConfig.padding === 'large' ? 'py-32 md:py-48' : 'py-16 md:py-48',
          heroConfig.backgroundImage ? 'min-h-[60vh] md:min-h-[70vh] flex items-center' : 'max-w-4xl mx-auto px-6'
        )}
      >
        {heroConfig.backgroundImage && (
          <>
            <div className="absolute inset-0 z-0">
               <img src={heroConfig.backgroundImage} alt="Hero" className="w-full h-full object-cover" />
               <div 
                 className="absolute inset-0 bg-black transition-opacity duration-700" 
                 style={{ opacity: (heroConfig.overlayOpacity || 0) / 100 }} 
               />
            </div>
          </>
        )}

        <div className={cn(
          "relative z-10 w-full flex flex-col md:flex-row gap-16 items-center",
          heroConfig.backgroundImage ? 'max-w-4xl mx-auto px-6' : '',
          heroConfig.alignment === 'center' ? 'text-center flex-col' : heroConfig.alignment === 'right' ? 'flex-row-reverse text-right' : '',
          heroConfig.textColor === 'white' ? 'text-white' : heroConfig.textColor === 'dark' ? 'text-slate-900' : ''
        )}>
          <div className="flex-1 w-full">
            <h1 className={cn("text-4xl sm:text-5xl md:text-8xl font-medium leading-[1.0] md:leading-[0.9] mb-8 md:mb-10 tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000", serifClass)}>
              {data.bio}
            </h1>
            <div className={cn(
              "flex flex-col md:flex-row items-center gap-6 md:gap-12",
              heroConfig.alignment === 'center' ? 'md:justify-center' : heroConfig.alignment === 'right' ? 'md:flex-row-reverse md:justify-end' : ''
            )}>
              <p className={cn("text-lg md:text-xl italic font-medium", heroConfig.textColor === 'white' ? 'text-white/80' : 'text-slate-500')}>
                {data.role}
              </p>
              <div className={cn("hidden md:block w-12 h-[1px]", heroConfig.textColor === 'white' ? 'bg-white/20' : 'bg-slate-200')} />
              <div className={cn("flex items-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest", heroConfig.textColor === 'white' ? 'text-white/60' : 'text-slate-400')}>
                <span>Based in Earth</span>
                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                  data.accentColor === 'emerald' ? "bg-emerald-500" : 
                  data.accentColor === 'indigo' ? "bg-indigo-500" :
                  data.accentColor === 'rose' ? "bg-rose-500" : 
                  data.accentColor === 'amber' ? "bg-amber-500" :
                  data.accentColor === 'violet' ? "bg-violet-500" : (heroConfig.textColor === 'white' ? 'bg-white' : "bg-slate-900")
                )} />
                <span>Available for Work</span>
              </div>
            </div>
          </div>
          {data.profileImage && (
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden shrink-0 border-8 border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 scale-90 md:scale-100">
              <img src={data.profileImage} alt={data.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </header>

      {/* Render sections based on navLinks */}
      <div className="space-y-16 md:space-y-32 mb-16 md:mb-32">
        {navLinksToRender.map(link => link.sectionType && renderSection(link.sectionType))}
      </div>

      <footer className="max-w-4xl mx-auto px-6 py-32 border-t border-slate-100 dark:border-slate-800 text-center">
        <h2 className={cn("text-4xl md:text-6xl font-medium mb-12 tracking-tight", serifClass)}>
          Let's create something <br className="hidden md:block" /> meaningful together.
        </h2>
        
        <div className="flex flex-col items-center gap-8">
          <a href={`mailto:${data.socialLinks?.email || ''}`} className={cn(
            "inline-flex items-center gap-3 px-10 py-5 rounded-full text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all cursor-pointer",
            data.accentColor === 'emerald' ? "bg-emerald-500" :
            data.accentColor === 'indigo' ? "bg-indigo-500" :
            data.accentColor === 'rose' ? "bg-rose-500" :
            data.accentColor === 'amber' ? "bg-amber-500" :
            data.accentColor === 'violet' ? "bg-violet-500" : "bg-slate-900"
          )}>
            <Mail className="w-5 h-5" />
            Get in touch
          </a>
          
          <div className="flex items-center gap-6 mt-4">
            {data.socialLinks?.linkedin && (
              <a 
                href={data.socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {data.socialLinks?.github && (
              <a 
                href={data.socialLinks.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 w-full flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            <span>&copy; {new Date().getFullYear()} {data.name}</span>
            <span className="mt-2 md:mt-0">Built with GA-Labs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
