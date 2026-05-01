import React, { useEffect, useState, useCallback } from 'react';
import { 
  Layers, Monitor, Phone, Settings, Sparkles, Download, Circle, 
  LayoutDashboard, Database, LogOut, Loader2, Link2, Plus, Trash2, 
  Menu, X, Wand2, Type, Palette, Smartphone, Globe, BarChart, 
  User, Briefcase, Award, Star, Quote, ChevronRight, Square, 
  Box, MousePointer2, Move, Clock, Zap
} from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { useAuthStore } from '../store/useAuthStore';
import { logout } from '../lib/firebase';
import { cn } from '../lib/utils';

import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableProjectItem = ({ project, index, onDelete, onUpdate }: { project: any, index: number, onDelete: (i: number) => void, onUpdate: (i: number, k: string, v: string) => void, key?: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group"
    >
      <button 
        onClick={() => onDelete(index)} 
        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow-lg z-20 animate-in zoom-in"
      >
        <Trash2 className="w-3 h-3" />
      </button>
      <div className="flex gap-3 mb-3 items-center">
         <div {...attributes} {...listeners} className="p-1 hover:bg-slate-50 rounded cursor-grab active:cursor-grabbing shrink-0">
            <Move className="w-3.5 h-3.5 text-slate-300" />
         </div>
         <input 
          type="text" 
          value={project.title} 
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          className="text-sm font-bold w-full bg-transparent border-b border-transparent focus:border-slate-100 outline-none"
          placeholder="Project Title"
         />
      </div>
      <textarea 
        value={project.description} 
        onChange={(e) => onUpdate(index, 'description', e.target.value)}
        className="text-xs text-slate-500 w-full bg-transparent border-none outline-none resize-none mb-3"
        rows={2}
        placeholder="Short description..."
      />
      <div className="flex gap-2">
        <input 
          type="text" 
          value={project.imageUrl || ''} 
          onChange={(e) => onUpdate(index, 'imageUrl', e.target.value)}
          className="flex-1 text-[9px] p-2 bg-slate-50 rounded-lg font-mono border border-transparent focus:border-slate-100 outline-none"
          placeholder="Image URL"
        />
        <input 
          type="text" 
          value={project.link || ''} 
          onChange={(e) => onUpdate(index, 'link', e.target.value)}
          className="flex-1 text-[9px] p-2 bg-slate-50 rounded-lg font-mono border border-transparent focus:border-slate-100 outline-none"
          placeholder="Project Link"
        />
      </div>
    </div>
  );
};

