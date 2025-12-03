
import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, Clock, LayoutGrid, CheckCircle, Lock, Fingerprint, Shield, AlertCircle, Trash2 } from 'lucide-react';
import { LinkItem, ShareTargetParams, Tab } from './types';
import * as storageService from './services/storage';
import * as authService from './services/auth';
import { LinkCard } from './components/LinkCard';
import { Sheet } from './components/Sheet';
import { AddLinkForm } from './components/AddLinkForm';
import { LinkDetailSheet } from './components/LinkDetailSheet';
import { Button } from './components/Button';
import { BottomNav } from './components/BottomNav';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';

const getShareParams = (): ShareTargetParams => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    title: params.get('title') || undefined,
    text: params.get('text') || undefined,
    url: params.get('url') || undefined,
  };
};

// Helper to determine active tab from URL path
const getTabFromPath = (): Tab => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname;
  if (path === '/links') return 'links';
  if (path === '/favorites') return 'favorites';
  if (path === '/settings') return 'settings';
  return 'home';
};

// --- Sub-Components (Views) ---

interface HomeViewProps {
  links: LinkItem[];
  setActiveTab: (tab: Tab) => void;
  setSelectedLink: (link: LinkItem) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ links, setActiveTab, setSelectedLink }) => {
  // Recent 5 links
  const recents = [...links].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  return (
      <div className="space-y-6 pt-2 pb-20 md:pb-6">
          <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Home</h1>
              {/* Spacer for TopNav on Desktop */}
              <div className="hidden md:block w-12 h-12" /> 
          </div>

          {/* Dashboard Grid - Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                  onClick={() => setActiveTab('favorites')}
                  className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all text-left group"
              >
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-red-200 shadow-lg">
                      <Heart size={20} fill="currentColor" />
                  </div>
                  <div className="min-w-0">
                      <span className="block font-bold text-slate-900 truncate">Favorites</span>
                      <span className="text-xs text-slate-500 font-medium">{links.filter(l => l.isFavorite).length} items</span>
                  </div>
              </button>

              <button 
                  onClick={() => setActiveTab('links')}
                  className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all text-left group"
              >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-blue-200 shadow-lg">
                      <Clock size={20} />
                  </div>
                  <div className="min-w-0">
                      <span className="block font-bold text-slate-900 truncate">Recent</span>
                      <span className="text-xs text-slate-500 font-medium">View all</span>
                  </div>
              </button>

              <button 
                  onClick={() => setActiveTab('links')} 
                  className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all text-left group"
              >
                  <div className="w-10 h-10 rounded-full bg-slate-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-slate-200 shadow-lg">
                      <div className="w-4 h-4 rounded-full border-2 border-white/40" />
                  </div>
                  <div className="min-w-0">
                      <span className="block font-bold text-slate-900 truncate">Unread</span>
                      <span className="text-xs text-slate-500 font-medium">{links.filter(l => !l.isRead).length} items</span>
                  </div>
              </button>

              <button 
                   onClick={() => setActiveTab('links')}
                  className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-all text-left group"
              >
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-purple-200 shadow-lg">
                      <LayoutGrid size={20} />
                  </div>
                  <div className="min-w-0">
                      <span className="block font-bold text-slate-900 truncate">All</span>
                      <span className="text-xs text-slate-500 font-medium">{links.length} items</span>
                  </div>
              </button>
          </div>

          {/* Recents List */}
          <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 px-1">Recientes</h3>
              {/* Grid on tablet/desktop */}
              <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                  {recents.length === 0 ? (
                      <div className="col-span-full text-slate-400 text-center py-4 text-sm">No recent links saved.</div>
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

interface LinksViewProps {
  links: LinkItem[];
  activeTab: Tab;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSelectedLink: (link: LinkItem) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const LinksView: React.FC<LinksViewProps> = ({ links, activeTab, searchQuery, setSearchQuery, setSelectedLink, searchInputRef }) => {
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
      <div className="space-y-4 pt-2 pb-24 md:pb-6">
          <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  {activeTab === 'favorites' ? 'Favorites' : 'All Links'}
              </h1>
          </div>
          
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

          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {displayed.length === 0 ? (
                  <div className="col-span-full text-center py-10 opacity-50">
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

interface SettingsViewProps {
  deferredPrompt: any;
  handleInstallClick: () => void;
  biometricEnabled: boolean;
  handleEnableBiometric: () => void;
  handleDisableBiometric: () => void;
  clearAllData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  deferredPrompt, 
  handleInstallClick, 
  biometricEnabled, 
  handleEnableBiometric, 
  handleDisableBiometric,
  clearAllData
}) => (
  <div className="space-y-6 pt-2 pb-24 md:pb-6 max-w-2xl mx-auto">
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
        onClick={clearAllData}
      >
        <Trash2 size={18} className="mr-2" />
        Clear All Data
      </Button>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [shareParams, setShareParams] = useState<ShareTargetParams>({});
  
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromPath);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auth State
  const [isLocked, setIsLocked] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [authError, setAuthError] = useState('');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
        const tab = getTabFromPath();
        setActiveTab(tab);
        // Update document title for history nav
        const titles: Record<Tab, string> = {
            home: 'LinkVault - Home',
            links: 'LinkVault - All Links',
            favorites: 'LinkVault - Favorites',
            settings: 'LinkVault - Settings'
        };
        document.title = titles[tab] || 'LinkVault';
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL and State when Tab Changes
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const titles: Record<Tab, string> = {
        home: 'LinkVault - Home',
        links: 'LinkVault - All Links',
        favorites: 'LinkVault - Favorites',
        settings: 'LinkVault - Settings'
    };
    document.title = titles[tab] || 'LinkVault';

    let path = '/';
    if (tab === 'links') path = '/links';
    if (tab === 'favorites') path = '/favorites';
    if (tab === 'settings') path = '/settings';

    // Only push if different to prevent duplicate history entries
    if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
    }
  };

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

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            handleTabChange('links');
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    handleTabChange('home'); 
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
    handleTabChange('links');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  };

  const clearAllData = () => {
    if(window.confirm("Delete all data? This cannot be undone.")) {
      localStorage.clear();
      setLinks([]);
      window.location.reload();
    }
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-colors duration-300">
      
      {/* Floating Sidebar */}
      <Sidebar 
         isOpen={isSidebarOpen} 
         onClose={() => setIsSidebarOpen(false)}
         activeTab={activeTab}
         onTabChange={(tab) => {
             handleTabChange(tab);
         }}
         linksCount={links.length}
         favoritesCount={links.filter(l => l.isFavorite).length}
         unreadCount={links.filter(l => !l.isRead).length}
      />

      {/* Main Content Area */}
      <main className={`
          mx-auto px-5 py-6 min-h-screen transition-all duration-300
          md:max-w-4xl lg:max-w-6xl
          ${isSidebarOpen ? 'md:pl-80' : ''} 
          /* On desktop, if sidebar is closed, content centers. If open, pushed right. */
      `}>
        
        {/* Spacer for Top Nav on desktop */}
        <div className="hidden md:block h-16" />

        {activeTab === 'home' && (
            <HomeView 
                links={links} 
                setActiveTab={handleTabChange} 
                setSelectedLink={setSelectedLink} 
            />
        )}
        {(activeTab === 'links' || activeTab === 'favorites') && (
            <LinksView 
                links={links} 
                activeTab={activeTab} 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                setSelectedLink={setSelectedLink}
                searchInputRef={searchInputRef}
            />
        )}
        {activeTab === 'settings' && (
            <SettingsView 
                deferredPrompt={deferredPrompt}
                handleInstallClick={handleInstallClick}
                biometricEnabled={biometricEnabled}
                handleEnableBiometric={handleEnableBiometric}
                handleDisableBiometric={handleDisableBiometric}
                clearAllData={clearAllData}
            />
        )}
      </main>

      {/* Navigation Systems */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => {
            handleTabChange(tab);
        }}
        onSearchClick={handleSearchFocus}
        onAddClick={() => {
            setShareParams({});
            setIsAddSheetOpen(true);
        }}
      />

      <TopNav 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onAddClick={() => {
            setShareParams({});
            setIsAddSheetOpen(true);
        }}
        onSearchClick={handleSearchFocus}
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
        className="!h-[85vh] md:!h-[90vh] md:!w-[600px] md:!mx-auto md:!right-0 md:!left-auto md:!rounded-t-2xl md:!rounded-l-2xl md:!mr-4"
        // Custom styling to make the sheet act more like a side-drawer on Desktop if needed, or keeping standard sheet
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
