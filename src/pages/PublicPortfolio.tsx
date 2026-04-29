import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2, Linkedin, Github, Mail, ArrowUpRight } from 'lucide-react';
import { PortfolioData } from '../store/usePortfolioStore';
import { cn } from '../lib/utils';

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const isMono = data.font === 'mono';
  
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

  return (
    <div className={cn("min-h-screen bg-white text-slate-900 transition-colors duration-500", fontClass, data.theme === 'dark' ? "bg-slate-950 text-white" : "")}>
      <nav className="max-w-4xl mx-auto px-6 py-12 flex justify-between items-center relative z-50">
        <div className={cn("text-xl font-bold uppercase tracking-widest", serifClass)}>
          {data.name || 'Portfolio'}
        </div>
        <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {(data.navLinks || []).map((link) => (
            <a 
              key={link.id} 
              href={link.url}
              className={cn(
                "transition-all duration-300 hover:scale-105 relative group pb-1",
                data.accentColor === 'emerald' && "hover:text-emerald-500",
                data.accentColor === 'indigo' && "hover:text-indigo-500",
                data.accentColor === 'rose' && "hover:text-rose-500",
                data.accentColor === 'amber' && "hover:text-amber-500",
                data.accentColor === 'violet' && "hover:text-violet-500",
                data.accentColor === 'slate' && (data.theme === 'dark' ? "hover:text-white" : "hover:text-slate-900")
              )}
            >
              {link.label}
              <span className={cn(
                "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                data.accentColor === 'emerald' && "bg-emerald-500",
                data.accentColor === 'indigo' && "bg-indigo-500",
                data.accentColor === 'rose' && "bg-rose-500",
                data.accentColor === 'amber' && "bg-amber-500",
                data.accentColor === 'violet' && "bg-violet-500",
                data.accentColor === 'slate' && (data.theme === 'dark' ? "bg-white" : "bg-slate-900")
              )} />
            </a>
          ))}
        </div>
      </nav>

      <header className="max-w-4xl mx-auto px-6 py-32 md:py-48 flex flex-col md:flex-row gap-16 items-center">
        <div className="flex-1 text-center md:text-left">
          <h1 className={cn("text-5xl md:text-8xl font-medium leading-[0.9] mb-10", serifClass, "tracking-tighter")}>
            {data.bio}
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <p className="text-xl text-slate-500 italic font-medium">
              {data.role}
            </p>
            <div className="hidden md:block w-12 h-[1px] bg-slate-200" />
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>Based in Earth</span>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                data.accentColor === 'emerald' ? "bg-emerald-500" : 
                data.accentColor === 'indigo' ? "bg-indigo-500" :
                data.accentColor === 'rose' ? "bg-rose-500" : 
                data.accentColor === 'amber' ? "bg-amber-500" :
                data.accentColor === 'violet' ? "bg-violet-500" : "bg-slate-900"
              )} />
              <span>Available for Work</span>
            </div>
          </div>
        </div>
        {data.profileImage && (
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden shrink-0 border-8 border-slate-50 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <img src={data.profileImage} alt={data.name} className="w-full h-full object-cover" />
          </div>
        )}
      </header>

      {/* Projects */}
      {!data.hiddenSections?.includes('projects') && (
        <section className="bg-slate-50/50 py-32 rounded-[3rem] mx-4 border border-slate-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-end justify-between mb-20">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Selected Works</h2>
              <div className="h-[1px] flex-1 mx-8 bg-slate-200 hidden md:block" />
              <p className="text-xs text-slate-500 font-medium hidden md:block">01 — PROJECTS</p>
            </div>
            <div className={cn("grid gap-20", data.template === 'minimalist' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}>
              {data.projects?.map((p, index) => (
                 <a 
                   href={p.link || '#'} 
                   key={p.id || `project-${index}`} 
                   className="group block"
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
      )}

      {/* Experience */}
      {!data.hiddenSections?.includes('experience') && data.experience && data.experience.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-32">
          <div className="flex items-center gap-4 mb-20 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
             <span>02</span>
             <span>Experience</span>
             <div className="h-[1px] w-12 bg-slate-200" />
          </div>
          <div className="space-y-24">
            {data.experience.map((exp, index) => (
              <div key={exp.id || `exp-${index}`} className="group grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-sm font-bold text-slate-300 group-hover:text-slate-900 transition-colors uppercase tracking-widest pt-2">
                   {exp.startDate} <span className="mx-1 text-slate-200">—</span> {exp.endDate || 'Present'}
                </div>
                <div className="md:col-span-3">
                  <h3 className={cn("text-3xl font-medium mb-2 tracking-tight", serifClass)}>{exp.role}</h3>
                  <div className={cn("text-lg font-medium mb-6 italic", 
                     data.accentColor === 'emerald' ? "text-emerald-600" :
                     data.accentColor === 'indigo' ? "text-indigo-600" :
                     data.accentColor === 'rose' ? "text-rose-600" :
                     data.accentColor === 'amber' ? "text-amber-600" :
                     data.accentColor === 'violet' ? "text-violet-600" : "text-slate-600"
                  )}>{exp.company}</div>
                  <p className="text-slate-500 leading-relaxed text-lg max-w-2xl">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Education & Skills */}
      {((!data.hiddenSections?.includes('education') && data.education && data.education.length > 0) || 
        (!data.hiddenSections?.includes('skills') && data.skills && data.skills.length > 0)) && (
        <section className="bg-slate-900 text-white py-32 rounded-[3.5rem] mx-4 mb-4">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-24">
            {!data.hiddenSections?.includes('education') && data.education && data.education.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-12">Education</h2>
                <div className="space-y-12">
                  {data.education.map((edu, index) => (
                    <div key={edu.id || `edu-${index}`}>
                      <div className={cn("text-xs font-bold mb-3", 
                        data.accentColor === 'emerald' ? "text-emerald-400" :
                        data.accentColor === 'indigo' ? "text-indigo-400" :
                        data.accentColor === 'rose' ? "text-rose-400" :
                        data.accentColor === 'amber' ? "text-amber-400" :
                        data.accentColor === 'violet' ? "text-violet-400" : "text-white"
                      )}>{edu.year}</div>
                      <h3 className={cn("text-2xl font-medium mb-2", serifClass)}>{edu.degree}</h3>
                      <p className="text-slate-400">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!data.hiddenSections?.includes('skills') && data.skills && data.skills.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-12">Core Expertise</h2>
                <div className="flex flex-wrap gap-3">
                  {data.skills.map((skill, index) => (
                    <span key={`${skill}-${index}`} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="max-w-4xl mx-auto px-6 py-32 border-t border-slate-100 text-center">
        <h2 className={cn("text-4xl md:text-6xl font-medium mb-12 tracking-tight", serifClass)}>
          Let's create something <br className="hidden md:block" /> meaningful together.
        </h2>
        
        <div className="flex flex-col items-center gap-8">
          <a href={`mailto:${data.socialLinks?.email || ''}`} className={cn(
            "inline-flex items-center gap-3 px-10 py-5 rounded-full text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all",
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
                className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100"
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
                className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-100 w-full flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            <span>&copy; {new Date().getFullYear()} {data.name}</span>
            <span className="mt-2 md:mt-0">Built with GA-Labs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
