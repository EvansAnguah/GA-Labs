import React, { useEffect, useState, useCallback } from 'react';
import { 
  Layers, Monitor, Phone, Settings, Sparkles, Download, Circle, 
  LayoutDashboard, Database, LogOut, Loader2, Link2, Plus, Trash2, 
  Menu, X, Wand2, Type, Palette, Smartphone, Globe, BarChart, 
  User, Briefcase, Award, Star, Quote, ChevronRight, Square, 
  Box, MousePointer2, Move, Clock
} from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { useAuthStore } from '../store/useAuthStore';
import { logout } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Editor() {
  const { user, profile } = useAuthStore();
  const { data, loading, fetchPortfolio, updateData, deviceMode, setDeviceMode, sidebarTab, setSidebarTab } = usePortfolioStore();
  const [saveStatus, setSaveStatus] = useState<'synced' | 'saving'>('synced');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  
  // Local state for debounced editing
  const [localData, setLocalData] = useState<any>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchPortfolio(user.uid);
    }
  }, [user?.uid, fetchPortfolio]);

  useEffect(() => {
    if (data && localData === null) {
      setLocalData(data);
    }
  }, [data]);

  // Debounced save
  useEffect(() => {
    if (!localData || !user?.uid || localData === data) return;

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      await updateData(localData, user.uid);
      setSaveStatus('synced');
    }, 1000);

    return () => clearTimeout(timer);
  }, [localData, updateData, user?.uid]);

  const handleChange = (key: string, value: any) => {
    setLocalData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleUpdateProject = (index: number, key: string, value: string) => {
    const updatedProjects = [...(localData?.projects || [])];
    updatedProjects[index] = { ...updatedProjects[index], [key]: value };
    handleChange('projects', updatedProjects);
  };

  const handleAddProject = () => {
    const newProject = { id: Date.now().toString(), title: 'New Project', imageBg: 'bg-slate-200' };
    handleChange('projects', [...(localData?.projects || []), newProject]);
  };

  const handleDeleteProject = (index: number) => {
    const updatedProjects = [...(localData?.projects || [])];
    updatedProjects.splice(index, 1);
    handleChange('projects', updatedProjects);
  };

  const accentColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-900',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
    sky: 'bg-sky-500',
    lime: 'bg-lime-500',
    custom: 'bg-white'
  };

  const handleDesignChange = (key: string, value: any) => {
    handleChange('designConfig', { ...(localData.designConfig || {}), [key]: value });
  };

  const handleHeroChange = (key: string, value: any) => {
    handleChange('heroConfig', { ...(localData.heroConfig || {}), [key]: value });
  };

  const accentTextColorMap: Record<string, string> = {
    emerald: 'text-emerald-600',
    indigo: 'text-indigo-600',
    rose: 'text-rose-600',
    slate: 'text-slate-900',
    amber: 'text-amber-600',
    violet: 'text-violet-600',
  };

  if (loading || !localData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F1F5F9]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const renderRightPanel = () => {
    const isDark = localData.theme === 'dark';

    if (sidebarTab === 'design') {
      return (
        <div className="p-6 space-y-10">
          <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" /> Design Settings
          </div>

          {/* Theme & Branding */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Branding</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Dark Mode</span>
                <button 
                  onClick={() => handleChange('theme', localData.theme === 'dark' ? 'light' : 'dark')}
                  className={cn("w-10 h-5 rounded-full relative transition-colors", localData.theme === 'dark' ? "bg-slate-900" : "bg-slate-200")}
                >
                  <div className={cn("w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform", localData.theme === 'dark' ? "translate-x-5.5" : "translate-x-1")} />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Accent Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(accentColorMap).map(([name, bg]) => (
                    <button 
                      key={name}
                      onClick={() => handleChange('accentColor', name)}
                      className={cn(
                        "w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center relative",
                        bg,
                        localData.accentColor === name ? "border-slate-400 scale-110 shadow-md" : "border-transparent"
                      )}
                      title={name}
                    >
                      {name === 'custom' && <Palette className="w-4 h-4 text-slate-400" />}
                      {localData.accentColor === name && <Circle className="w-1.5 h-1.5 text-white absolute bg-white p-0 rounded-full" />}
                    </button>
                  ))}
                </div>
                {localData.accentColor === 'custom' && (
                  <div className="mt-3">
                    <input 
                      type="color"
                      value={localData.designConfig?.customAccentHex || '#10b981'}
                      onChange={(e) => handleDesignChange('customAccentHex', e.target.value)}
                      className="w-full h-8 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <Type className="w-3 h-3" /> Typography
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'serif-sans', label: 'Editorial' },
                { id: 'modern', label: 'Modern Sans' },
                { id: 'mono', label: 'Technical' },
                { id: 'outfit', label: 'Bold Geometric' },
                { id: 'jakarta', label: 'Friendly' },
                { id: 'space', label: 'Tech Grotesk' },
                { id: 'cormorant', label: 'Elegant Serif' },
                { id: 'mona', label: 'Classic' }
              ].map(font => (
                <button 
                  key={font.id}
                  onClick={() => handleChange('font', font.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    localData.font === font.id ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200"
                  )}
                >
                  <span className="text-[10px] font-bold block mb-1 opacity-60">{font.label}</span>
                  <span className="text-xs font-semibold">Abc 123</span>
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-2">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Heading Size</label>
                  <div className="flex bg-slate-50 p-1 rounded-lg gap-1">
                    {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                      <button 
                        key={size}
                        onClick={() => handleDesignChange('headingSize', size)}
                        className={cn("flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all", localData.designConfig?.headingSize === size ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Line Height</label>
                  <div className="flex bg-slate-50 p-1 rounded-lg gap-1">
                    {(['tight', 'normal', 'relaxed'] as const).map(lh => (
                      <button 
                        key={lh}
                        onClick={() => handleDesignChange('lineHeight', lh)}
                        className={cn("flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all", localData.designConfig?.lineHeight === lh ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}
                      >
                        {lh}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </section>

          {/* UI Elements */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">UI Elements</h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Border Radius</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'] as const).map(r => (
                    <button 
                      key={r}
                      onClick={() => handleDesignChange('borderRadius', r)}
                      className={cn(
                        "h-10 border flex items-center justify-center transition-all",
                        localData.designConfig?.borderRadius === r ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-100 text-slate-500",
                        r === 'none' ? 'rounded-none' : r === 'sm' ? 'rounded-sm' : r === 'md' ? 'rounded-md' : r === 'lg' ? 'rounded-lg' : r === 'xl' ? 'rounded-xl' : r === '2xl' ? 'rounded-2xl' : r === '3xl' ? 'rounded-[14px]' : 'rounded-full'
                      )}
                    >
                      <Square className={cn("w-4 h-4", r === 'full' ? 'rounded-full' : '')} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Button Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['solid', 'outline', 'ghost', 'soft', 'neo'] as const).map(style => (
                    <button 
                      key={style}
                      onClick={() => handleDesignChange('buttonStyle', style)}
                      className={cn(
                        "py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all",
                        localData.designConfig?.buttonStyle === style ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white border-slate-100 text-slate-500"
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Hover Interaction</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['underline', 'background', 'scale', 'glow', 'strikethrough', 'tilt', 'blur'] as const).map(effect => (
                    <button 
                      key={effect}
                      onClick={() => handleChange('hoverEffect', effect)}
                      className={cn(
                        "py-2 rounded-lg border text-[9px] font-bold uppercase transition-all",
                        localData.hoverEffect === effect ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-slate-50 border-slate-100 text-slate-400"
                      )}
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Effects */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Experience & Effects</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer" onClick={() => handleDesignChange('showNoise', !localData.designConfig?.showNoise)}>
                  <div className="flex items-center gap-2">
                     <Sparkles className="w-4 h-4 text-amber-500" />
                     <span className="text-xs font-bold text-slate-700">Film Grain Noise</span>
                  </div>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.showNoise ? "bg-emerald-500" : "bg-slate-300")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.showNoise ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>

               <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Mouse Cursor</label>
                    <div className="flex gap-2">
                       {(['default', 'dot', 'circle', 'none'] as const).map(c => (
                         <button 
                           key={c}
                           onClick={() => handleDesignChange('mouseCursor', c)}
                           className={cn("flex-1 py-2 text-[10px] font-bold border rounded-lg", localData.designConfig?.mouseCursor === c ? "bg-slate-900 text-white border-slate-900" : "text-slate-400 border-slate-50")}
                         >
                           {c}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Page Transitions</label>
                    <div className="flex gap-2">
                       {(['fade', 'slide', 'scale', 'none'] as const).map(t => (
                         <button 
                           key={t}
                           onClick={() => handleDesignChange('pageTransition', t)}
                           className={cn("flex-1 py-2 text-[10px] font-bold border rounded-lg", localData.designConfig?.pageTransition === t ? "bg-slate-900 text-white border-slate-900" : "text-slate-400 border-slate-50")}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          </section>
        </div>
      );
    }

    if (sidebarTab === 'content') {
      return (
        <div className="p-6 space-y-10">
          <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 flex items-center gap-2">
            <Database className="w-3.5 h-3.5" /> Content Editor
          </div>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Hero Section</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Headline</label>
                  <textarea 
                    value={localData.bio} 
                    onChange={(e) => handleChange('bio', e.target.value)}
                    rows={2}
                    className="w-full text-sm p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none" 
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Sub-headline / Role</label>
                  <input 
                    type="text" 
                    value={localData.role} 
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all" 
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Primary CTA</label>
                     <input 
                        type="text" 
                        placeholder="Label"
                        value={localData.heroConfig?.ctaLabel || ''}
                        onChange={(e) => handleHeroChange('ctaLabel', e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-100 bg-slate-50 mb-1"
                     />
                     <input 
                        type="text" 
                        placeholder="URL"
                        value={localData.heroConfig?.ctaLink || ''}
                        onChange={(e) => handleHeroChange('ctaLink', e.target.value)}
                        className="w-full text-[10px] p-2 rounded-lg border border-slate-100 bg-slate-50 font-mono"
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Secondary CTA</label>
                     <input 
                        type="text" 
                        placeholder="Label"
                        value={localData.heroConfig?.secondaryCtaLabel || ''}
                        onChange={(e) => handleHeroChange('secondaryCtaLabel', e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-100 bg-slate-50 mb-1"
                     />
                     <input 
                        type="text" 
                        placeholder="URL"
                        value={localData.heroConfig?.secondaryCtaLink || ''}
                        onChange={(e) => handleHeroChange('secondaryCtaLink', e.target.value)}
                        className="w-full text-[10px] p-2 rounded-lg border border-slate-100 bg-slate-50 font-mono"
                     />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Background Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={localData.heroConfig?.backgroundImage || ''}
                    onChange={(e) => handleHeroChange('backgroundImage', e.target.value)}
                    className="w-full text-[10px] p-3 rounded-xl border border-slate-100 bg-slate-50 font-mono"
                  />
               </div>
               <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Scroll Indicator</span>
                  <button 
                    onClick={() => handleHeroChange('showScrollIndicator', !localData.heroConfig?.showScrollIndicator)}
                    className={cn("w-8 h-4 rounded-full relative transition-colors", localData.heroConfig?.showScrollIndicator ? "bg-emerald-500" : "bg-slate-200")}
                  >
                    <div className={cn("w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform", localData.heroConfig?.showScrollIndicator ? "translate-x-4" : "translate-x-1")} />
                  </button>
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
               Projects
               <button onClick={handleAddProject} className="text-emerald-500 flex items-center gap-1 hover:bg-emerald-50 px-2 py-0.5 rounded transition-colors">
                  <Plus className="w-3.5 h-3.5" /> <span className="text-[9px]">ADD</span>
               </button>
            </h3>
            <div className="space-y-4">
               {localData.projects.map((p: any, i: number) => (
                 <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group">
                    <button onClick={() => handleDeleteProject(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow-lg z-10 animate-in zoom-in">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="space-y-3">
                       <input 
                        type="text" 
                        value={p.title} 
                        onChange={(e) => handleUpdateProject(i, 'title', e.target.value)}
                        className="text-sm font-bold w-full bg-transparent border-b border-transparent focus:border-slate-100 outline-none"
                        placeholder="Project Title"
                       />
                       <textarea 
                        value={p.description} 
                        onChange={(e) => handleUpdateProject(i, 'description', e.target.value)}
                        className="text-xs text-slate-500 w-full bg-transparent border-none outline-none resize-none"
                        rows={2}
                        placeholder="Short description..."
                       />
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={p.imageUrl || ''} 
                            onChange={(e) => handleUpdateProject(i, 'imageUrl', e.target.value)}
                            className="flex-1 text-[9px] p-2 bg-slate-50 rounded-lg font-mono border border-transparent focus:border-slate-100"
                            placeholder="Image URL"
                          />
                          <input 
                            type="text" 
                            value={p.link || ''} 
                            onChange={(e) => handleUpdateProject(i, 'link', e.target.value)}
                            className="flex-1 text-[9px] p-2 bg-slate-50 rounded-lg font-mono border border-transparent focus:border-slate-100"
                            placeholder="Project Link"
                          />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
               Testimonials
               <button onClick={() => handleChange('testimonials', [...(localData.testimonials || []), { id: Date.now().toString(), name: 'Client Name', role: 'CEO', quote: '' }])} className="text-emerald-500 flex items-center gap-1 hover:bg-emerald-50 px-2 py-0.5 rounded transition-colors">
                  <Plus className="w-3.5 h-3.5" /> <span className="text-[9px]">ADD</span>
               </button>
            </h3>
            <div className="space-y-4">
              {localData.testimonials?.map((t: any, i: number) => (
                <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group">
                  <button onClick={() => {
                    const updated = [...localData.testimonials];
                    updated.splice(i, 1);
                    handleChange('testimonials', updated);
                  }} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow-lg z-10 animate-in zoom-in">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <textarea 
                    value={t.quote} 
                    onChange={(e) => {
                       const updated = [...localData.testimonials];
                       updated[i] = { ...updated[i], quote: e.target.value };
                       handleChange('testimonials', updated);
                    }}
                    className="text-xs text-slate-600 font-medium italic w-full bg-transparent border-none outline-none resize-none mb-3"
                    rows={2}
                    placeholder="The feedback quote..."
                  />
                  <div className="flex gap-2">
                     <input 
                      type="text" 
                      value={t.name}
                      onChange={(e) => {
                         const updated = [...localData.testimonials];
                         updated[i] = { ...updated[i], name: e.target.value };
                         handleChange('testimonials', updated);
                      }}
                      className="flex-1 text-[10px] font-bold p-2 bg-slate-50 rounded-lg border border-transparent"
                      placeholder="Name"
                     />
                     <input 
                      type="text" 
                      value={t.role}
                      onChange={(e) => {
                         const updated = [...localData.testimonials];
                         updated[i] = { ...updated[i], role: e.target.value };
                         handleChange('testimonials', updated);
                      }}
                      className="flex-1 text-[10px] p-2 bg-slate-50 rounded-lg border border-transparent"
                      placeholder="Role"
                     />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
               Expertise & Services
               <button onClick={() => handleChange('services', [...(localData.services || []), { id: Date.now().toString(), title: 'New Service', description: '' }])} className="text-indigo-500 flex items-center gap-1 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors">
                  <Plus className="w-3.5 h-3.5" /> <span className="text-[9px]">ADD</span>
               </button>
            </h3>
            <div className="space-y-4">
               {localData.services?.map((s: any, i: number) => (
                 <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                    <button onClick={() => {
                       const updated = [...localData.services];
                       updated.splice(i, 1);
                       handleChange('services', updated);
                    }} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500">
                       <Trash2 className="w-3 h-3" />
                    </button>
                    <input 
                      type="text" 
                      value={s.title}
                      onChange={(e) => {
                         const updated = [...localData.services];
                         updated[i] = { ...updated[i], title: e.target.value };
                         handleChange('services', updated);
                      }}
                      className="text-xs font-bold w-full bg-transparent border-none outline-none mb-1"
                      placeholder="Service Title"
                    />
                    <textarea 
                      value={s.description}
                      onChange={(e) => {
                         const updated = [...localData.services];
                         updated[i] = { ...updated[i], description: e.target.value };
                         handleChange('services', updated);
                      }}
                      className="text-[10px] text-slate-500 w-full bg-transparent border-none outline-none resize-none"
                      rows={2}
                      placeholder="What do you offer?"
                    />
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
               Awards & Recognition
               <button onClick={() => handleChange('awards', [...(localData.awards || []), { id: Date.now().toString(), title: 'Award Name', organization: 'Org', year: '2024' }])} className="text-amber-500 flex items-center gap-1 hover:bg-amber-50 px-2 py-0.5 rounded transition-colors">
                  <Plus className="w-3.5 h-3.5" /> <span className="text-[9px]">ADD</span>
               </button>
            </h3>
            <div className="space-y-4">
               {localData.awards?.map((a: any, i: number) => (
                 <div key={a.id} className="p-4 bg-white rounded-2xl border border-slate-100 relative group flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                       <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <input 
                        type="text" 
                        value={a.title}
                        onChange={(e) => {
                           const updated = [...localData.awards];
                           updated[i] = { ...updated[i], title: e.target.value };
                           handleChange('awards', updated);
                        }}
                        className="text-xs font-bold w-full bg-transparent border-none outline-none"
                        placeholder="Award Name"
                       />
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={a.issuer || ''}
                            onChange={(e) => {
                               const updated = [...localData.awards];
                               updated[i] = { ...updated[i], issuer: e.target.value };
                               handleChange('awards', updated);
                            }}
                            className="text-[10px] text-slate-500 bg-transparent border-none outline-none"
                            placeholder="Organization / Issuer"
                          />
                          <input 
                            type="text" 
                            value={a.year}
                            onChange={(e) => {
                               const updated = [...localData.awards];
                               updated[i] = { ...updated[i], year: e.target.value };
                               handleChange('awards', updated);
                            }}
                            className="text-[10px] text-slate-400 bg-transparent border-none outline-none w-12"
                            placeholder="Year"
                          />
                       </div>
                    </div>
                    <button onClick={() => {
                       const updated = [...localData.awards];
                       updated.splice(i, 1);
                       handleChange('awards', updated);
                    }} className="text-slate-300 hover:text-rose-500">
                       <Trash2 className="w-3 h-3" />
                    </button>
                 </div>
               ))}
            </div>
          </section>
        </div>
      );
    }

    if (sidebarTab === 'navigation') {
      return (
        <div className="p-6 space-y-8">
           <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5" /> Site Structure
          </div>

          <div className="space-y-4">
             {(localData.navLinks || []).map((link: any, idx: number) => (
               <div key={link.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 relative group">
                  <button onClick={() => {
                    const nl = [...localData.navLinks];
                    nl.splice(idx, 1);
                    handleChange('navLinks', nl);
                  }} className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <input 
                    type="text" 
                    value={link.label}
                    onChange={(e) => {
                       const nl = [...localData.navLinks];
                       nl[idx] = { ...nl[idx], label: e.target.value };
                       handleChange('navLinks', nl);
                    }}
                    className="text-sm font-bold w-full outline-none"
                    placeholder="Nav Label"
                  />
                  <div>
                     <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Linked Content</label>
                     <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'projects', icon: Box },
                          { id: 'services', icon: Briefcase },
                          { id: 'testimonials', icon: Quote },
                          { id: 'experience', icon: Clock },
                          { id: 'awards', icon: Award },
                          { id: 'contact', icon: Settings },
                          { id: 'custom', icon: Globe }
                        ].map(type => (
                          <button 
                            key={type.id}
                            onClick={() => {
                               const nl = [...localData.navLinks];
                               nl[idx] = { ...nl[idx], sectionType: type.id, url: type.id === 'custom' ? link.url : `#${type.id}` };
                               handleChange('navLinks', nl);
                            }}
                            className={cn(
                              "p-1.5 rounded-lg border flex items-center gap-1.5 transition-all text-[9px] font-bold uppercase",
                              link.sectionType === type.id ? "bg-indigo-500 text-white border-indigo-500" : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"
                            )}
                          >
                            <type.icon className="w-3 h-3" />
                            {type.id}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
             ))}
             <button 
              onClick={() => handleChange('navLinks', [...(localData.navLinks || []), { id: Date.now().toString(), label: 'Section', url: '#', sectionType: 'projects' }])}
              className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-bold text-[10px] uppercase hover:bg-slate-50 transition-colors"
             >
                + Add Navigation Item
             </button>
          </div>
        </div>
      );
    }

    return null; // fallback
  };

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] font-sans overflow-hidden text-slate-900 relative">
      {/* Platform Navigation (Left Rail) */}
      <aside className={cn(
        "w-16 flex flex-col items-center py-6 bg-[#0F172A] text-white border-r border-slate-800 shrink-0 transition-transform duration-300 z-[60] absolute h-full md:relative md:translate-x-0",
        isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <img src="https://images.pexels.com/photos/37324423/pexels-photo-37324423.png" alt="Logo" className="w-8 h-8 mb-10 object-contain" referrerPolicy="no-referrer" />
        <div className="flex-1 flex flex-col gap-6">
          <button 
            onClick={() => { 
              setSidebarTab('design'); 
              if (window.innerWidth < 768) {
                setIsMobileNavOpen(false);
                setIsMobileEditorOpen(true);
              }
            }}
            className={cn("p-2 rounded-lg transition-colors relative group", sidebarTab === 'design' ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white")}
          >
            <Palette className="w-5 h-5" />
            <span className="absolute left-14 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Design Styles</span>
          </button>
          
          <button 
            onClick={() => { 
              setSidebarTab('content'); 
              if (window.innerWidth < 768) {
                setIsMobileNavOpen(false);
                setIsMobileEditorOpen(true);
              }
            }}
            className={cn("p-2 rounded-lg transition-colors relative group", sidebarTab === 'content' ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white")}
          >
            <Database className="w-5 h-5" />
            <span className="absolute left-14 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Content Editor</span>
          </button>

          <button 
            onClick={() => { 
              setSidebarTab('navigation'); 
              if (window.innerWidth < 768) {
                setIsMobileNavOpen(false);
                setIsMobileEditorOpen(true);
              }
            }}
            className={cn("p-2 rounded-lg transition-colors relative group", sidebarTab === 'navigation' ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white")}
          >
            <Link2 className="w-5 h-5" />
            <span className="absolute left-14 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Site Nav</span>
          </button>
        </div>
        <div className="mt-auto flex flex-col gap-4 items-center">
          {profile?.role === 'admin' && (
             <button onClick={() => window.open('/admin', '_blank')} className="p-2 text-amber-400 hover:text-amber-300 transition-colors" title="Admin Dashboard">
                <Settings className="w-5 h-5" />
             </button>
          )}
          <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-400 transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold ring-2 ring-transparent text-emerald-500 border border-slate-600 uppercase">
            {user?.email?.[0] || 'U'}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlays */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[55] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
      {isMobileEditorOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[45] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileEditorOpen(false)}
        />
      )}

      {/* Editor Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xs md:text-sm font-semibold text-slate-900 truncate max-w-[120px] md:max-w-none">
              {localData.name || 'Untitled'}'s Portfolio
            </h1>
            {localData.isPublished && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider hidden lg:flex items-center gap-1.5">
                <Link2 className="w-3 h-3" /> Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex bg-slate-100 p-1 rounded-md hidden sm:flex">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={cn(
                  "px-3 py-1 rounded shadow-sm text-xs font-medium transition-all flex items-center gap-1.5",
                  deviceMode === 'desktop' ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5",
                  deviceMode === 'mobile' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Phone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
            <div className="px-4 py-2 text-slate-600 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg hidden md:flex items-center gap-2 w-32 justify-center">
              {saveStatus === 'saving' ? (
                <><Loader2 className="w-3 h-3 animate-spin"/> Saving...</>
              ) : (
                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Saved</>
              )}
            </div>
            <button 
              onClick={() => window.open(`/${user?.uid}`, '_blank')}
              className="px-6 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 shadow-lg transition-colors"
            >
              Public View
            </button>
          </div>
        </header>

        {/* Content Area: Live Preview */}
        <section className="flex-1 p-4 sm:p-8 bg-slate-100 flex items-center justify-center overflow-hidden">
          <div
            className={cn(
              "h-full bg-white shadow-2xl rounded-t-xl overflow-hidden flex flex-col transition-all duration-500 ease-in-out border border-slate-200/50 relative",
              deviceMode === 'desktop' ? 'w-full max-w-[900px]' : 'w-[375px] max-h-[812px] my-auto rounded-xl mx-auto'
            )}
          >
            {/* Browser Chrome */}
            <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <div className="flex-1 flex justify-center">
                 <div className="w-32 h-4 bg-slate-200/50 rounded-sm"></div>
              </div>
            </div>

            {/* User Site Preview Content */}
            <div className={cn(
              "flex-1 overflow-y-auto custom-scrollbar transition-colors duration-500",
              localData.theme === 'dark' ? "bg-slate-950 text-white" : "bg-white text-slate-900",
              localData.font === 'mono' ? 'font-mono' : '',
              localData.font === 'outfit' ? 'font-[Outfit]' : '',
              localData.font === 'jakarta' ? 'font-[Plus_Jakarta_Sans]' : '',
              localData.font === 'space' ? 'font-[Space_Grotesk]' : '',
              localData.font === 'cormorant' ? 'font-[Cormorant_Garamond]' : '',
              localData.font === 'serif-sans' ? 'font-sans' : ''
            )}>
              <div className="min-h-full">
                <nav className={cn(
                  "flex justify-between items-center px-8 sm:px-12 pt-8 sm:pt-12 pb-0",
                  deviceMode === 'mobile' ? 'flex-col gap-4' : ''
                )}>
                  <div className={cn(
                    "text-lg font-bold uppercase tracking-widest truncate max-w-[200px]",
                    localData.font === 'serif-sans' || localData.font === 'cormorant' ? 'font-serif' : ''
                  )}>
                    {localData.name || 'Your Name'}
                  </div>
                  {deviceMode === 'desktop' ? (
                    <div className="flex gap-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">
                      {(localData.navLinks || []).map((link: any) => (
                        <span key={link.id} className={cn(
                          "transition-all duration-300 relative group pb-1 cursor-default",
                          localData.hoverEffect === 'scale' && "hover:scale-110",
                          localData.hoverEffect === 'strikethrough' && "hover:line-through shadow-indigo-200",
                          localData.accentColor === 'emerald' && "hover:text-emerald-500",
                          localData.accentColor === 'indigo' && "hover:text-indigo-500",
                          localData.accentColor === 'rose' && "hover:text-rose-600",
                          localData.accentColor === 'amber' && "hover:text-amber-500",
                          localData.accentColor === 'violet' && "hover:text-violet-500",
                          localData.accentColor === 'slate' && (localData.theme === 'dark' ? "hover:text-white" : "hover:text-slate-900")
                        )}>
                          {link.label}
                          {localData.hoverEffect === 'underline' && (
                            <span className={cn(
                              "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                              localData.accentColor === 'emerald' && "bg-emerald-500",
                              localData.accentColor === 'indigo' && "bg-indigo-500",
                              localData.accentColor === 'rose' && "bg-rose-500",
                              localData.accentColor === 'amber' && "bg-amber-500",
                              localData.accentColor === 'violet' && "bg-violet-500",
                              localData.accentColor === 'slate' && (localData.theme === 'dark' ? "bg-white" : "bg-slate-900")
                            )} />
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="md:hidden">
                       <Menu className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </nav>

                {/* Hero Section Preview */}
                <header 
                  className={cn(
                    "relative overflow-hidden transition-all duration-700",
                    (localData.heroConfig?.padding === 'small' ? 'py-8 md:py-12' : localData.heroConfig?.padding === 'large' ? 'py-20 md:py-32' : 'py-12 md:py-20'),
                    localData.heroConfig?.backgroundImage ? 'min-h-[400px] flex items-center px-8 md:px-12' : 'px-8 md:px-12'
                  )}
                >
                  {localData.heroConfig?.backgroundImage && (
                    <>
                      <div className="absolute inset-0 z-0">
                         <img src={localData.heroConfig.backgroundImage} alt="Hero" className="w-full h-full object-cover" />
                         <div 
                           className="absolute inset-0 bg-black transition-opacity" 
                           style={{ opacity: (localData.heroConfig.overlayOpacity || 0) / 100 }} 
                         />
                      </div>
                    </>
                  )}
                  <div className={cn(
                    "relative z-10 w-full",
                    localData.heroConfig?.alignment === 'center' ? 'text-center' : localData.heroConfig?.alignment === 'right' ? 'text-right' : 'text-left',
                    localData.heroConfig?.textColor === 'white' ? 'text-white' : localData.heroConfig?.textColor === 'dark' ? 'text-slate-900' : ''
                  )}>
                    <h2 className={cn(
                      "text-3xl sm:text-4xl md:text-6xl font-medium leading-[1.1] mb-6",
                      localData.font === 'serif-sans' || localData.font === 'cormorant' ? 'font-serif' : 'tracking-tight'
                    )}>
                      {localData.bio || 'Your bio message...'}
                    </h2>
                    <p className={cn(
                      "text-base md:text-lg italic font-medium mb-8",
                      localData.heroConfig?.textColor === 'white' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                    )}>
                      {localData.role || 'Your professional role'}
                    </p>
                  </div>
                </header>

                <div className={cn(
                  "pb-24 space-y-16 md:space-y-24 mt-8 md:mt-12",
                  deviceMode === 'mobile' ? 'px-6' : 'px-12'
                )}>
                  {(localData.navLinks || []).map((link: any) => {
                    const type = link.sectionType;
                    if (type === 'projects') {
                      return (
                        <div key={link.id} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Selected Works</h4>
                          <div className={cn(
                            "grid gap-6 sm:gap-8",
                            localData.template === 'minimalist' ? 'grid-cols-1' : (deviceMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')
                          )}>
                            {localData.projects?.map((p: any, index: number) => (
                              <div key={p.id || `project-${index}`} className="group cursor-pointer">
                                <div className={cn("aspect-[4/5] rounded-xl mb-4 overflow-hidden relative shadow-sm border dark:border-slate-800", p.imageBg || 'bg-slate-100')}>
                                  {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                  ) : (
                                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
                                        View Project
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <h3 className={cn("font-medium text-sm mb-1 line-clamp-1", localData.font === 'serif-sans' || localData.font === 'cormorant' ? 'font-serif' : '')}>
                                  {p.title || 'Untitled Project'}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-2">{p.description || 'Project description goes here.'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (type === 'experience') {
                      return (
                        <div key={link.id} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 text-center">Experience</h4>
                          <div className="space-y-12">
                            {localData.experience?.map((exp: any, index: number) => (
                               <div key={exp.id || `exp-${index}`} className="flex flex-col sm:flex-row gap-4 sm:gap-12">
                                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest w-32 shrink-0 pt-1">{exp.startDate} - {exp.endDate || 'Present'}</div>
                                  <div>
                                     <h5 className={cn("text-lg font-medium mb-1", localData.font === 'serif-sans' || localData.font === 'cormorant' ? 'font-serif' : '')}>{exp.role}</h5>
                                     <p className="text-slate-500 text-sm mb-2">{exp.company}</p>
                                     <p className="text-slate-400 text-xs leading-relaxed max-w-lg">{exp.description}</p>
                                  </div>
                               </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (type === 'about') {
                      return (
                        <div key={link.id} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">About</h4>
                           <div className={cn("text-xl leading-relaxed max-w-2xl", localData.font === 'serif-sans' || localData.font === 'cormorant' ? 'font-serif' : '')}>
                              {localData.bio}
                           </div>
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Skills Section (Always show if exists and not hidden) */}
                  {!localData.hiddenSections?.includes('skills') && localData.skills?.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-16 text-center">
                       <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Expertise</h4>
                       <div className="flex flex-wrap justify-center gap-3">
                          {localData.skills.map((skill: string, index: number) => (
                             <span key={index} className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest rounded-full">{skill}</span>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Editor Settings (Right Sidebar) */}
      <aside className={cn(
        "w-72 md:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden z-[50] shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-transform duration-300 absolute inset-y-0 right-0 md:relative md:translate-x-0 h-full",
        isMobileEditorOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-100">
             <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Settings</span>
             <button onClick={() => setIsMobileEditorOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
             </button>
          </div>
          {renderRightPanel()}
        </div>
      </aside>
    </div>
  );
}