const SortableNavItem = ({ link, idx, navLinks, onChange }: { link: any, idx: number, navLinks: any[], onChange: (key: string, value: any) => void, key?: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4 group relative"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="p-1 hover:bg-slate-50 rounded cursor-grab active:cursor-grabbing">
          <Move className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <input 
          type="text" 
          value={link.label}
          onChange={(e) => {
             const nl = [...navLinks];
             nl[idx] = { ...nl[idx], label: e.target.value };
             onChange('navLinks', nl);
          }}
          className="flex-1 text-xs font-bold bg-transparent outline-none border-b border-transparent focus:border-slate-100"
          placeholder="Label"
        />
        <button 
         onClick={() => {
            const nl = [...navLinks];
            nl.splice(idx, 1);
            onChange('navLinks', nl);
         }}
         className="text-slate-300 hover:text-rose-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block">Section Style</label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'projects', icon: Box },
              { id: 'about', icon: User },
              { id: 'services', icon: Briefcase },
              { id: 'experience', icon: Clock },
              { id: 'testimonials', icon: Quote },
              { id: 'awards', icon: Award },
              { id: 'contact', icon: Globe },
              { id: 'custom', icon: Link2 }
            ].map(type => (
              <button 
                key={type.id}
                onClick={() => {
                   const nl = [...navLinks];
                   nl[idx] = { ...nl[idx], sectionType: type.id as any, url: type.id === 'custom' ? link.url : `#${type.id}` };
                   onChange('navLinks', nl);
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
        {link.sectionType === 'custom' && (
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block">URL / Anchor</label>
            <input 
              type="text" 
              value={link.url}
              onChange={(e) => {
                 const nl = [...navLinks];
                 nl[idx] = { ...nl[idx], url: e.target.value };
                 onChange('navLinks', nl);
              }}
              className="w-full text-[10px] p-2 bg-slate-50 rounded-lg border border-transparent font-mono"
              placeholder="#section or https://"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const SortableCanvasItem = ({ id, children, isActive, isSelected, onSelect }: { id: string, children: React.ReactNode, isActive: boolean, isSelected?: boolean, onSelect?: (id: string, multi: boolean) => void, key?: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={(e) => {
        if (isActive && onSelect) {
          e.stopPropagation();
          onSelect(id, e.shiftKey || e.metaKey || e.ctrlKey);
        }
      }}
      className={cn(
        "relative group transition-all",
        isActive && "cursor-pointer",
        isActive && "hover:ring-2 hover:ring-indigo-400/50 rounded-xl",
        isActive && isSelected && "ring-2 ring-indigo-500 bg-indigo-50/10 shadow-lg",
        isActive && isDragging && "scale-[0.98] shadow-2xl"
      )}
    >
      {isActive && (
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500 text-white p-2 rounded-full cursor-grab active:cursor-grabbing shadow-lg z-50 flex items-center justify-center"
          title="Drag to rearrange"
        >
          <Move className="w-4 h-4" />
        </div>
      )}
      {children}
    </div>
  );
};

export default function Editor() {
  const { user, profile } = useAuthStore();
  const { 
    data, loading, fetchPortfolio, updateData, 
    deviceMode, setDeviceMode, 
    sidebarTab, setSidebarTab, 
    canvasDragMode, setCanvasDragMode,
    selectedCanvasItems, toggleCanvasSelection, clearCanvasSelection
  } = usePortfolioStore();
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

  const handleCanvasDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Find what we are dragging
      const isNav = localData.navLinks.some((l: any) => l.id === active.id) || active.id === 'hero-name';
      const isProject = localData.projects?.some((p: any) => p.id === active.id);
      const isEducation = localData.education?.some((e: any) => e.id === active.id);
      const isService = localData.services?.some((s: any) => s.id === active.id);
      const isExperience = localData.experience?.some((e: any) => e.id === active.id);
      const isTestimonial = localData.testimonials?.some((t: any) => t.id === active.id);
      const isAward = localData.awards?.some((a: any) => a.id === active.id);
      
      const heroItems = ['hero-headline', 'hero-subheadline', 'hero-ctas'];
      const isHeroItem = heroItems.includes(active.id as string);

      if (isNav) {
        const oldIndex = localData.navLinks.findIndex((link: any) => link.id === active.id);
        const newIndex = localData.navLinks.findIndex((link: any) => link.id === over.id);
        handleChange('navLinks', arrayMove(localData.navLinks, oldIndex, newIndex));
      } else if (isProject) {
        const oldIndex = localData.projects.findIndex((p: any) => p.id === active.id);
        const newIndex = localData.projects.findIndex((p: any) => p.id === over.id);
        handleChange('projects', arrayMove(localData.projects, oldIndex, newIndex));
      } else if (isEducation) {
        const oldIndex = localData.education.findIndex((e: any) => e.id === active.id);
        const newIndex = localData.education.findIndex((e: any) => e.id === over.id);
        handleChange('education', arrayMove(localData.education, oldIndex, newIndex));
      } else if (isService) {
        const oldIndex = localData.services.findIndex((s: any) => s.id === active.id);
        const newIndex = localData.services.findIndex((s: any) => s.id === over.id);
        handleChange('services', arrayMove(localData.services, oldIndex, newIndex));
      } else if (isExperience) {
        const oldIndex = localData.experience.findIndex((e: any) => e.id === active.id);
        const newIndex = localData.experience.findIndex((e: any) => e.id === over.id);
        handleChange('experience', arrayMove(localData.experience, oldIndex, newIndex));
      } else if (isTestimonial) {
        const oldIndex = localData.testimonials.findIndex((t: any) => t.id === active.id);
        const newIndex = localData.testimonials.findIndex((t: any) => t.id === over.id);
        handleChange('testimonials', arrayMove(localData.testimonials, oldIndex, newIndex));
      } else if (isAward) {
        const oldIndex = localData.awards.findIndex((a: any) => a.id === active.id);
        const newIndex = localData.awards.findIndex((a: any) => a.id === over.id);
        handleChange('awards', arrayMove(localData.awards, oldIndex, newIndex));
      } else if (isHeroItem) {
        const currentOrder = localData.heroConfig?.layoutOrder || heroItems;
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);
        if (oldIndex !== -1 && newIndex !== -1) {
          handleChange('heroConfig', { 
            ...localData.heroConfig, 
            layoutOrder: arrayMove(currentOrder, oldIndex, newIndex) 
          });
        }
      } else {
        // Section reorder (from the main sections context)
        // Check if IDs are in navLinks or special sections
        const allSectionIds = [
          ...localData.navLinks.map((l: any) => l.id),
          'skills',
          'contact'
        ];
        
        const oldIndex = allSectionIds.indexOf(active.id as string);
        const newIndex = allSectionIds.indexOf(over.id as string);
        
        if (oldIndex !== -1 && newIndex !== -1) {
           // We'll update a sectionOrder field if we want to be explicit,
           // but for now, reordering navLinks works for those.
           // If it's Skills or Contact, they are usually at the bottom.
           // To keep it simple, if it's a nav link being moved:
           const activeNavLinkIndex = localData.navLinks.findIndex((l: any) => l.id === active.id);
           const overNavLinkIndex = localData.navLinks.findIndex((l: any) => l.id === over.id);
           
           if (activeNavLinkIndex !== -1 && overNavLinkIndex !== -1) {
              handleChange('navLinks', arrayMove(localData.navLinks, activeNavLinkIndex, overNavLinkIndex));
           }
        }
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localData.navLinks.findIndex((link: any) => link.id === active.id);
      const newIndex = localData.navLinks.findIndex((link: any) => link.id === over.id);
      handleChange('navLinks', arrayMove(localData.navLinks, oldIndex, newIndex));
    }
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

    if (sidebarTab === 'animation') {
      return (
        <div className="p-6 space-y-8">
           <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Animation & Interactions
          </div>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Page Entrance</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Entrance Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['fade', 'slide', 'zoom', 'none'] as const).map(v => (
                      <button key={v} onClick={() => handleDesignChange('pageEntrance', v)} className={cn("py-2 text-[10px] font-bold border rounded-lg", (localData.designConfig?.pageEntrance || 'fade') === v ? "bg-slate-900 text-white border-slate-900" : "text-slate-400 border-slate-50")}>
                        {v}
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Direction</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['up', 'down', 'left', 'right'] as const).map(d => (
                      <button key={d} onClick={() => handleDesignChange('entranceDirection', d)} className={cn("py-1.5 text-[10px] font-bold border rounded-md", (localData.designConfig?.entranceDirection || 'up') === d ? "bg-slate-900 text-white border-slate-900" : "text-slate-400 border-slate-50")}>
                        {d}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Duration (s)</span>
                  <input type="range" min="0.1" max="2" step="0.1" value={localData.designConfig?.entranceDuration || 0.8} onChange={(e) => handleDesignChange('entranceDuration', parseFloat(e.target.value))} className="w-32 accent-emerald-500" />
               </div>
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('staggerEnabled', !localData.designConfig?.staggerEnabled)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stagger Elements</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.staggerEnabled ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.staggerEnabled ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Micro-Interactions</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Text Reveal Effect</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['none', 'chars', 'words', 'lines'] as const).map(v => (
                      <button key={v} onClick={() => handleDesignChange('textReveal', v)} className={cn("py-2 text-[10px] font-bold border rounded-lg", (localData.designConfig?.textReveal || 'none') === v ? "bg-slate-900 text-white border-slate-900" : "text-slate-400 border-slate-50")}>
                        {v}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Parallax Intensity</span>
                  <input type="range" min="0" max="1" step="0.1" value={localData.designConfig?.parallaxIntensity || 0.5} onChange={(e) => handleDesignChange('parallaxIntensity', parseFloat(e.target.value))} className="w-32 accent-indigo-500" />
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Hover Scale</span>
                  <input type="range" min="1" max="1.2" step="0.01" value={localData.designConfig?.hoverScale || 1.05} onChange={(e) => handleDesignChange('hoverScale', parseFloat(e.target.value))} className="w-32 accent-rose-500" />
               </div>
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('magneticButtons', !localData.designConfig?.magneticButtons)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Magnetic Icons</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.magneticButtons ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.magneticButtons ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Transition Speed</span>
                  <input type="range" min="0.1" max="1" step="0.1" value={localData.designConfig?.transitionSpeed || 0.3} onChange={(e) => handleDesignChange('transitionSpeed', parseFloat(e.target.value))} className="w-32 accent-slate-900" />
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Global Experience</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('showScrollProgress', !localData.designConfig?.showScrollProgress)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Scroll Progress Bar</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.showScrollProgress !== false ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.showScrollProgress !== false ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('smoothScroll', !localData.designConfig?.smoothScroll)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Smooth Scroll</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.smoothScroll ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.smoothScroll ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Custom Cursor Type</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['default', 'dot', 'circle', 'trail'] as const).map(v => (
                      <button key={v} onClick={() => handleDesignChange('cursorType', v)} className={cn("py-1.5 text-[10px] font-bold border rounded-md", (localData.designConfig?.cursorType || 'default') === v ? "bg-slate-900 text-white border-slate-900" : "text-slate-400 border-slate-50")}>
                        {v}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('cursorInvert', !localData.designConfig?.cursorInvert)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cursor Invert Effect</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.cursorInvert ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.cursorInvert ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('bgAnimation', !localData.designConfig?.bgAnimation)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">BG Gradient Animation</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.bgAnimation ? "bg-indigo-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.bgAnimation ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Scroll Effects</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('scrollReveal', !localData.designConfig?.scrollReveal)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Scroll Reveal</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.scrollReveal ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.scrollReveal ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Reveal Distance</span>
                  <input type="range" min="0" max="200" step="10" value={localData.designConfig?.revealDistance || 50} onChange={(e) => handleDesignChange('revealDistance', parseInt(e.target.value))} className="w-32 accent-emerald-500" />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Modal Entrance</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['scale', 'slide', 'fade'] as const).map(v => (
                      <button key={v} onClick={() => handleDesignChange('modalStyle', v)} className={cn("py-1.5 text-[10px] font-bold border rounded-md", (localData.designConfig?.modalStyle || 'scale') === v ? "bg-slate-900 text-white border-slate-900" : "text-slate-400 border-slate-50")}>
                        {v}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Card Lift</span>
                  <input type="range" min="0" max="20" step="2" value={localData.designConfig?.hoverLift || 8} onChange={(e) => handleDesignChange('hoverLift', parseInt(e.target.value))} className="w-32 accent-emerald-500" />
               </div>
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('scrollBlur', !localData.designConfig?.scrollBlur)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Scroll Blur (Nav)</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.scrollBlur ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.scrollBlur ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Advanced Behavior</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Nav Behavior</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['fixed', 'sticky', 'hide'] as const).map(v => (
                      <button key={v} onClick={() => handleDesignChange('navBehavior', v)} className={cn("py-1.5 text-[10px] font-bold border rounded-md", (localData.designConfig?.navBehavior || 'fixed') === v ? "bg-slate-900 text-white border-slate-900" : "text-slate-400 border-slate-50")}>
                        {v}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('mouseSkew', !localData.designConfig?.mouseSkew)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Hero Mouse Skew</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.mouseSkew ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.mouseSkew ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
               <div className="flex items-center justify-between" onClick={() => handleDesignChange('tiltEffect', !localData.designConfig?.tiltEffect)}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">3D Tilt Cards</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.tiltEffect ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={cn("w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform", localData.designConfig?.tiltEffect ? "translate-x-4.5" : "translate-x-1.5")} />
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Noise Intensity</span>
                  <input type="range" min="0" max="1" step="0.05" value={localData.designConfig?.noiseIntensity || 0.05} onChange={(e) => handleDesignChange('noiseIntensity', parseFloat(e.target.value))} className="w-32 accent-slate-400" />
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Theme Switcher Speed (s)</span>
                  <input type="range" min="0.1" max="1" step="0.1" value={localData.designConfig?.themeTransition || 0.5} onChange={(e) => handleDesignChange('themeTransition', parseFloat(e.target.value))} className="w-32 accent-indigo-500" />
               </div>
            </div>
          </section>
        </div>
      );
    }

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
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Text Alignment</label>
                  <div className="flex bg-slate-50 p-1 rounded-lg gap-1">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button 
                        key={align}
                        onClick={() => handleDesignChange('textAlign', align)}
                        className={cn("flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all", localData.designConfig?.textAlign === align ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </section>

          {/* Site Structure */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Layout & Spacing</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Nav Layout</label>
                  <div className="flex bg-slate-50 p-1 rounded-lg gap-1">
                    {(['standard', 'floating', 'glass'] as const).map(l => (
                      <button 
                        key={l}
                        onClick={() => handleDesignChange('navLayout', l)}
                        className={cn("flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all", localData.designConfig?.navLayout === l ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Section Padding</label>
                  <div className="flex bg-slate-50 p-1 rounded-lg gap-1">
                    {(['tight', 'normal', 'spacious'] as const).map(p => (
                      <button 
                        key={p}
                        onClick={() => handleDesignChange('sectionSpacing', p)}
                        className={cn("flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all", localData.designConfig?.sectionSpacing === p ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Project Columns</label>
                  <div className="flex bg-slate-50 p-1 rounded-lg gap-1">
                    {(['1', '2', '3'] as const).map(c => (
                      <button 
                        key={c}
                        onClick={() => handleDesignChange('projectColumns', c)}
                        className={cn("flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all", (localData.designConfig?.projectColumns || '2') === c ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Card Shadow</label>
                  <div className="flex bg-slate-50 p-1 rounded-lg gap-1">
                    {(['none', 'soft', 'medium', 'deep'] as const).map(s => (
                      <button 
                        key={s}
                        onClick={() => handleDesignChange('shadowStyle', s)}
                        className={cn("flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all", (localData.designConfig?.shadowStyle || 'medium') === s ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}
                      >
                        {s}
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Your Name</label>
                  <input 
                    type="text" 
                    value={localData.name || ''} 
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all" 
                    placeholder="Enter your name"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Hero Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['minimalist', 'split', 'immersive'] as const).map(style => (
                      <button 
                        key={style}
                        onClick={() => handleHeroChange('heroStyle', style)}
                        className={cn(
                          "py-2 text-[10px] font-bold border rounded-lg transition-all",
                          (localData.heroConfig?.heroStyle || 'minimalist') === style ? "bg-slate-900 text-white border-slate-900 shadow-md" : "text-slate-400 border-slate-100 bg-white hover:border-slate-300"
                        )}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
               </div>
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
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                const { active, over } = event;
                if (over && active.id !== over.id) {
                  const oldIndex = localData.projects.findIndex((p: any) => p.id === active.id);
                  const newIndex = localData.projects.findIndex((p: any) => p.id === over.id);
                  handleChange('projects', arrayMove(localData.projects, oldIndex, newIndex));
                }
              }}
            >
              <SortableContext 
                items={(localData.projects || []).map((p: any) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {(localData.projects || []).map((p: any, i: number) => (
                    <SortableProjectItem key={p.id} project={p} index={i} onDelete={handleDeleteProject} onUpdate={handleUpdateProject} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
               Experience
               <button onClick={() => handleChange('experience', [...(localData.experience || []), { id: Date.now().toString(), role: 'Position', company: 'Company', startDate: '2023', endDate: 'Present', description: '' }])} className="text-emerald-500 flex items-center gap-1 hover:bg-emerald-50 px-2 py-0.5 rounded transition-colors">
                  <Plus className="w-3.5 h-3.5" /> <span className="text-[9px]">ADD</span>
               </button>
            </h3>
            <div className="space-y-4">
               {localData.experience?.map((exp: any, i: number) => (
                 <div key={exp.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative group">
                    <button onClick={() => {
                        const updated = [...localData.experience];
                        updated.splice(i, 1);
                        handleChange('experience', updated);
                    }} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow-lg z-10 animate-in zoom-in">
                       <Trash2 className="w-3 h-3" />
                    </button>
                    <input 
                      type="text" 
                      value={exp.role} 
                      onChange={(e) => {
                         const updated = [...localData.experience];
                         updated[i] = { ...updated[i], role: e.target.value };
                         handleChange('experience', updated);
                      }}
                      className="text-xs font-bold w-full bg-transparent border-none outline-none mb-1"
                      placeholder="Role"
                    />
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={exp.company}
                         onChange={(e) => {
                            const updated = [...localData.experience];
                            updated[i] = { ...updated[i], company: e.target.value };
                            handleChange('experience', updated);
                         }}
                         className="flex-1 text-[10px] text-slate-500 bg-transparent border-none outline-none"
                         placeholder="Company"
                       />
                       <input 
                         type="text" 
                         value={`${exp.startDate} - ${exp.endDate}`}
                         onChange={(e) => {
                            const updated = [...localData.experience];
                            const parts = e.target.value.split('-').map(p => p.trim());
                            updated[i] = { ...updated[i], startDate: parts[0] || '', endDate: parts[1] || '' };
                            handleChange('experience', updated);
                         }}
                         className="text-[10px] text-slate-400 bg-transparent border-none outline-none w-24 text-right"
                         placeholder="2020 - 2023"
                       />
                    </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
               Education
               <button onClick={() => handleChange('education', [...(localData.education || []), { id: Date.now().toString(), degree: 'Degree', institution: 'University', year: '2024' }])} className="text-emerald-500 flex items-center gap-1 hover:bg-emerald-50 px-2 py-0.5 rounded transition-colors">
                  <Plus className="w-3.5 h-3.5" /> <span className="text-[9px]">ADD</span>
               </button>
            </h3>
            <div className="space-y-4">
               {localData.education?.map((edu: any, i: number) => (
                 <div key={edu.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative group">
                    <button onClick={() => {
                        const updated = [...localData.education];
                        updated.splice(i, 1);
                        handleChange('education', updated);
                    }} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow-lg z-10 animate-in zoom-in">
                       <Trash2 className="w-3 h-3" />
                    </button>
                    <input 
                      type="text" 
                      value={edu.degree} 
                      onChange={(e) => {
                         const updated = [...localData.education];
                         updated[i] = { ...updated[i], degree: e.target.value };
                         handleChange('education', updated);
                      }}
                      className="text-xs font-bold w-full bg-transparent border-none outline-none mb-1"
                      placeholder="Degree"
                    />
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={edu.institution}
                         onChange={(e) => {
                            const updated = [...localData.education];
                            updated[i] = { ...updated[i], institution: e.target.value };
                            handleChange('education', updated);
                         }}
                         className="flex-1 text-[10px] text-slate-500 bg-transparent border-none outline-none"
                         placeholder="Institution"
                       />
                       <input 
                         type="text" 
                         value={edu.year}
                         onChange={(e) => {
                            const updated = [...localData.education];
                            updated[i] = { ...updated[i], year: e.target.value };
                            handleChange('education', updated);
                         }}
                         className="text-[10px] text-slate-400 bg-transparent border-none outline-none w-16 text-right"
                         placeholder="Year"
                       />
                    </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Skills & Expertise</h3>
            <div className="space-y-4">
               <textarea 
                  value={(localData.skills || []).join(', ')} 
                  onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="w-full text-sm p-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none transition-all resize-none"
                  rows={2}
                  placeholder="e.g. React, UX Design, TypeScript (comma separated)"
               />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Contact Section</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Contact Headline</label>
                  <textarea 
                    value={localData.contactHeadline || ''} 
                    onChange={(e) => handleChange('contactHeadline', e.target.value)}
                    rows={2}
                    className="w-full text-sm p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none" 
                    placeholder="Let's create something extraordinary together."
                  />
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {['email', 'linkedin', 'github', 'twitter', 'instagram', 'dribbble'].map(platform => (
                 <div key={platform} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block capitalize">{platform}</label>
                    <input 
                      type="text" 
                      value={localData.socialLinks?.[platform] || ''}
                      onChange={(e) => handleChange('socialLinks', { ...(localData.socialLinks || {}), [platform]: e.target.value })}
                      className="w-full text-[10px] bg-transparent outline-none focus:text-indigo-600 transition-colors"
                      placeholder={platform === 'email' ? 'hello@world.com' : 'https://...'}
                    />
                 </div>
               ))}
            </div>
          </section>
        </div>
      );
    }

    if (sidebarTab === 'navigation') {
      return (
        <div className="p-6 space-y-10">
          <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5" /> Site Navigation & Layout
          </div>
          
          <div className="space-y-4">
             <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <p className="text-[10px] font-bold text-indigo-500 uppercase mb-2">Pro Tip</p>
                <p className="text-xs text-indigo-700 leading-relaxed">Drag the handles to reorder sections. The order of navigation determines the order of sections on your landing page.</p>
             </div>

             <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
             >
                <SortableContext 
                  items={(localData.navLinks || []).map((l: any) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {(localData.navLinks || []).map((link: any, idx: number) => (
                      <SortableNavItem key={link.id} link={link} idx={idx} navLinks={localData.navLinks} onChange={handleChange} />
                    ))}
                  </div>
                </SortableContext>
             </DndContext>

             <button 
              onClick={() => handleChange('navLinks', [...(localData.navLinks || []), { id: Date.now().toString(), label: 'New Section', url: '#', sectionType: 'projects' }])}
              className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-bold text-[10px] uppercase hover:bg-slate-50 transition-colors"
             >
                + Add Navigation Item
             </button>
          </div>
        </div>
      );
    }

    if (sidebarTab === 'animation') {
      return (
        <div className="p-6 space-y-10 h-full overflow-y-auto custom-scrollbar">
          <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Motion & Interaction
          </div>

          {/* Page Entrance */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Page Entrance</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Effect</label>
                <div className="grid grid-cols-2 gap-2">
                  {['fade', 'slide', 'zoom', 'none'].map((eff) => (
                    <button 
                      key={eff}
                      onClick={() => handleDesignChange('pageEntrance', eff as any)}
                      className={cn(
                        "py-2 text-[10px] font-bold border rounded-lg transition-all",
                        (localData.designConfig?.pageEntrance || 'fade') === eff ? "bg-slate-900 text-white border-slate-900 shadow-md" : "text-slate-400 border-slate-100 bg-white hover:border-slate-300"
                      )}
                    >
                      {eff.charAt(0).toUpperCase() + eff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Direction</label>
                <div className="grid grid-cols-4 gap-1">
                  {['up', 'down', 'left', 'right'].map((dir) => (
                    <button 
                      key={dir}
                      onClick={() => handleDesignChange('entranceDirection', dir as any)}
                      className={cn(
                        "py-1.5 text-[9px] font-bold border rounded transition-all capitalize",
                        (localData.designConfig?.entranceDirection || 'up') === dir ? "bg-indigo-500 text-white border-indigo-500 shadow-sm" : "text-slate-400 border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stagger Elements</span>
                <button 
                  onClick={() => handleDesignChange('staggerEnabled', !localData.designConfig?.staggerEnabled)}
                  className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.staggerEnabled !== false ? "bg-indigo-500" : "bg-slate-200")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform", localData.designConfig?.staggerEnabled !== false ? "translate-x-4" : "translate-x-1")} />
                </button>
              </div>
            </div>
          </section>

          {/* Text Effects */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Typography Anim</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Reveal Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {['none', 'chars', 'words', 'lines'].map((style) => (
                    <button 
                      key={style}
                      onClick={() => handleDesignChange('textReveal', style as any)}
                      className={cn(
                        "py-2 text-[10px] font-bold border rounded-lg transition-all",
                        (localData.designConfig?.textReveal || 'none') === style ? "bg-slate-900 text-white border-slate-900 shadow-md" : "text-slate-400 border-slate-100 bg-white hover:border-slate-300"
                      )}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Scroll Effects */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Scroll Effects</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Scroll Reveal</span>
                <button 
                  onClick={() => handleDesignChange('scrollReveal', !localData.designConfig?.scrollReveal)}
                  className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.scrollReveal !== false ? "bg-emerald-500" : "bg-slate-200")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform", localData.designConfig?.scrollReveal !== false ? "translate-x-4" : "translate-x-1")} />
                </button>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Smooth Scroll</span>
                <button 
                  onClick={() => handleDesignChange('smoothScroll', !localData.designConfig?.smoothScroll)}
                  className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.smoothScroll !== false ? "bg-emerald-500" : "bg-slate-200")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform", localData.designConfig?.smoothScroll !== false ? "translate-x-4" : "translate-x-1")} />
                </button>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Parallax: {localData.designConfig?.parallaxIntensity || 0}%</label>
                <input 
                  type="range" min="0" max="100" 
                  value={localData.designConfig?.parallaxIntensity || 0}
                  onChange={(e) => handleDesignChange('parallaxIntensity', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Scroll Progress Bar</span>
                <button 
                  onClick={() => handleDesignChange('showScrollProgress', !localData.designConfig?.showScrollProgress)}
                  className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.showScrollProgress ? "bg-emerald-500" : "bg-slate-200")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform", localData.designConfig?.showScrollProgress ? "translate-x-4" : "translate-x-1")} />
                </button>
              </div>
            </div>
          </section>

          {/* Interaction */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">User Interaction</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Magnetic Buttons</span>
                <button 
                  onClick={() => handleDesignChange('magneticButtons', !localData.designConfig?.magneticButtons)}
                  className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.magneticButtons !== false ? "bg-indigo-500" : "bg-slate-200")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform", localData.designConfig?.magneticButtons !== false ? "translate-x-4" : "translate-x-1")} />
                </button>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tilt on Hover</span>
                <button 
                  onClick={() => handleDesignChange('tiltEffect', !localData.designConfig?.tiltEffect)}
                  className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.tiltEffect ? "bg-indigo-500" : "bg-slate-200")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform", localData.designConfig?.tiltEffect ? "translate-x-4" : "translate-x-1")} />
                </button>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cursor Inversion</span>
                <button 
                  onClick={() => handleDesignChange('cursorInvert', !localData.designConfig?.cursorInvert)}
                  className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.cursorInvert ? "bg-indigo-500" : "bg-slate-200")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform", localData.designConfig?.cursorInvert ? "translate-x-4" : "translate-x-1")} />
                </button>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Magnification: {localData.designConfig?.hoverScale || 1.05}x</label>
                <input 
                  type="range" min="1.0" max="1.3" step="0.01"
                  value={localData.designConfig?.hoverScale || 1.05}
                  onChange={(e) => handleDesignChange('hoverScale', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            </div>
          </section>

          {/* Modal Styles */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Overlay Behaviors</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block px-1">Modal Transition</label>
                <div className="grid grid-cols-3 gap-2">
                  {['fade', 'scale', 'slide'].map((style) => (
                    <button 
                      key={style}
                      onClick={() => handleDesignChange('modalStyle', style as any)}
                      className={cn(
                        "py-2 text-[9px] font-bold border rounded-lg transition-all capitalize",
                        (localData.designConfig?.modalStyle || 'fade') === style ? "bg-slate-900 text-white border-slate-900 shadow-md" : "text-slate-400 border-slate-100 bg-white hover:border-slate-300"
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Theme Transition</span>
                <button 
                  onClick={() => handleDesignChange('themeTransition', localData.designConfig?.themeTransition ? 0 : 0.5)}
                  className={cn("w-8 h-4 rounded-full relative transition-colors", localData.designConfig?.themeTransition !== 0 ? "bg-indigo-500" : "bg-slate-200")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform", localData.designConfig?.themeTransition !== 0 ? "translate-x-4" : "translate-x-1")} />
                </button>
              </div>
            </div>
          </section>
        </div>
      );
    }

    return null;
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

          <button 
            onClick={() => { 
              setSidebarTab('animation'); 
              if (window.innerWidth < 768) {
                setIsMobileNavOpen(false);
                setIsMobileEditorOpen(true);
              }
            }}
            className={cn("p-2 rounded-lg transition-colors relative group", sidebarTab === 'animation' ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white")}
          >
            <Zap className="w-5 h-5" />
            <span className="absolute left-14 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Animation</span>
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
            <div className="px-4 py-2 text-slate-600 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg hidden lg:flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Canvas Edit</span>
              <button 
                onClick={() => setCanvasDragMode(!canvasDragMode)}
                className={cn(
                  "w-8 h-4 rounded-full relative transition-colors",
                  canvasDragMode ? "bg-indigo-500" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "w-2.5 h-2.5 bg-white rounded-full absolute top-[3.5px] transition-transform",
                  canvasDragMode ? "translate-x-4.5" : "translate-x-1"
                )} />
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
                    <SortableCanvasItem 
                      id="hero-name" 
                      isActive={canvasDragMode}
                      isSelected={selectedCanvasItems.includes('hero-name')}
                      onSelect={toggleCanvasSelection}
                    >
                      {localData.name || 'Your Name'}
                    </SortableCanvasItem>
                  </div>
                  {deviceMode === 'desktop' ? (
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleCanvasDragEnd}
                    >
                    <SortableContext 
                        items={['hero-name', ...(localData.navLinks || []).map((l: any) => l.id)]}
                        strategy={horizontalListSortingStrategy}
                      >
                        <div className="flex gap-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">
                          {(localData.navLinks || []).map((link: any) => (
                            <SortableCanvasItem 
                              key={link.id} 
                              id={link.id} 
                              isActive={canvasDragMode}
                              isSelected={selectedCanvasItems.includes(link.id)}
                              onSelect={toggleCanvasSelection}
                            >
                              <span className={cn(
                                "transition-all duration-300 relative group pb-1",
                                canvasDragMode ? "cursor-move" : "cursor-default",
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
                            </SortableCanvasItem>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="md:hidden">
                       <Menu className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </nav>

                {/* Hero Section Preview */}
                {(() => {
                  const heroConfig = localData.heroConfig || {};
                  const heroStyle = heroConfig.heroStyle || 'minimalist';
                  const heroItems = ['hero-headline', 'hero-subheadline', 'hero-ctas'];
                  const layoutOrder = heroConfig.layoutOrder || heroItems;

                  const renderHeroItem = (id: string) => {
                    if (id === 'hero-headline') {
                      return (
                        <SortableCanvasItem 
                          key="hero-headline"
                          id="hero-headline" 
                          isActive={canvasDragMode}
                          isSelected={selectedCanvasItems.includes('hero-headline')}
                          onSelect={toggleCanvasSelection}
                        >
                          <h2 className={cn(
                            heroStyle === 'immersive' ? "text-4xl md:text-6xl mb-8 leading-[0.9]" : "text-3xl md:text-5xl mb-6 tracking-tight",
                            "font-medium",
                            localData.font === 'serif-sans' || localData.font === 'cormorant' ? 'font-serif' : ''
                          )}>
                            {localData.bio || 'Your bio message...'}
                          </h2>
                        </SortableCanvasItem>
                      );
                    }
                    if (id === 'hero-subheadline') {
                      return (
                        <SortableCanvasItem 
                          key="hero-subheadline"
                          id="hero-subheadline" 
                          isActive={canvasDragMode}
                          isSelected={selectedCanvasItems.includes('hero-subheadline')}
                          onSelect={toggleCanvasSelection}
                        >
                          <p className={cn(
                            "italic font-medium",
                            heroStyle === 'split' ? "text-sm md:text-base text-slate-500 mb-8" : 
                            heroStyle === 'immersive' ? "text-lg opacity-80 mb-10" :
                            "text-base md:text-lg mb-8" + (heroConfig.textColor === 'white' ? ' text-white/80' : ' text-slate-500 dark:text-slate-400')
                          )}>
                            {localData.role || 'Your professional role'}
                          </p>
                        </SortableCanvasItem>
                      );
                    }
                    if (id === 'hero-ctas' && (heroStyle === 'split' || heroStyle === 'immersive')) {
                      return (
                        <SortableCanvasItem 
                          key="hero-ctas"
                          id="hero-ctas" 
                          isActive={canvasDragMode}
                          isSelected={selectedCanvasItems.includes('hero-ctas')}
                          onSelect={toggleCanvasSelection}
                        >
                          <div className={cn("flex gap-4", heroStyle === 'immersive' ? "justify-center" : "")}>
                            {heroConfig.ctaLabel && (
                              <button className={cn(
                                "px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full",
                                heroStyle === 'immersive' ? "bg-white text-slate-900 px-8 py-3" : "bg-slate-900 text-white"
                              )}>
                                {heroConfig.ctaLabel}
                              </button>
                            )}
                          </div>
                        </SortableCanvasItem>
                      );
                    }
                    return null;
                  };

                  const heroContent = (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCanvasDragEnd}>
                      <SortableContext items={layoutOrder} strategy={verticalListSortingStrategy}>
                        {layoutOrder.map(id => renderHeroItem(id))}
                      </SortableContext>
                    </DndContext>
                  );
                  
                  if (heroStyle === 'split') {
                    return (
                      <header className={cn(
                        "relative overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[500px]",
                        localData.theme === 'dark' ? "bg-slate-950 text-white" : "bg-white text-slate-900"
                      )}>
                        <div className={cn("p-8 md:p-16 flex flex-col justify-center", canvasDragMode && "space-y-4")}>
                          {heroContent}
                        </div>
                        <div className="relative h-64 md:h-auto bg-slate-100">
                          {heroConfig.backgroundImage ? (
                            <img src={heroConfig.backgroundImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300"><Box className="w-12 h-12" /></div>
                          )}
                        </div>
                      </header>
                    );
                  }

                  if (heroStyle === 'immersive') {
                    return (
                      <header className="relative h-[600px] flex items-center justify-center text-center px-8 overflow-hidden">
                        {heroConfig.backgroundImage && (
                          <div className="absolute inset-0 z-0">
                            <img src={heroConfig.backgroundImage} alt="Hero" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40" style={{ opacity: (heroConfig.overlayOpacity || 40) / 100 }} />
                          </div>
                        )}
                        <div className={cn("relative z-10 text-white max-w-2xl px-6", canvasDragMode && "space-y-4")}>
                          {heroContent}
                        </div>
                      </header>
                    );
                  }

                  // Default / Minimalist
                  return (
                    <header 
                      className={cn(
                        "relative overflow-hidden transition-all duration-700",
                        (heroConfig.padding === 'small' ? 'py-8 md:py-12' : heroConfig.padding === 'large' ? 'py-20 md:py-32' : 'py-12 md:py-20'),
                        heroConfig.backgroundImage ? 'min-h-[400px] flex items-center px-8 md:px-12' : 'px-8 md:px-12'
                      )}
                    >
                      {heroConfig.backgroundImage && (
                        <div className="absolute inset-0 z-0">
                           <img src={heroConfig.backgroundImage} alt="Hero" className="w-full h-full object-cover" />
                           <div 
                             className="absolute inset-0 bg-black transition-opacity" 
                             style={{ opacity: (heroConfig.overlayOpacity || 0) / 100 }} 
                           />
                        </div>
                      )}
                      <div className={cn(
                        "relative z-10 w-full",
                        heroConfig.alignment === 'center' ? 'text-center' : heroConfig.alignment === 'right' ? 'text-right' : 'text-left',
                        heroConfig.textColor === 'white' ? 'text-white' : heroConfig.textColor === 'dark' ? 'text-slate-900' : '',
                        canvasDragMode && "space-y-4"
                      )}>
                        {heroContent}
                      </div>
                    </header>
                  );
                })()}

                <div className={cn(
                  "pb-24 space-y-16 md:space-y-24 mt-8 md:mt-12",
                  deviceMode === 'mobile' ? 'px-6' : 'px-12',
                  canvasDragMode && "space-y-4"
                )}>
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleCanvasDragEnd}
                  >
                    <SortableContext 
                      items={[
                        ...(localData.navLinks || []).map((l: any) => l.id),
                        'skills-section',
                        'contact-section'
                      ]}
                      strategy={verticalListSortingStrategy}
                    >
                      {(localData.navLinks || []).map((link: any) => {
                        const type = link.sectionType;
                        const sectionId = type === 'custom' ? link.url.replace('#', '') : type;
                        
                        let sectionContent = null;

                        if (type === 'projects') {
                          sectionContent = (
                              <div id={sectionId} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Selected Works</h4>
                                <DndContext 
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={handleCanvasDragEnd}
                                >
                                  <SortableContext 
                                    items={(localData.projects || []).map((p: any) => p.id)}
                                    strategy={rectSortingStrategy}
                                  >
                                    <div className={cn(
                                      "grid gap-6 sm:gap-8",
                                      localData.template === 'minimalist' ? 'grid-cols-1' : (localData.designConfig?.projectColumns === '3' ? 'grid-cols-3' : (deviceMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'))
                                    )}>
                                      {localData.projects?.map((p: any, index: number) => (
                                        <SortableCanvasItem 
                                          key={p.id || `project-${index}`} 
                                          id={p.id} 
                                          isActive={canvasDragMode}
                                          isSelected={selectedCanvasItems.includes(p.id)}
                                          onSelect={toggleCanvasSelection}
                                        >
                                          <div className="group cursor-pointer">
                                            <div className={cn(
                                              "aspect-[4/5] rounded-xl mb-4 overflow-hidden relative shadow-sm border dark:border-slate-800",
                                              p.imageBg || 'bg-slate-100'
                                            )}>
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
                                        </SortableCanvasItem>
                                      ))}
                                    </div>
                                  </SortableContext>
                                </DndContext>
                              </div>
                          );
                        } else if (type === 'services') {
                          sectionContent = (
                            <div id={sectionId} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Services</h4>
                              <DndContext 
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleCanvasDragEnd}
                              >
                                <SortableContext 
                                  items={(localData.services || []).map((s: any) => s.id)}
                                  strategy={rectSortingStrategy}
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     {localData.services?.map((s: any) => (
                                       <SortableCanvasItem 
                                          key={s.id} 
                                          id={s.id} 
                                          isActive={canvasDragMode}
                                          isSelected={selectedCanvasItems.includes(s.id)}
                                          onSelect={toggleCanvasSelection}
                                       >
                                         <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 h-full">
                                            <h5 className="font-bold text-sm mb-2">{s.title}</h5>
                                            <p className="text-xs text-slate-500">{s.description}</p>
                                         </div>
                                       </SortableCanvasItem>
                                     ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            </div>
                          );
                        } else if (type === 'testimonials') {
                          sectionContent = (
                            <div id={sectionId} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Kind Words</h4>
                               <DndContext 
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={handleCanvasDragEnd}
                               >
                                  <SortableContext 
                                    items={(localData.testimonials || []).map((t: any) => t.id)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    <div className="space-y-8">
                                       {localData.testimonials?.map((t: any) => (
                                         <SortableCanvasItem 
                                            key={t.id} 
                                            id={t.id} 
                                            isActive={canvasDragMode}
                                            isSelected={selectedCanvasItems.includes(t.id)}
                                            onSelect={toggleCanvasSelection}
                                         >
                                           <div className="max-w-xl">
                                              <p className="text-lg italic font-medium mb-4">"{t.quote}"</p>
                                              <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-slate-100" />
                                                 <div>
                                                    <p className="text-xs font-bold">{t.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase">{t.role}</p>
                                                 </div>
                                              </div>
                                           </div>
                                         </SortableCanvasItem>
                                       ))}
                                    </div>
                                  </SortableContext>
                               </DndContext>
                            </div>
                          );
                        } else if (type === 'experience') {
                          sectionContent = (
                            <div id={sectionId} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Experience</h4>
                              <DndContext 
                                 sensors={sensors}
                                 collisionDetection={closestCenter}
                                 onDragEnd={handleCanvasDragEnd}
                              >
                                 <SortableContext 
                                   items={(localData.experience || []).map((e: any) => e.id)}
                                   strategy={verticalListSortingStrategy}
                                 >
                                   <div className="space-y-12">
                                     {localData.experience?.map((exp: any, index: number) => (
                                        <SortableCanvasItem 
                                           key={exp.id || `exp-${index}`} 
                                           id={exp.id} 
                                           isActive={canvasDragMode}
                                           isSelected={selectedCanvasItems.includes(exp.id)}
                                           onSelect={toggleCanvasSelection}
                                        >
                                          <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                                             <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest w-32 shrink-0 pt-1">{exp.startDate} - {exp.endDate || 'Present'}</div>
                                             <div>
                                                <h5 className={cn("text-lg font-medium mb-1", localData.font === 'serif-sans' || localData.font === 'cormorant' ? 'font-serif' : '')}>{exp.role}</h5>
                                                <p className="text-slate-500 text-sm mb-2">{exp.company}</p>
                                                <p className="text-slate-400 text-xs leading-relaxed max-w-lg">{exp.description}</p>
                                             </div>
                                          </div>
                                        </SortableCanvasItem>
                                     ))}
                                   </div>
                                 </SortableContext>
                              </DndContext>
                            </div>
                          );
                        } else if (type === 'awards') {
                           sectionContent = (
                            <div id={sectionId} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Recognition</h4>
                               <DndContext 
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={handleCanvasDragEnd}
                               >
                                  <SortableContext 
                                    items={(localData.awards || []).map((a: any) => a.id)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    <div className="space-y-4">
                                       {localData.awards?.map((a: any) => (
                                         <SortableCanvasItem 
                                            key={a.id} 
                                            id={a.id} 
                                            isActive={canvasDragMode}
                                            isSelected={selectedCanvasItems.includes(a.id)}
                                            onSelect={toggleCanvasSelection}
                                         >
                                           <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-900 group">
                                              <div>
                                                 <p className="text-sm font-bold">{a.title}</p>
                                                 <p className="text-xs text-slate-400">{a.issuer}</p>
                                              </div>
                                              <div className="text-[10px] font-bold text-slate-300">{a.year}</div>
                                           </div>
                                         </SortableCanvasItem>
                                       ))}
                                    </div>
                                  </SortableContext>
                               </DndContext>
                            </div>
                           );
                         } else if (type === 'education') {
                           sectionContent = (
                             <div id={sectionId} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Education</h4>
                               <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCanvasDragEnd}>
                                 <SortableContext items={(localData.education || []).map((e: any) => e.id)} strategy={verticalListSortingStrategy}>
                                   <div className="space-y-8">
                                     {localData.education?.map((edu: any) => (
                                        <SortableCanvasItem key={edu.id} id={edu.id} isActive={canvasDragMode} isSelected={selectedCanvasItems.includes(edu.id)} onSelect={toggleCanvasSelection}>
                                          <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                                             <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest w-32 shrink-0 pt-1">{edu.year}</div>
                                             <div><h5 className={cn("text-lg font-medium mb-1", localData.font === 'serif-sans' || localData.font === 'cormorant' ? 'font-serif' : '')}>{edu.degree}</h5><p className="text-slate-500 text-sm">{edu.institution}</p></div>
                                          </div>
                                        </SortableCanvasItem>
                                     ))}
                                   </div>
                                 </SortableContext>
                               </DndContext>
                             </div>
                           );
                        } else if (type === 'about') {
                          sectionContent = (
                            <div id={sectionId} className="border-t border-slate-100 dark:border-slate-800 pt-16">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">About</h4>
                              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">{localData.bio || 'Your bio here...'}</p>
                            </div>
                          );
                        }

                        if (!sectionContent) return null;

                        return (
                          <SortableCanvasItem key={link.id} id={link.id} isActive={canvasDragMode}>
                            {sectionContent}
                          </SortableCanvasItem>
                        );
                      })}

                      {/* Skills Section (Expertise) */}
                      {!localData.hiddenSections?.includes('skills') && (localData.skills?.length || 0) > 0 && (
                        <SortableCanvasItem 
                          id="skills-section" 
                          isActive={canvasDragMode}
                          isSelected={selectedCanvasItems.includes('skills-section')}
                          onSelect={toggleCanvasSelection}
                        >
                          <div id="skills" className="border-t border-slate-100 dark:border-slate-800 pt-16 text-center">
                             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Expertise</h4>
                             <div className="flex flex-wrap justify-center gap-3">
                                {localData.skills.map((skill: string, index: number) => (
                                   <span key={index} className={cn(
                                     "px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest rounded-full",
                                     localData.accentColor === 'emerald' && "border-emerald-500/20 text-emerald-600",
                                     localData.accentColor === 'indigo' && "border-indigo-500/20 text-indigo-600"
                                   )}>{skill}</span>
                                ))}
                             </div>
                          </div>
                        </SortableCanvasItem>
                      )}

                      {/* Contact Section */}
                      {!localData.hiddenSections?.includes('contact') && (
                        <SortableCanvasItem 
                          id="contact-section" 
                          isActive={canvasDragMode}
                          isSelected={selectedCanvasItems.includes('contact-section')}
                          onSelect={toggleCanvasSelection}
                        >
                          <div id="contact" className="border-t border-slate-100 dark:border-slate-800 pt-24 pb-12 text-center">
                             <h2 className={cn("text-3xl md:text-5xl font-medium mb-8 leading-tight whitespace-pre-line", localData.font === 'serif-sans' || localData.font === 'cormorant' ? 'font-serif' : '')}>
                               {localData.contactHeadline || "Let's create something extraordinary together."}
                             </h2>
                             <a href={`mailto:${localData.socialLinks?.email}`} className="text-lg md:text-2xl font-bold underline underline-offset-8 decoration-slate-200 hover:decoration-indigo-500 transition-all">{localData.socialLinks?.email || 'hello@world.com'}</a>
                             
                             <SortableCanvasItem 
                               id="social-links" 
                               isActive={canvasDragMode}
                               isSelected={selectedCanvasItems.includes('social-links')}
                               onSelect={toggleCanvasSelection}
                             >
                               <div className="flex justify-center gap-6 mt-16 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                  {Object.entries(localData.socialLinks || {}).filter(([k, v]) => k !== 'email' && v).map(([platform, url]) => (
                                    <span key={platform} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">{platform}</span>
                                  ))}
                               </div>
                             </SortableCanvasItem>
                          </div>
                        </SortableCanvasItem>
                      )}
                    </SortableContext>
                  </DndContext>
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
