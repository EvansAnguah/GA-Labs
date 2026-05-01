import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Loader2, Linkedin, Github, Mail, ArrowUpRight, Menu, X, Star, Award, Briefcase, Quote, ArrowRight, MousePointer2, ExternalLink } from 'lucide-react';
import { PortfolioData, Testimonial, Service, Award as AwardType } from '../store/usePortfolioStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';

const Magnetic = ({ children, intensity = 0.5, enabled = true }: { children: React.ReactNode, intensity?: number, enabled?: boolean }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!enabled) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    const x = (clientX - (left + width / 2)) * intensity;
    const y = (clientY - (top + height / 2)) * intensity;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!slug) return;
      try {
        // First try to get by ID directly (most efficient)
        const docRef = doc(db, 'portfolios', slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const portfolioData = docSnap.data() as PortfolioData;
          // allow view if published OR if we can somehow verify it's the owner (for now just allow if ID matches slug for direct preview)
          setData(portfolioData);
        } else {
          // Fallback to query by ownerId if slug is not UID (unlikely in current setup)
          const qC = query(collection(db, 'portfolios'), where('ownerId', '==', slug), where('isPublished', '==', true));
          const querySnap = await getDocs(qC);
          if (!querySnap.empty) {
            setData(querySnap.docs[0].data() as PortfolioData);
          }
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
    data.font === 'cormorant' ? 'font-[Cormorant_Garamond]' : '',
    data.font === 'inter' ? 'font-[Inter]' : '',
    data.font === 'mona' ? 'font-[Mona_Sans]' : ''
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
      accent === 'violet' ? "violet-500" : 
      accent === 'sky' ? "sky-500" :
      accent === 'lime' ? "lime-500" : (isDark ? "white" : "slate-900");

    const baseClass = "transition-all duration-300 relative group cursor-pointer";
    
    switch (effect) {
      case 'background':
        return cn(baseClass, `hover:text-white px-3 py-1 rounded-md hover:bg-${accentColorClass}`);
      case 'scale':
        return cn(baseClass, "hover:scale-110");
      case 'glow':
        return cn(baseClass, `hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]`);
      case 'strikethrough':
        return cn(baseClass, "hover:line-through decoration-2");
      case 'tilt':
        return cn(baseClass, "hover:rotate-3");
      case 'blur':
        return cn(baseClass, "hover:blur-[1px]");
      case 'underline':
      default:
        return cn(baseClass, "pb-1");
    }
  };

  const roundedClass = cn(
    data.designConfig?.borderRadius === 'none' ? 'rounded-none' :
    data.designConfig?.borderRadius === 'sm' ? 'rounded-sm' :
    data.designConfig?.borderRadius === 'md' ? 'rounded-md' :
    data.designConfig?.borderRadius === 'lg' ? 'rounded-lg' :
    data.designConfig?.borderRadius === 'xl' ? 'rounded-xl' :
    data.designConfig?.borderRadius === '2xl' ? 'rounded-2xl' :
    data.designConfig?.borderRadius === '3xl' ? 'rounded-[1.5rem] md:rounded-[3rem]' :
    data.designConfig?.borderRadius === 'full' ? 'rounded-full' : 'rounded-3xl'
  );

  const buttonStyleClass = (isSecondary = false) => {
    const style = data.designConfig?.buttonStyle || 'solid';
    const accent = data.accentColor;
    const color = accent === 'emerald' ? "emerald" :
                 accent === 'indigo' ? "indigo" :
                 accent === 'rose' ? "rose" :
                 accent === 'amber' ? "amber" :
                 accent === 'violet' ? "violet" :
                 accent === 'sky' ? "sky" :
                 accent === 'lime' ? "lime" : "slate";
    
    const base = cn(
      "inline-flex items-center gap-2 px-6 py-3 font-bold transition-all transform hover:-translate-y-1 active:scale-95",
      roundedClass
    );

    if (style === 'outline') {
      return cn(base, `border-2 border-${color}-500 text-${color}-500 hover:bg-${color}-50 dark:hover:bg-${color}-500/10`);
    }
    if (style === 'soft') {
      return cn(base, `bg-${color}-50 text-${color}-600 dark:bg-${color}-500/10 dark:text-${color}-400 hover:bg-${color}-100`);
    }
    if (style === 'ghost') {
      return cn(base, `text-${color}-500 hover:bg-${color}-50 dark:hover:bg-${color}-500/5`);
    }
    if (style === 'neo') {
      return cn(base, `bg-${color}-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none translate-y-[-4px] hover:translate-y-0 text-slate-100`);
    }
    return cn(base, `bg-${color}-500 text-white shadow-lg hover:shadow-xl`);
  };

  const getAccentBgClass = () => {
    const accent = data.accentColor;
    if (accent === 'custom') return '';
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-500',
      indigo: 'bg-indigo-500',
      rose: 'bg-rose-500',
      amber: 'bg-amber-500',
      violet: 'bg-violet-500',
      sky: 'bg-sky-500',
      lime: 'bg-lime-500',
      slate: 'bg-slate-900 dark:bg-white'
    };
    return colors[accent] || colors.slate;
  };

  const getAccentStyle = (opacity = 1) => {
    if (data.accentColor === 'custom' && data.designConfig?.customAccentHex) {
      return { backgroundColor: data.designConfig.customAccentHex, opacity };
    }
    return {};
  };

  const getAccentText = () => {
    const accent = data.accentColor;
    const colors: Record<string, string> = {
      emerald: 'text-emerald-500',
      indigo: 'text-indigo-500',
      rose: 'text-rose-500',
      amber: 'text-amber-500',
      violet: 'text-violet-500',
      sky: 'text-sky-500',
      lime: 'text-lime-500',
      slate: 'text-slate-900 dark:text-white'
    };
    return colors[accent] || colors.slate;
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

  const getShadowClass = () => {
    const style = data.designConfig?.shadowStyle || 'medium';
    switch (style) {
      case 'none': return 'shadow-none';
      case 'soft': return 'shadow-sm';
      case 'deep': return 'shadow-2xl';
      case 'medium':
      default: return 'shadow-md';
    }
  };

  const renderSection = (type: string) => {
    const sectionVariants = data.designConfig?.scrollReveal !== false ? staggerContainer : {};
    
    switch (type) {
      case 'projects':
        const cols = data.designConfig?.projectColumns || '2';
        return (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            id="projects" key="projects" className="bg-slate-50/50 py-16 md:py-32 rounded-3xl md:rounded-[3rem] mx-4 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800"
          >
            <div className="max-w-4xl mx-auto px-6">
              <motion.div variants={itemFade} className="flex items-end justify-between mb-12 md:mb-20">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Selected Works</h2>
                <div className="h-[1px] flex-1 mx-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />
                <p className="text-xs text-slate-500 font-medium hidden md:block">01 — PROJECTS</p>
              </motion.div>
              <div className={cn(
                "grid gap-12 md:gap-20", 
                cols === '1' ? 'grid-cols-1' : cols === '3' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
              )}>
                {data.projects?.map((p, index) => (
                   <motion.a 
                     variants={itemFade}
                     whileHover={{ 
                       y: -(data.designConfig?.hoverLift || 8),
                       scale: data.designConfig?.hoverScale || 1.02
                     }}
                     style={{
                        perspective: 1000
                     }}
                     href={p.link || '#'} 
                     key={p.id || `project-${index}`} 
                     className="group block cursor-pointer"
                     target="_blank" 
                     rel="noopener noreferrer"
                   >
                      <motion.div 
                        whileHover={data.designConfig?.tiltEffect ? { rotateX: 5, rotateY: -5 } : {}}
                        className={cn(
                        "aspect-[4/3] md:aspect-[4/5] rounded-3xl mb-8 overflow-hidden relative bg-white transition-all duration-700 ease-out", 
                        p.imageBg,
                        getShadowClass(),
                        data.designConfig?.buttonStyle === 'neo' ? 'shadow-none' : ''
                      )}>
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
                      </motion.div>
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
                   </motion.a>
                ))}
              </div>
            </div>
          </motion.section>
        );
      case 'experience':
        return (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            id="experience" key="experience" className="max-w-4xl mx-auto px-6 py-16 md:py-32"
          >
            <motion.div variants={itemFade} className="flex items-center gap-4 mb-12 md:mb-20 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
               <span>02</span>
               <span>Experience</span>
               <div className="h-[1px] w-12 bg-slate-200 dark:bg-slate-800" />
            </motion.div>
            <div className="space-y-16 md:space-y-24">
              {data.experience?.map((exp, index) => (
                <motion.div variants={itemFade} key={exp.id || `exp-${index}`} className="group grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
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
                </motion.div>
              ))}
            </div>
          </motion.section>
        );
      case 'education':
        return (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            id="education" key="education" className="max-w-4xl mx-auto px-6 py-16 md:py-32 border-t border-slate-100 dark:border-slate-800"
          >
            <motion.h2 variants={itemFade} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-10 md:mb-12">Education</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {data.education?.map((edu, index) => (
                <motion.div variants={itemFade} key={edu.id || `edu-${index}`}>
                  <div className={cn("text-[10px] md:text-xs font-bold mb-2 md:mb-3", 
                    data.accentColor === 'emerald' ? "text-emerald-500" :
                    data.accentColor === 'indigo' ? "text-indigo-500" :
                    data.accentColor === 'rose' ? "text-rose-500" :
                    data.accentColor === 'amber' ? "text-amber-500" :
                    data.accentColor === 'violet' ? "text-violet-500" : "text-slate-900 dark:text-white"
                  )}>{edu.year}</div>
                  <h3 className={cn("text-xl md:text-2xl font-medium mb-1 md:mb-2", serifClass)}>{edu.degree}</h3>
                  <p className="text-sm md:text-base text-slate-500">{edu.institution}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        );
      case 'skills':
        return (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            id="skills" key="skills" className="bg-slate-900 text-white py-20 md:py-32 rounded-3xl md:rounded-[3.5rem] mx-4 mb-4"
          >
            <div className="max-w-4xl mx-auto px-6">
              <motion.h2 variants={itemFade} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-10 md:mb-12">Core Expertise</motion.h2>
              <motion.div variants={itemFade} className="flex flex-wrap gap-2 md:gap-3">
                {data.skills?.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 border border-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.section>
        );
      case 'about':
        return (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            id="about" key="about" className="max-w-4xl mx-auto px-6 py-16 md:py-32"
          >
             <motion.h2 variants={itemFade} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-8 md:mb-12">About Me</motion.h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <motion.div variants={itemFade} className={cn("text-2xl md:text-4xl leading-snug", serifClass)}>
                   {data.bio}
                </motion.div>
                <motion.div variants={itemFade} className="text-base md:text-lg text-slate-500 leading-relaxed md:space-y-6">
                   <p>Based in Earth. Creative professional dedicated to building meaningful digital experiences.</p>
                   <p>{data.role} with a focus on simplicity, functionality, and aesthetic excellence.</p>
                </motion.div>
             </div>
          </motion.section>
        );
      case 'contact':
        return (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            id="contact" key="contact" className={cn("max-w-4xl mx-auto px-6 py-16 md:py-32 border-t border-slate-100 dark:border-slate-800 text-center", data.designConfig?.sectionSpacing === 'tight' ? 'py-12' : data.designConfig?.sectionSpacing === 'loose' ? 'py-48' : '')}
          >
            <motion.h2 variants={itemFade} className={cn("text-3xl md:text-6xl font-medium mb-8 md:mb-12 tracking-tight whitespace-pre-line", serifClass)}>
              {data.contactHeadline || "Let's create something meaningful together."}
            </motion.h2>
            <motion.div variants={itemFade} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={`mailto:${data.socialLinks?.email || ''}`} className={buttonStyleClass()}>
                <Mail className="w-5 h-5" />
                Get in touch
              </a>
              {data.socialLinks?.linkedin && (
                <a href={data.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={buttonStyleClass(true)}>
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              )}
            </motion.div>
          </motion.section>
        );
      case 'testimonials':
        return (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            id="testimonials" key="testimonials" className="max-w-4xl mx-auto px-6 py-16 md:py-32 overflow-hidden"
          >
            <motion.h2 variants={itemFade} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-12">Kind Words</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.testimonials?.map((t, index) => (
                <motion.div variants={itemFade} key={t.id || `test-${index}`} className={cn("p-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative", roundedClass)}>
                  <Quote className={cn("w-10 h-10 absolute top-4 right-4 opacity-10", getAccentText())} />
                  <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-8 relative z-10">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    {t.avatar && <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />}
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        );
      case 'services':
        return (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            id="services" key="services" className="max-w-4xl mx-auto px-6 py-16 md:py-32"
          >
            <motion.h2 variants={itemFade} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-12 uppercase tracking-widest">Services</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.services?.map((s, index) => (
                <motion.div variants={itemFade} key={s.id || `service-${index}`} className={cn("p-8 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group", roundedClass)}>
                  <div className={cn("w-12 h-12 flex items-center justify-center mb-6 bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform", roundedClass)}>
                     <Briefcase className={cn("w-6 h-6", getAccentText())} />
                  </div>
                  <h3 className={cn("text-xl font-bold mb-3 tracking-tight", serifClass)}>{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        );
      case 'awards':
        return (
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionVariants}
            id="awards" key="awards" className="max-w-4xl mx-auto px-6 py-16 md:py-32"
          >
            <motion.h2 variants={itemFade} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-12">Recognition</motion.h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
               {data.awards?.map((a, index) => (
                 <motion.div variants={itemFade} key={a.id || `award-${index}`} className="py-8 flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                       <span className="text-xs font-bold text-slate-400 font-mono">0{index + 1}</span>
                       <div>
                          <h3 className={cn("text-2xl font-medium tracking-tight group-hover:translate-x-2 transition-transform", serifClass)}>{a.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{a.issuer}</p>
                       </div>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{a.year}</div>
                 </motion.div>
               ))}
            </div>
          </motion.section>
        );
      default:
        return null;
    }
  };

  const navLinksToRender = data.navLinks || [];
  const heroConfig = data.heroConfig || { alignment: 'left', padding: 'medium', textColor: 'auto' };

  const navLayoutClass = cn(
    "fixed top-0 left-0 w-full z-[100] transition-all duration-300",
    data.designConfig?.navBehavior === 'hide' && scrollProgress > 0.05 ? "-translate-y-full" : "translate-y-0",
    data.designConfig?.navLayout === 'floating' ? "top-4 px-4 h-16" : 
    data.designConfig?.navLayout === 'glass' ? "backdrop-blur-md bg-white/50 dark:bg-black/50 border-b border-white/10" : "bg-transparent h-20"
  );

  const getEntranceVariants = () => {
    const type = data.designConfig?.pageEntrance || 'fade';
    const direction = data.designConfig?.entranceDirection || 'up';
    const duration = data.designConfig?.entranceDuration || 0.8;
    
    const offset = 50;
    const initialPos = direction === 'up' ? { y: offset } : direction === 'down' ? { y: -offset } : direction === 'left' ? { x: offset } : { x: -offset };

    return {
      hidden: { 
        opacity: 0, 
        ...(type !== 'none' ? initialPos : {}),
        scale: type === 'zoom' ? 0.9 : 1
      },
      visible: { 
        opacity: 1, 
        x: 0, 
        y: 0, 
        scale: 1,
        transition: { duration: data.designConfig?.transitionSpeed || duration, ease: [0.16, 1, 0.3, 1] }
      }
    };
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: data.designConfig?.staggerEnabled !== false ? (data.designConfig?.transitionSpeed ? data.designConfig.transitionSpeed * 0.3 : 0.1) : 0
      }
    }
  };

  const itemFade = {
    hidden: { opacity: 0, y: data.designConfig?.revealDistance || 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: data.designConfig?.transitionSpeed || 0.6, ease: "easeOut" }
    }
  };

  const getCursorScale = () => {
    const type = data.designConfig?.cursorType || 'default';
    if (type === 'none') return 0;
    return 1;
  };

  const renderHero = () => {
    const heroConfig = data.heroConfig || { alignment: 'left', padding: 'medium', textColor: 'auto' };
    const style = heroConfig.heroStyle || 'minimalist';

    const commonEntrance = {
      initial: "hidden",
      animate: "visible",
      variants: getEntranceVariants()
    };

    if (style === 'split') {
      return (
        <motion.header 
          {...commonEntrance}
          className={cn(
            "relative min-h-[80vh] flex flex-col md:flex-row items-stretch",
            heroConfig.textColor === 'white' ? 'text-white' : 'text-slate-900'
          )}
        >
          <div className="flex-1 flex items-center justify-center p-12 md:p-24">
            <div className="max-w-xl">
              <motion.h1 
                variants={itemFade}
                className={cn(
                  "text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter mb-8",
                  serifClass
                )}
              >
                {data.bio}
              </motion.h1>
              <motion.p variants={itemFade} className="text-xl md:text-2xl text-slate-500 italic mb-12">
                {data.role}
              </motion.p>
              {(heroConfig.ctaLabel || heroConfig.secondaryCtaLabel) && (
                <motion.div variants={itemFade} className="flex flex-wrap gap-4">
                  {heroConfig.ctaLabel && (
                    <Magnetic intensity={0.2} enabled={data.designConfig?.magneticButtons !== false}>
                      <a href={heroConfig.ctaLink || '#'} className={buttonStyleClass()}>
                        {heroConfig.ctaLabel}
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    </Magnetic>
                  )}
                </motion.div>
              )}
            </div>
          </div>
          <div className="flex-1 relative min-h-[400px]">
            {heroConfig.backgroundImage && (
              <img src={heroConfig.backgroundImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/40" />
            {data.profileImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.img 
                  variants={itemFade}
                  src={data.profileImage} 
                  className={cn("w-64 h-80 object-cover shadow-2xl skew-y-3", roundedClass)} 
                />
              </div>
            )}
          </div>
        </motion.header>
      );
    }

    if (style === 'immersive') {
      return (
        <motion.header 
          {...commonEntrance}
          className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
             <motion.img 
               src={heroConfig.backgroundImage || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop'} 
               className="w-full h-full object-cover"
               style={{ y: parallaxY }}
             />
             <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>
          <div className="relative z-10 text-center text-white px-6 max-w-5xl">
            <motion.div variants={itemFade} className="mb-6 inline-block px-4 py-1.5 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest bg-white/5">
              Available for new projects
            </motion.div>
            <motion.h1 
              variants={itemFade}
              className={cn(
                "text-6xl md:text-9xl font-medium tracking-tighter mb-10 leading-[0.9]",
                serifClass
              )}
            >
              {data.bio}
            </motion.h1>
            <motion.p variants={itemFade} className="text-xl md:text-3xl text-white/70 italic mb-12 max-w-2xl mx-auto">
              {data.role}
            </motion.p>
            <motion.div variants={itemFade} className="flex justify-center gap-6">
              <Magnetic intensity={0.2}>
                <a href={heroConfig.ctaLink || '#'} className={buttonStyleClass()}>
                  {heroConfig.ctaLabel || 'View Projects'}
                </a>
              </Magnetic>
            </motion.div>
          </div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
            <div className="w-[1px] h-20 bg-white" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] vertical-rl text-white">Scroll</span>
          </div>
        </motion.header>
      );
    }

    // Default Minimalist / Immersive Overlay-ish (current implementation)
    return (
      <motion.header 
        initial="hidden"
        animate="visible"
        variants={getEntranceVariants()}
        className={cn(
          "relative overflow-hidden transition-all duration-700",
          heroConfig.padding === 'small' ? 'py-12 md:py-20' : 
          heroConfig.padding === 'large' ? 'py-32 md:py-48' : 
          heroConfig.padding === 'fullscreen' ? 'h-screen flex items-center' : 'py-16 md:py-48',
          heroConfig.backgroundImage ? (heroConfig.padding === 'fullscreen' ? '' : 'min-h-[60vh] md:min-h-[70vh] flex items-center') : 'max-w-4xl mx-auto px-6',
          data.designConfig?.textAlign === 'center' ? 'text-center' : data.designConfig?.textAlign === 'right' ? 'text-right' : ''
        )}
      >
        {heroConfig.backgroundImage && (
          <>
            <motion.div 
              className="absolute inset-0 z-0"
              style={{
                y: data.designConfig?.parallaxIntensity ? parallaxY : 0
              }}
            >
               <img src={heroConfig.backgroundImage} alt="Hero" className="w-full h-full object-cover" />
               <div 
                 className="absolute inset-0 bg-black transition-opacity duration-700" 
                 style={{ opacity: (heroConfig.overlayOpacity || 0) / 100 }} 
               />
            </motion.div>
          </>
        )}

        <motion.div 
          style={{
            rotateX: data.designConfig?.mouseSkew ? (mousePos.y / window.innerHeight - 0.5) * 10 : 0,
            rotateY: data.designConfig?.mouseSkew ? (mousePos.x / window.innerWidth - 0.5) * -10 : 0,
          }}
          className={cn(
            "relative z-10 w-full flex flex-col md:flex-row gap-16 items-center",
            heroConfig.backgroundImage ? 'max-w-4xl mx-auto px-6' : '',
            heroConfig.alignment === 'center' ? 'text-center flex-col' : heroConfig.alignment === 'right' ? 'flex-row-reverse text-right' : '',
            heroConfig.textColor === 'white' ? 'text-white' : heroConfig.textColor === 'dark' ? 'text-slate-900' : ''
          )}
        >
          <div className="flex-1 w-full">
            <motion.h1 
              variants={itemFade}
              className={cn(
                "text-4xl sm:text-5xl md:text-8xl font-medium leading-[1.0] md:leading-[0.9] mb-8 md:mb-10 tracking-tighter tracking-tight", 
                serifClass,
                data.designConfig?.headingSize === 'sm' ? 'md:text-6xl' : data.designConfig?.headingSize === 'md' ? 'md:text-7xl' : data.designConfig?.headingSize === 'xl' ? 'md:text-[9rem]' : ''
              )}
            >
              {data.bio}
            </motion.h1>
            <motion.div 
              variants={itemFade}
              className={cn(
                "flex flex-col md:flex-row items-center gap-8 md:gap-12",
                heroConfig.alignment === 'center' || data.designConfig?.textAlign === 'center' ? 'md:justify-center' : heroConfig.alignment === 'right' || data.designConfig?.textAlign === 'right' ? 'md:flex-row-reverse md:justify-end' : ''
              )}
            >
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
                  data.accentColor === 'violet' ? "bg-violet-500" :
                  data.accentColor === 'sky' ? "bg-sky-500" :
                  data.accentColor === 'lime' ? "bg-lime-500" : (heroConfig.textColor === 'white' ? 'bg-white' : "bg-slate-900")
                )} />
                <span>Available for Work</span>
              </div>
            </motion.div>

            {(heroConfig.ctaLabel || heroConfig.secondaryCtaLabel) && (
              <motion.div 
                variants={itemFade}
                className={cn(
                  "flex flex-wrap gap-4 mt-12",
                  heroConfig.alignment === 'center' || data.designConfig?.textAlign === 'center' ? 'justify-center' : heroConfig.alignment === 'right' || data.designConfig?.textAlign === 'right' ? 'justify-end' : ''
                )}>
                {heroConfig.ctaLabel && (
                  <Magnetic intensity={0.2} enabled={data.designConfig?.magneticButtons !== false}>
                    <a href={heroConfig.ctaLink || '#'} className={buttonStyleClass()}>
                      {heroConfig.ctaLabel}
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </Magnetic>
                )}
                {heroConfig.secondaryCtaLabel && (
                  <Magnetic intensity={0.2} enabled={data.designConfig?.magneticButtons !== false}>
                    <a href={heroConfig.secondaryCtaLink || '#'} className={buttonStyleClass(true)}>
                      {heroConfig.secondaryCtaLabel}
                    </a>
                  </Magnetic>
                )}
              </motion.div>
            )}
          </div>
          {data.profileImage && (
            <motion.div 
              variants={itemFade}
              className={cn("w-56 h-56 md:w-64 md:h-64 overflow-hidden shrink-0 border-8 border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 scale-90 md:scale-100", roundedClass)}
            >
              <img src={data.profileImage} alt={data.name} className="w-full h-full object-cover" />
            </motion.div>
          )}
        </motion.div>
        {heroConfig.showScrollIndicator && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
            <div className="w-[1px] h-12 bg-current" />
          </motion.div>
        )}
      </motion.header>
    );
  };

  return (
    <div className={cn("min-h-screen bg-white text-slate-900 transition-colors duration-500 overflow-x-hidden relative", fontClass, data.theme === 'dark' ? "bg-slate-950 text-white" : "")} 
         style={{ transitionDuration: `${(data.designConfig?.themeTransition || 0.5) * 1000}ms` }}>
      
      {/* Custom Cursor */}
      {data.designConfig?.cursorType && data.designConfig?.cursorType !== 'default' && (
        <motion.div 
          className={cn(
            "fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[999] mix-blend-difference border border-white",
            data.designConfig?.cursorType === 'dot' ? "w-2 h-2 bg-white" : "w-10 h-10",
            data.designConfig?.cursorInvert ? "mix-blend-difference" : ""
          )}
          animate={{
            x: mousePos.x - (data.designConfig?.cursorType === 'dot' ? 4 : 20),
            y: mousePos.y - (data.designConfig?.cursorType === 'dot' ? 4 : 20),
            scale: getCursorScale()
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 450, mass: 0.5 }}
        />
      )}

      {/* Scroll Progress */}
      {data.designConfig?.showScrollProgress !== false && (
        <motion.div 
          className={cn("fixed top-0 left-0 right-0 h-1 z-[110] origin-left", getAccentBgClass())}
          style={{ scaleX, ...getAccentStyle() }}
        />
      )}

      {/* BG Gradient Animation */}
      {data.designConfig?.bgAnimation && (
        <div className="fixed inset-0 -z-10 opacity-30 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, rgba(16,185,129,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, rgba(99,102,241,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 0% 100%, rgba(244,63,94,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 0%, rgba(16,185,129,0.15) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Noise Overlay */}
      {data.designConfig?.showNoise && (
        <div 
          className="fixed inset-0 pointer-events-none z-[100] mix-blend-overlay"
          style={{ opacity: data.designConfig?.noiseIntensity || 0.03 }}
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>
      )}

      <nav className={navLayoutClass} style={{ backdropFilter: data.designConfig?.scrollBlur && scrollProgress > 0 ? 'blur(8px)' : 'none' }}>
        <div className={cn(
          "max-w-7xl mx-auto px-6 h-full flex justify-between items-center",
          data.designConfig?.navLayout === 'floating' ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full border border-slate-200 dark:border-slate-800 shadow-lg px-8" : ""
        )}>
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
        </div>

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

      {renderHero()}

      {/* Render sections based on navLinks */}
      <div className={cn(
        "space-y-16 md:space-y-32 mb-16 md:mb-32",
        data.designConfig?.sectionSpacing === 'tight' ? 'space-y-8 md:space-y-16 mb-8 md:mb-16' : 
        data.designConfig?.sectionSpacing === 'spacious' ? 'space-y-24 md:space-y-56 mb-24 md:mb-56' : ''
      )}>
        {navLinksToRender.map(link => link.sectionType && renderSection(link.sectionType))}
      </div>

      <footer className="max-w-4xl mx-auto px-6 py-32 border-t border-slate-100 dark:border-slate-800 text-center">
        <h2 className={cn("text-4xl md:text-6xl font-medium mb-12 tracking-tight whitespace-pre-line", serifClass)}>
          {data.contactHeadline || "Let's create something meaningful together."}
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
