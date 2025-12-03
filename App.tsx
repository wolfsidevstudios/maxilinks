
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Heart, Clock, LayoutGrid, CheckCircle, Lock, Fingerprint, Shield, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';
import { LinkItem, ShareTargetParams, Tab } from './types';
import * as storageService from './services/storage';
import * as authService from './services/auth';
import { LinkCard } from './components/LinkCard';
import { Sheet } from './components/Sheet';
import { AddLinkForm } from './components/AddLinkForm';
import { LinkDetailSheet } from './components/LinkDetailSheet';
import { Button } from './components/Button';
import { BottomNav } from './components/BottomNav';

const getShareParams = (): ShareTargetParams => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    title: params.get('title') || undefined,
    text: params.get('text') || undefined,
    url: params.get('url') || undefined,
  };
};

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [shareParams, setShareParams] = useState<ShareTargetParams>({});
  
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auth State
  const [isLocked, setIsLocked] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Check auth requirement on mount
    const requiresAuth = authService.isBiometricEnabled();
    setBiometricEnabled(requiresAuth);
    if (requiresAuth) {
        setIsLocked(true);
    }

    setLinks(storageService.getLinks());

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const incomingShare = getShareParams();
    if (incomingShare.url || incomingShare.text) {
      let finalUrl = incomingShare.url;
      if (!finalUrl && incomingShare.text && incomingShare.text.startsWith('http')) {
        finalUrl = incomingShare.text;
      }
      if (finalUrl) {
        setShareParams({ ...incomingShare, url: finalUrl });
        setIsAddSheetOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleUnlock = async () => {
      setAuthError('');
      const success = await authService.authenticate();
      if (success) {
          setIsLocked(false);
      } else {
          setAuthError('Authentication failed. Please try again.');
      }
  };

  const handleEnableBiometric = async () => {
      try {
          await authService.enableBiometric();
          setBiometricEnabled(true);
          alert("App lock enabled! You will need to authenticate next time you open the app.");
      } catch (e: any) {
          alert(e.message || "Could not set up biometrics.");
      }
  };

  const handleDisableBiometric = () => {
      if(window.confirm("Disable biometric lock?")) {
        authService.disableBiometric();
        setBiometricEnabled(false);
      }
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        setDeferredPrompt(null);
      });
    }
  };

  const handleSaveLink = (data: { url: string; title: string; description: string; tags: string[]; enriched: boolean; icon: string; color: string }) => {
    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      url: data.url,
      title: data.title,
      description: data.description,
      tags: data.tags,
      aiEnriched: data.enriched,
      icon: data.icon,
      color: data.color,
      isFavorite: false,
      isRead: false,
      createdAt: Date.now()
    };
    const updated = storageService.saveLink(newLink);
    setLinks(updated);
    setIsAddSheetOpen(false);
    setShareParams({}); 
    setActiveTab('home'); 
  };

  const handleUpdateLink = (updatedLink: LinkItem) => {
      const updated = storageService.updateLink(updatedLink);
      setLinks(updated);
      setSelectedLink(updatedLink); 
  };

  const handleDeleteLink = (id: string) => {
      const updated = storageService.deleteLink(id);
      setLinks(updated);
      setSelectedLink(null); 
  };

  const handleSearchFocus = () => {
    setActiveTab('links');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  };

  // --- Lock Screen ---
  if (isLocked) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6">
                  <Lock size={40} className="text-slate-900" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">LinkVault Locked</h1>
              <p className="text-slate-500 mb-8 max-w-xs">Authentication is required to access your links.</p>
              
              <Button onClick={handleUnlock} className="w-full max-w-xs py-4 !rounded-2xl !text-lg flex items-center justify-center gap-2">
                  <Fingerprint /> Unlock with Biometrics
              </Button>
              
              {authError && (
                  <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-medium">
                      <AlertCircle size={16} />
                      {authError}
                  </div>
              )}
          </div>
      );
  }

  // --- Views ---

  const HomeView = () => {
    // Recent 5 links
    const recents = [...links].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Links</h1>
                <div className="w-12 h-12" /> {/* Spacer for balance if needed, or removing Plus button since it's in nav now */}
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setActiveTab('favorites')}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all text-left group"
                >
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        <Heart size={20} fill="currentColor" />
                    </div>
                    <div>
                        <span className="block font-bold text-slate-900">Favorites</span>
                        <span className="text-xs text-slate-500 font-medium">{links.filter(l => l.isFavorite).length} items</span>
                    </div>
                </button>

                <button 
                    onClick={() => setActiveTab('links')}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all text-left group"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        <Clock size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-slate-900">Recent</span>
                        <span className="text-xs text-slate-500 font-medium">View all</span>
                    </div>
                </button>

                <button 
                    onClick={() => setActiveTab('links')} 
                    className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all text-left group"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        <div className="w-4 h-4 rounded-full border-2 border-white/40" />
                    </div>
                    <div>
                        <span className="block font-bold text-slate-900">Unread</span>
                        <span className="text-xs text-slate-500 font-medium">{links.filter(l => !l.isRead).length} items</span>
                    </div>
                </button>

                <button 
                     onClick={() => setActiveTab('links')}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all text-left group"
                >
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        <LayoutGrid size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-slate-900">All</span>
                        <span className="text-xs text-slate-500 font-medium">{links.length} items</span>
                    </div>
                </button>
            </div>

            {/* Recents List */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 px-1">Recientes</h3>
                <div className="space-y-3">
                    {recents.length === 0 ? (
                        <p className="text-slate-400 text-center py-4 text-sm">No recent links saved.</p>
                    ) : (
                        recents.map(link => (
                            <LinkCard key={link.id} item={link} onClick={setSelectedLink} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
  };

  const LinksView = () => {
    // Filter logic
    let displayed = links;
    if (activeTab === 'favorites') {
        displayed = displayed.filter(l => l.isFavorite);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      displayed = displayed.filter(link => 
        link.title.toLowerCase().includes(q) ||
        link.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    return (
        <div className="space-y-4 pt-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                {activeTab === 'favorites' ? 'Favorites' : 'All Links'}
            </h1>
            
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 z-10">
                    <Search size={18} />
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-full focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-transparent outline-none transition-all shadow-sm placeholder-slate-500 text-slate-900"
                />
            </div>

            <div className="space-y-3 pb-24">
                {displayed.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <p>No links found.</p>
                    </div>
                ) : (
                    displayed.map(link => (
                        <LinkCard key={link.id} item={link} onClick={setSelectedLink} />
                    ))
                )}
            </div>
        </div>
    );
  };

  const SettingsView = () => (
    <div className="space-y-6 pt-2 pb-24">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">Settings</h1>
      
      {/* App Install Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
           {deferredPrompt ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Install App</p>
                <p className="text-xs text-slate-500">Enable share target & offline access</p>
              </div>
              <Button onClick={handleInstallClick} variant="primary" className="!rounded-xl !py-2 !px-4 !text-sm">Install</Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-green-600">
               <CheckCircle size={20} />
               <span className="font-medium">App Installed</span>
            </div>
          )}
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Shield size={18} className="text-slate-400" /> Security
          </h4>
          <div className="flex items-center justify-between">
              <div>
                  <p className="font-medium text-slate-900">Biometric Lock</p>
                  <p className="text-xs text-slate-500">Require FaceID/TouchID to open</p>
              </div>
              <div className="flex items-center">
                   {biometricEnabled ? (
                       <Button onClick={handleDisableBiometric} variant="secondary" className="!py-2 !px-3 !text-xs text-red-600 border-red-100 bg-red-50">Disable</Button>
                   ) : (
                       <Button onClick={handleEnableBiometric} variant="secondary" className="!py-2 !px-3 !text-xs text-green-600 border-green-100 bg-green-50">Enable</Button>
                   )}
              </div>
          </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 mb-1">About</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              LinkVault v2.1 <br/>
              Organize your digital life with AI.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
             <h5 className="font-bold text-xs uppercase text-slate-400 mb-2">Desktop Tip</h5>
             <p className="text-xs text-slate-600">
                 To save links from your desktop browser, install the app or use the "Paste from Clipboard" button in the Add menu.
             </p>
          </div>
      </div>

      <Button 
          variant="secondary" 
          fullWidth 
          className="!text-red-600 !border-red-100 hover:!bg-red-50 !rounded-2xl"
          onClick={() => {
            if(window.confirm("Delete all data? This cannot be undone.")) {
              localStorage.clear();
              setLinks([]);
              window.location.reload();
            }
          }}
        >
          <Trash2 size={18} className="mr-2" />
          Clear All Data
        </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-5 py-6 min-h-screen">
        {activeTab === 'home' && <HomeView />}
        {(activeTab === 'links' || activeTab === 'favorites') && <LinksView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSearchClick={handleSearchFocus}
        onAddClick={() => {
            setShareParams({});
            setIsAddSheetOpen(true);
        }}
      />

      {/* Add Link Sheet */}
      <Sheet 
        isOpen={isAddSheetOpen} 
        onClose={() => setIsAddSheetOpen(false)} 
        title={shareParams.url ? "Save Shared Link" : "New Link"}
      >
        <AddLinkForm 
          initialUrl={shareParams.url}
          initialTitle={shareParams.title}
          onSave={handleSaveLink}
          onCancel={() => setIsAddSheetOpen(false)}
        />
      </Sheet>

       {/* Link Detail Sheet */}
       <Sheet 
        isOpen={!!selectedLink} 
        onClose={() => setSelectedLink(null)} 
        className="!h-[85vh]" // Make it tall
      >
        {selectedLink && (
            <LinkDetailSheet 
                link={selectedLink}
                onUpdate={handleUpdateLink}
                onDelete={handleDeleteLink}
                onClose={() => setSelectedLink(null)}
            />
        )}
      </Sheet>

    </div>
  );
}
