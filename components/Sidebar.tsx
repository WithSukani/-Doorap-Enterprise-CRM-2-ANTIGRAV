
import React from 'react';
import { supabase } from '../src/lib/supabase';
import { UserProfile, Notification as NotificationData } from '../types';
import { HomeIcon, BuildingOffice2Icon, UsersIcon, WrenchScrewdriverIcon, BellAlertIcon, DocumentCheckIcon, CreditCardIcon, ArrowLeftOnRectangleIcon, XMarkIcon, BanknotesIcon, ListBulletIcon, CalendarDaysIcon, MegaphoneIcon, ShieldCheckIcon, Cog6ToothIcon, UserGroupIcon, IconProps, ClipboardDocumentListIcon, ArchiveBoxIcon, ChatBubbleLeftRightIcon, DoriIcon } from './icons/HeroIcons';
import NotificationBell from './features/NotificationBell';

interface NavItemProps {
  icon: React.ReactElement<IconProps>;
  label: string;
  view: string;
  currentView: string;
  onClick: (view: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, view, currentView, onClick }) => {
  const isActive = currentView === view;
  return (
    <li
      className={`flex items-center px-3 py-2 my-1 mx-2 rounded-md cursor-pointer transition-all duration-200 group text-sm font-medium
        ${isActive
          ? 'bg-zinc-100 text-zinc-900'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
        }`}
      onClick={() => onClick(view)}
      aria-current={isActive ? 'page' : undefined}
    >
      {React.cloneElement(icon, { className: `w-5 h-5 mr-3 transition-colors ${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}` })}
      <span>{label}</span>
    </li>
  );
};

const SimpleLogo = () => (
  <div className="flex items-center gap-3 px-2">
    <img
      src="https://raw.githubusercontent.com/WithSukani/DoorapLogo/4410b95b0d102d0b556e4ec9e42200a697751202/Black%20.png"
      alt="Doorap Logo"
      className="h-8 w-auto object-contain"
    />
  </div>
);

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSubscriptionModal: () => void;
  userProfile: UserProfile;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView, onNavigate, onOpenSubscriptionModal, userProfile, isOpen, setIsOpen
}) => {
  const navItems = [
    { icon: <HomeIcon />, label: 'Dashboard', view: 'dashboard' },
    { icon: <DoriIcon />, label: 'Dori', view: 'dori' },
    { icon: <ChatBubbleLeftRightIcon />, label: 'Messages', view: 'messages' },
    { icon: <BuildingOffice2Icon />, label: 'Properties', view: 'properties' },
    { icon: <UsersIcon />, label: 'Tenants', view: 'tenants' },
    { icon: <UserGroupIcon />, label: 'Landlords', view: 'landlords' },
    { icon: <WrenchScrewdriverIcon />, label: 'Maintenance', view: 'maintenance' },
    { icon: <BanknotesIcon />, label: 'Financials', view: 'financials' },
    { icon: <ClipboardDocumentListIcon />, label: 'Workflow', view: 'workflow' },
    { icon: <ArchiveBoxIcon />, label: 'Documents', view: 'documents' },
    { icon: <CalendarDaysIcon />, label: 'Calendar', view: 'calendar' },
    { icon: <MegaphoneIcon />, label: 'Vacancies', view: 'vacancies' },
    { icon: <Cog6ToothIcon />, label: 'Settings', view: 'settings' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 transform ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'} 
                       lg:translate-x-0 transition-transform duration-300 ease-in-out 
                       w-64 bg-white border-r border-zinc-200 flex flex-col z-40 h-screen`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-100">
          <SimpleLogo />
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-900 p-1 rounded-md hover:bg-zinc-50"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="px-2 py-4">
          <div className="flex items-center gap-3 p-2 rounded-lg border border-transparent hover:bg-zinc-50 hover:border-zinc-200 transition-all cursor-default mx-2 mb-2">
            <img
              src={userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${userProfile.name.replace(' ', '+')}&background=18181b&color=fff`}
              alt={userProfile.name}
              className="w-8 h-8 rounded-md bg-zinc-200 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{userProfile.name}</p>
              <p className="text-xs text-zinc-500 truncate">{userProfile.companyName}</p>
            </div>
            <div className="hidden lg:block">
              <NotificationBell />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <ul className="space-y-0.5">
            {navItems.filter(item => {
              if (item.view === 'landlords') {
                // Hide Landlords page ONLY if user is explicitly Self Managing AND has no company name
                // If they have a Company Name, we assume they are acting as a company even if role says 'self_managing'
                return userProfile.role === 'company' || !!userProfile.companyName || !userProfile.role;
              }
              return true;
            }).map(item => (
              <NavItem key={item.view} {...item} icon={item.icon} currentView={currentView} onClick={onNavigate} />
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-zinc-200 space-y-1">
          <button
            onClick={onOpenSubscriptionModal}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-md transition-colors"
          >
            <CreditCardIcon className="w-5 h-5 mr-3 text-zinc-400" />
            Subscription
          </button>
          <button
            onClick={async () => {
              try {
                // Clear local storage to prevent data leakage between sessions
                localStorage.clear();
                const { error } = await supabase.auth.signOut();
                if (error) alert('Error logging out: ' + error.message);
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3 text-zinc-400 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;