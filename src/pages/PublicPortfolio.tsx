import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
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

  return (
    <div className={cn("min-h-screen bg-white text-slate-900", isMono ? "font-mono" : "font-sans", data.theme === 'dark' ? "bg-slate-950 text-white" : "")}>
      <nav className="max-w-4xl mx-auto px-6 py-12 flex justify-between items-center">
        <div className={cn("text-xl font-bold uppercase tracking-widest", !isMono && "font-serif")}>
          {data.name || 'Portfolio'}
        </div>
        <div className="space-x-8 text-xs font-medium uppercase tracking-widest text-slate-500">
          <span className={cn(
            "border-b pb-1 font-bold", 
            data.theme === 'dark' ? "text-white border-white" : "text-slate-900 border-slate-900",
            data.accentColor !== 'slate' && `text-${data.accentColor}-500 border-${data.accentColor}-500`
          )}>Work</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center md:text-left flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <h1 className={cn("text-4xl md:text-6xl font-medium leading-[1.1] mb-6", !isMono && "font-serif tracking-tight")}>
            {data.bio}
          </h1>
          <p className="text-lg text-slate-500 italic">
            {data.role}
          </p>
        </div>
        {data.profileImage && (
          <div className="w-48 h-48 rounded-full overflow-hidden shrink-0 border border-slate-200">
            <img src={data.profileImage} alt={data.name} className="w-full h-full object-cover" />
          </div>
        )}
      </header>

      {/* Projects */}
      {!data.hiddenSections?.includes('projects') && (
        <section className="max-w-4xl mx-auto px-6 py-24 border-t border-slate-100">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-12">Selected Works</h2>
          <div className={cn("grid gap-12", data.template === 'minimalist' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}>
            {data.projects?.map((p, index) => (
               <a href={p.link || '#'} key={p.id || `project-${index}`} className="group block">
                  <div className={cn("aspect-[4/3] md:aspect-[4/5] rounded-xl mb-6 overflow-hidden relative", p.imageBg || 'bg-slate-100')}>
                     {/* We would use real images, but sticking to placeholders for now */}
                     <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-slate-900 text-xs font-semibold px-4 py-2 rounded-full shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          View Case Study
                        </span>
                     </div>
                  </div>
                  <h3 className={cn("text-2xl font-medium mb-2", !isMono && "font-serif")}>{p.title}</h3>
                  {p.description && <p className="text-sm text-slate-500 mb-2">{p.description}</p>}
               </a>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {!data.hiddenSections?.includes('experience') && data.experience && data.experience.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-24 border-t border-slate-100">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-16">Experience</h2>
          <div className="space-y-12">
            {data.experience.map((exp, index) => (
              <div key={exp.id || `exp-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-sm text-slate-500 font-medium pt-1">{exp.startDate} — {exp.endDate || 'Present'}</div>
                <div className="md:col-span-3">
                  <h3 className="text-xl font-semibold mb-1">{exp.role}</h3>
                  <div className="text-slate-500 italic mb-4">{exp.company}</div>
                  <p className="text-slate-600 leading-relaxed text-sm">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Education & Skills */}
      {((!data.hiddenSections?.includes('education') && data.education && data.education.length > 0) || 
        (!data.hiddenSections?.includes('skills') && data.skills && data.skills.length > 0)) && (
        <section className="max-w-4xl mx-auto px-6 py-24 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-16">
          {!data.hiddenSections?.includes('education') && data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Education</h2>
              <div className="space-y-6">
                {data.education.map((edu, index) => (
                  <div key={edu.id || `edu-${index}`}>
                    <div className="text-xs text-slate-400 mb-1">{edu.year}</div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-slate-500">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!data.hiddenSections?.includes('skills') && data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Core Skills</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="max-w-4xl mx-auto px-6 py-24 border-t border-slate-100 text-center">
        <h2 className={cn("text-3xl md:text-5xl font-medium mb-8", !isMono && "font-serif tracking-tight")}>
          Let's work together.
        </h2>
        <a href={`mailto:${data.socialLinks?.email || ''}`} className={cn(
          "inline-block px-8 py-4 rounded-full text-white font-semibold transform hover:scale-105 transition-transform",
          data.accentColor === 'slate' ? 'bg-slate-900' : `bg-${data.accentColor}-500`
        )}>
          Get in touch
        </a>
      </footer>
    </div>
  );
}
