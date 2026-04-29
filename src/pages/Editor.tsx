import React, { useEffect, useState, useCallback } from 'react';
import { Layers, Monitor, Phone, Settings, Sparkles, Download, Circle, LayoutDashboard, Database, LogOut, Loader2, Link2, Plus, Trash2 } from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { useAuthStore } from '../store/useAuthStore';
import { logout } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Editor() {
  const { user, profile } = useAuthStore();
  const { data, loading, fetchPortfolio, updateData, deviceMode, setDeviceMode, sidebarTab, setSidebarTab } = usePortfolioStore();
  const [saveStatus, setSaveStatus] = useState<'synced' | 'saving'>('synced');
  
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
  };

  if (loading || !localData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F1F5F9]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const renderRightPanel = () => {
    if (sidebarTab === 'dashboard') {
      return (
        <div className="p-6">
          <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 mb-6 flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Portfolio Views</h3>
            <p className="text-3xl font-bold text-slate-900">1,204</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">+12% this week</p>
          </div>
        </div>
      );
    }
    
    if (sidebarTab === 'search') {
      return (
        <div className="p-6">
          <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 mb-5 flex items-center gap-2">
            <Database className="w-3.5 h-3.5" /> Content Editor
          </div>
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-2">Display Name</label>
              <input 
                type="text" 
                value={localData.name || ''} 
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-2">Profile Image URL</label>
              <input 
                type="text" 
                placeholder="https://example.com/avatar.png"
                value={localData.profileImage || ''} 
                onChange={(e) => handleChange('profileImage', e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-2">Role / Headline</label>
              <input 
                type="text" 
                value={localData.role} 
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-2">Biography</label>
              <textarea 
                value={localData.bio} 
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            
            
            <div className="pt-4 border-t border-slate-100">
              <label className="text-[11px] font-semibold text-slate-700 block mb-2">Skills (comma separated)</label>
              <textarea 
                value={(localData.skills || []).join(', ')} 
                onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                rows={2}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                placeholder="e.g. React, UX Design, Copywriting"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="text-[11px] font-semibold text-slate-700 block mb-2">Social Links</label>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Email Address"
                  value={localData.socialLinks?.email || ''} 
                  onChange={(e) => handleChange('socialLinks', { ...localData.socialLinks, email: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white" 
                />
                <input 
                  type="text" 
                  placeholder="LinkedIn URL"
                  value={localData.socialLinks?.linkedin || ''} 
                  onChange={(e) => handleChange('socialLinks', { ...localData.socialLinks, linkedin: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white mb-2" 
                />
                <input 
                  type="text" 
                  placeholder="GitHub URL"
                  value={localData.socialLinks?.github || ''} 
                  onChange={(e) => handleChange('socialLinks', { ...localData.socialLinks, github: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] font-semibold text-slate-700 block">Experience</label>
                <button onClick={() => {
                  const newExp = { id: Date.now().toString(), role: 'New Role', company: 'Company', startDate: '2023', endDate: 'Present', description: '' };
                  handleChange('experience', [...(localData?.experience || []), newExp]);
                }} className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-medium hover:bg-slate-200 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {(localData.experience || []).map((exp: any, i: number) => (
                  <div key={exp.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative group">
                    <button onClick={() => {
                      const updated = [...(localData.experience || [])];
                      updated.splice(i, 1);
                      handleChange('experience', updated);
                    }} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input 
                      type="text" 
                      placeholder="Job Title"
                      value={exp.role} 
                      onChange={(e) => {
                        const updated = [...localData.experience];
                        updated[i] = { ...updated[i], role: e.target.value };
                        handleChange('experience', updated);
                      }}
                      className="w-full text-xs font-semibold p-1.5 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mb-1"
                    />
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="Company"
                         value={exp.company} 
                         onChange={(e) => {
                           const updated = [...localData.experience];
                           updated[i] = { ...updated[i], company: e.target.value };
                           handleChange('experience', updated);
                         }}
                         className="flex-1 text-xs px-1.5 py-1 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mb-1 text-slate-600"
                       />
                       <input 
                         type="text" 
                         placeholder="Date (e.g. 2020-2023)"
                         value={`${exp.startDate} - ${exp.endDate}`} 
                         onChange={(e) => {
                           const updated = [...localData.experience];
                           const parts = e.target.value.split('-');
                           updated[i] = { ...updated[i], startDate: parts[0]?.trim() || '', endDate: parts[1]?.trim() || '' };
                           handleChange('experience', updated);
                         }}
                         className="flex-1 text-xs px-1.5 py-1 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mb-1 text-slate-500 text-right"
                       />
                    </div>
                    <textarea
                      placeholder="Responsibility description..."
                      value={exp.description || ''}
                      onChange={(e) => {
                         const updated = [...localData.experience];
                         updated[i] = { ...updated[i], description: e.target.value };
                         handleChange('experience', updated);
                      }}
                      rows={2}
                      className="w-full text-xs p-1.5 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none resize-none mt-1 text-slate-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] font-semibold text-slate-700 block">Education</label>
                <button onClick={() => {
                  const newEdu = { id: Date.now().toString(), degree: 'Degree', institution: 'Institution', year: '2023' };
                  handleChange('education', [...(localData?.education || []), newEdu]);
                }} className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-medium hover:bg-slate-200 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {(localData.education || []).map((edu: any, i: number) => (
                  <div key={edu.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative group">
                    <button onClick={() => {
                      const updated = [...(localData.education || [])];
                      updated.splice(i, 1);
                      handleChange('education', updated);
                    }} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input 
                      type="text" 
                      placeholder="Degree / Certificate"
                      value={edu.degree} 
                      onChange={(e) => {
                        const updated = [...localData.education];
                        updated[i] = { ...updated[i], degree: e.target.value };
                        handleChange('education', updated);
                      }}
                      className="w-full text-xs font-semibold p-1.5 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mb-1"
                    />
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="Institution"
                         value={edu.institution} 
                         onChange={(e) => {
                           const updated = [...localData.education];
                           updated[i] = { ...updated[i], institution: e.target.value };
                           handleChange('education', updated);
                         }}
                         className="flex-1 text-xs px-1.5 py-1 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mb-1 text-slate-600"
                       />
                       <input 
                         type="text" 
                         placeholder="Year"
                         value={edu.year} 
                         onChange={(e) => {
                           const updated = [...localData.education];
                           updated[i] = { ...updated[i], year: e.target.value };
                           handleChange('education', updated);
                         }}
                         className="w-16 text-xs px-1.5 py-1 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mb-1 text-slate-500 text-right"
                       />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] font-semibold text-slate-700 block">Projects</label>
                <button onClick={handleAddProject} className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-medium hover:bg-slate-200 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {localData.projects.map((p: any, i: number) => (
                  <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative group">
                    <button onClick={() => handleDeleteProject(i)} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input 
                      type="text" 
                      placeholder="Project Title"
                      value={p.title} 
                      onChange={(e) => handleUpdateProject(i, 'title', e.target.value)}
                      className="w-full text-xs font-semibold p-1.5 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mb-1"
                    />
                    <textarea
                      placeholder="Description"
                      value={p.description || ''}
                      onChange={(e) => handleUpdateProject(i, 'description', e.target.value)}
                      rows={2}
                      className="w-full text-xs p-1.5 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none resize-none mb-1 text-slate-600"
                    />
                    <input 
                      type="text" 
                      placeholder="Project URL"
                      value={p.link || ''} 
                      onChange={(e) => handleUpdateProject(i, 'link', e.target.value)}
                      className="w-full text-[10px] p-1.5 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mb-1 text-slate-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Project Image URL"
                      value={p.imageUrl || ''} 
                      onChange={(e) => handleUpdateProject(i, 'imageUrl', e.target.value)}
                      className="w-full text-[10px] p-1.5 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none mb-1 text-slate-500"
                    />
                    <div className="flex items-center gap-2 mt-2 text-[10px]">
                      <span className="text-slate-500">Color:</span>
                      {['bg-slate-100', 'bg-slate-200', 'bg-slate-800', 'bg-emerald-100', 'bg-rose-100'].map(bg => (
                        <button 
                          key={bg} 
                          onClick={() => handleUpdateProject(i, 'imageBg', bg)}
                          className={cn("w-4 h-4 rounded-full border border-slate-200", bg, p.imageBg === bg && "ring-2 ring-emerald-500 ring-offset-1")}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {localData.projects.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">No projects added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (sidebarTab === 'layers') {
      return (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-3 h-3 text-slate-400" />
            <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400">Customization Controls</div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-2.5">Template Selection</label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['editorial', 'minimalist'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => handleChange('template', t)}
                    className={cn(
                      "h-12 border rounded-lg flex items-center justify-center text-[10px] font-bold capitalize transition-all",
                      localData.template === t 
                        ? "border-slate-900 bg-white text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]" 
                        : "border-slate-200 bg-slate-50/50 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-2.5">Typography</label>
              <div className="relative">
                <select 
                  value={localData.font}
                  onChange={(e) => handleChange('font', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="serif-sans">Playfair Display + Inter</option>
                  <option value="mono">SF Pro Mono</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-2.5">Accent Color</label>
              <div className="flex gap-2.5">
                {(['emerald', 'indigo', 'rose', 'slate'] as const).map(color => (
                  <button
                    key={color}
                    onClick={() => handleChange('accentColor', color)}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                      accentColorMap[color],
                      localData.accentColor === color ? `ring-2 ring-offset-2 ring-[${color === 'slate' ? '#0f172a' : accentColorMap[color].split('-')[1]}] scale-110 shadow-sm` : "hover:scale-105"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100">
               <label className="text-[11px] font-semibold text-slate-700 block mb-3.5">Visible Sections</label>
               <div className="space-y-3">
                 {['projects', 'experience', 'education', 'skills'].map(section => {
                   const isHidden = localData.hiddenSections?.includes(section);
                   return (
                     <div key={section} className="flex items-center justify-between cursor-pointer" onClick={() => {
                        const hidden = localData.hiddenSections || [];
                        if (isHidden) {
                          handleChange('hiddenSections', hidden.filter((s: string) => s !== section));
                        } else {
                          handleChange('hiddenSections', [...hidden, section]);
                        }
                     }}>
                        <span className="text-[11px] capitalize text-slate-600">{section}</span>
                        <button 
                          className={cn(
                            "w-8 h-4 rounded-full relative transition-colors duration-300 pointer-events-none",
                            !isHidden ? "bg-emerald-500" : "bg-slate-200"
                          )}
                        >
                          <div className={cn(
                            "w-3 h-3 bg-white rounded-full absolute top-[1.5px] shadow-sm transition-transform duration-300",
                            !isHidden ? "translate-x-4" : "translate-x-0.5"
                          )} />
                        </button>
                     </div>
                   );
                 })}
               </div>
            </div>

            <div className="pt-5 border-t border-slate-100">
               <div className="flex items-center justify-between mb-3.5 cursor-pointer" onClick={() => handleChange('isPublished', !localData.isPublished)}>
                  <span className="text-[11px] font-semibold text-slate-600">Visibility (Public)</span>
                  <button 
                    className={cn(
                      "w-8 h-4 rounded-full relative transition-colors duration-300 pointer-events-none",
                      localData.isPublished ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 bg-white rounded-full absolute top-[1.5px] shadow-sm transition-transform duration-300",
                      localData.isPublished ? "translate-x-4" : "translate-x-0.5"
                    )} />
                  </button>
               </div>
               <div className="flex items-center justify-between cursor-pointer" onClick={() => handleChange('seoAutoIndex', !localData.seoAutoIndex)}>
                  <span className="text-[11px] font-semibold text-slate-600">SEO Auto-Index</span>
                  <button 
                    className={cn(
                      "w-8 h-4 rounded-full relative transition-colors duration-300 pointer-events-none",
                      localData.seoAutoIndex ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 bg-white rounded-full absolute top-[1.5px] shadow-sm transition-transform duration-300",
                      localData.seoAutoIndex ? "translate-x-4" : "translate-x-0.5"
                    )} />
                  </button>
               </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null; // fallback
  };

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] font-sans overflow-hidden text-slate-900">
      {/* Platform Navigation (Left Rail) */}
      <aside className="w-16 flex flex-col items-center py-6 bg-[#0F172A] text-white border-r border-slate-800 shrink-0">
        <img src="https://images.pexels.com/photos/37324423/pexels-photo-37324423.png" alt="Logo" className="w-8 h-8 mb-10 object-contain" referrerPolicy="no-referrer" />
        <div className="flex-1 flex flex-col gap-6">
          <button 
            onClick={() => setSidebarTab('dashboard')}
            className={cn("p-2 rounded-lg transition-colors", sidebarTab === 'dashboard' ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white")}
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSidebarTab('search')}
            className={cn("p-2 rounded-lg transition-colors", sidebarTab === 'search' ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white")}
          >
            <Database className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSidebarTab('layers')}
            className={cn("p-2 rounded-lg transition-colors", sidebarTab === 'layers' ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white")}
          >
            <Layers className="w-5 h-5" />
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

      {/* Editor Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-slate-900 truncate">
              {localData.name || 'Untitled'}'s Portfolio
            </h1>
            {localData.isPublished && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider hidden sm:flex items-center gap-1.5">
                <Link2 className="w-3 h-3" /> Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-md mr-1 sm:mr-4">
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
              "flex-1 overflow-y-auto bg-white custom-scrollbar",
              localData.font === 'mono' ? 'font-mono' : 'font-sans'
            )}>
              <div className="p-8 sm:p-12 min-h-full">
                <nav className="flex justify-between items-center mb-16 sm:mb-24">
                  <div className={cn(
                    "text-lg font-bold uppercase tracking-widest truncate max-w-[200px]",
                    localData.font === 'mono' ? '' : 'font-serif'
                  )}>
                    {localData.name || 'Your Name'}
                  </div>
                  {deviceMode === 'desktop' && (
                    <div className="space-x-8 text-[11px] font-medium text-slate-400 uppercase tracking-widest shrink-0">
                      <span className={cn("text-slate-900 border-b pb-1 font-bold", localData.accentColor !== 'slate' && `border-${localData.accentColor}-500 text-${localData.accentColor}-600`)}>
                        Work
                      </span>
                      <span className="hover:text-slate-600 transition-colors">About</span>
                      <span className="hover:text-slate-600 transition-colors">Contact</span>
                    </div>
                  )}
                  {deviceMode === 'mobile' && (
                    <button className="p-2"><Layers className="w-5 h-5 text-slate-800" /></button>
                  )}
                </nav>
                
                <div className={cn("max-w-xl", deviceMode === 'mobile' ? 'text-center mx-auto' : '')}>
                  <h2 className={cn(
                    "text-4xl sm:text-5xl font-medium leading-[1.1] text-slate-900 mb-6",
                    localData.font === 'mono' ? '' : 'font-serif tracking-tight'
                  )}>
                    {localData.bio || 'Enter your bio here...'}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 sm:mb-12 italic">
                    {localData.role || 'Your professional role'}
                  </p>
                  
                  {!localData.hiddenSections?.includes('projects') && (
                    <div className="mb-12 mt-16 sm:mt-24 border-t border-slate-100 pt-16 sm:pt-24">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Selected Works</h4>
                      <div className={cn(
                        "grid gap-6 sm:gap-8",
                        localData.template === 'minimalist' ? 'grid-cols-1' : (deviceMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')
                      )}>
                        {localData.projects?.map((p: any, index: number) => (
                          <div key={p.id || `project-${index}`} className="group cursor-pointer">
                            <div className={cn("aspect-[4/5] rounded-xl mb-4 overflow-hidden relative shadow-sm", p.imageBg || 'bg-slate-100')}>
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                              ) : (
                                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="bg-white/90 text-slate-900 text-xs font-semibold px-4 py-2 rounded-full shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    View Project
                                  </span>
                                </div>
                              )}
                            </div>
                            <h3 className={cn("font-medium text-slate-900 text-sm mb-1 line-clamp-1", localData.font === 'mono' ? '' : 'font-serif')}>
                              {p.title || 'Untitled Project'}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{p.description || 'Project description goes here.'}</p>
                          </div>
                        ))}
                        {(!localData.projects || localData.projects.length === 0) && (
                          <div className="col-span-full py-12 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 rounded-xl">
                            <Database className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm font-medium">No projects added</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!localData.hiddenSections?.includes('experience') && localData.experience?.length > 0 && (
                    <div className="mb-12 border-t border-slate-100 pt-16 sm:pt-24">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Experience</h4>
                      <div className="space-y-8">
                        {localData.experience.map((exp: any, index: number) => (
                          <div key={exp.id || `exp-${index}`} className="flex flex-col gap-1">
                            <h3 className="font-semibold text-sm text-slate-900">{exp.role} <span className="text-slate-400 font-normal ml-1">at {exp.company}</span></h3>
                            <p className="text-xs text-emerald-600 mb-2">{exp.startDate} – {exp.endDate}</p>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-lg">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-t border-slate-100 pt-16 sm:pt-24 pb-12">
                     {!localData.hiddenSections?.includes('education') && localData.education?.length > 0 && (
                       <div>
                         <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Education</h4>
                         <div className="space-y-6">
                           {localData.education.map((edu: any, index: number) => (
                             <div key={edu.id || `edu-${index}`}>
                               <h3 className="font-semibold text-sm text-slate-900">{edu.degree}</h3>
                               <p className="text-xs text-slate-500 mt-1">{edu.institution} <span className="text-slate-300 mx-2">&bull;</span> {edu.year}</p>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {!localData.hiddenSections?.includes('skills') && localData.skills?.length > 0 && (
                       <div>
                         <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Core Skills</h4>
                         <div className="flex flex-wrap gap-2">
                           {localData.skills.map((skill: string, index: number) => (
                             <span key={`${skill}-${index}`} className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-slate-200">
                               {skill}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Editor Settings (Right Sidebar) */}
      <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderRightPanel()}
        </div>
      </aside>
    </div>
  );
}
