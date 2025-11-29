
import React, { useState } from 'react';
import { EmailIntegrationSettings, UserProfile, TeamMember, Landlord } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import { 
    UserPlusIcon, PencilIcon, TrashIcon, AtSymbolIcon, CheckCircleIcon, 
    LockClosedIcon, BuildingOfficeIcon, ShieldCheckIcon, UserGroupIcon, KeyIcon,
    GlobeAltIcon, BanknotesIcon, ArrowPathIcon
} from '../icons/HeroIcons';

interface SettingsPageProps {
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  emailSettings: EmailIntegrationSettings | null;
  setEmailSettings: (settings: EmailIntegrationSettings) => void;
  teamMembers: TeamMember[];
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;
  landlords: Landlord[];
  updateLandlord: (l: Landlord) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  userProfile, updateUserProfile,
  emailSettings, setEmailSettings,
  teamMembers, addTeamMember, updateTeamMember, deleteTeamMember,
  landlords, updateLandlord
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'team' | 'portal' | 'banking' | 'security' | 'integrations' | 'portals'>('profile');
  
  // Profile State
  const [profileForm, setProfileForm] = useState(userProfile);
  
  // Team Modal State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Password State
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  // Integration State
  const [apiKey, setApiKey] = useState(emailSettings?.apiKey || '');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Portal State (Mock)
  const [rightmoveEnabled, setRightmoveEnabled] = useState(false);
  const [zooplaEnabled, setZooplaEnabled] = useState(false);

  // Banking State
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  // --- Handlers ---

  const handleProfileSave = () => {
      updateUserProfile(profileForm);
      alert('Profile updated successfully.');
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const memberData: TeamMember = {
          id: editingMember?.id || `tm_${Date.now()}`,
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          role: formData.get('role') as any,
          status: editingMember?.status || 'Invited',
          lastLogin: editingMember?.lastLogin
      };

      if (editingMember) updateTeamMember(memberData);
      else addTeamMember(memberData);
      
      setIsTeamModalOpen(false);
      setEditingMember(null);
  };

  const handleTogglePortalAccess = (landlord: Landlord) => {
      updateLandlord({ ...landlord, portalAccess: !landlord.portalAccess });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordForm.new !== passwordForm.confirm) {
          alert("New passwords do not match.");
          return;
      }
      alert("Password changed successfully.");
      setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleSaveEmailSettings = () => {
      setIsSavingEmail(true);
      setTimeout(() => {
          setEmailSettings({
              provider: 'sendgrid',
              apiKey,
              fromName: userProfile.companyName,
              fromEmail: userProfile.email,
              isActive: true
          });
          setIsSavingEmail(false);
          alert('Integration verified and saved.');
      }, 1000);
  };

  const handleConnectStripe = () => {
      setIsConnectingStripe(true);
      // Simulate OAuth Flow
      setTimeout(() => {
          updateUserProfile({ 
              ...userProfile, 
              stripeConnectId: 'acct_1234567890', 
              stripePayoutsEnabled: true,
              stripeDataFeedEnabled: true 
          });
          setIsConnectingStripe(false);
          alert("Stripe account connected successfully. Banking feeds active.");
      }, 2000);
  }

  // --- Sub-Components ---

  const TeamMemberModal = () => (
      <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title={editingMember ? 'Edit Team Member' : 'Add Team Member'}>
          <form onSubmit={handleTeamSubmit} className="space-y-4">
              <Input label="Full Name" name="name" defaultValue={editingMember?.name} required placeholder="e.g. Sarah Smith" />
              <Input label="Email Address" name="email" type="email" defaultValue={editingMember?.email} required placeholder="e.g. sarah@company.com" />
              <Select 
                label="Role" 
                name="role" 
                defaultValue={editingMember?.role || 'Property Manager'} 
                options={[
                    {value: 'Admin', label: 'Admin (Full Access)'},
                    {value: 'Property Manager', label: 'Property Manager'},
                    {value: 'Viewer', label: 'Viewer (Read Only)'},
                    {value: 'Maintenance', label: 'Maintenance Staff'}
                ]} 
              />
              <div className="flex justify-end pt-4">
                  <Button type="submit">{editingMember ? 'Save Changes' : 'Send Invite'}</Button>
              </div>
          </form>
      </Modal>
  );

  const tabs = [
      { id: 'profile', label: 'My Profile', icon: UserGroupIcon },
      { id: 'company', label: 'Company Details', icon: BuildingOfficeIcon },
      { id: 'team', label: 'Team Management', icon: UserPlusIcon },
      { id: 'portal', label: 'Client Portal', icon: ShieldCheckIcon },
      { id: 'banking', label: 'Banking & Payouts', icon: BanknotesIcon },
      { id: 'portals', label: 'Portals', icon: GlobeAltIcon },
      { id: 'security', label: 'Security', icon: LockClosedIcon },
      { id: 'integrations', label: 'Integrations', icon: AtSymbolIcon },
  ];

  return (
    <div className="animate-fade-in flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
              <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                  <h2 className="font-bold text-zinc-900">Settings</h2>
              </div>
              <nav className="flex flex-col p-2 space-y-1">
                  {tabs.map(tab => (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                              activeTab === tab.id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                          }`}
                      >
                          <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-zinc-300' : 'text-zinc-400'}`}/>
                          {tab.label}
                      </button>
                  ))}
              </nav>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
          <PageHeader title={tabs.find(t => t.id === activeTab)?.label || 'Settings'} subtitle="Manage your account and preferences." />

          {/* Profile Tab */}
          {activeTab === 'profile' && (
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm max-w-2xl">
                  <div className="flex items-center gap-6 mb-8">
                      <img src={profileForm.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-zinc-100 shadow-sm" />
                      <Button variant="outline" size="sm">Change Avatar</Button>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Full Name" name="name" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
                          <Input label="Job Title" name="title" placeholder="e.g. Senior Property Manager" />
                      </div>
                      <Input label="Email Address" name="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} />
                      <Input label="Phone Number" name="phone" value={profileForm.phone || ''} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                      <div className="pt-4 flex justify-end">
                          <Button onClick={handleProfileSave}>Save Profile</Button>
                      </div>
                  </div>
              </div>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm max-w-2xl">
                  <div className="space-y-4">
                      <Input label="Company Name" name="companyName" value={profileForm.companyName} onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})} />
                      <Input label="Registered Address" name="address" placeholder="123 High St, London" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Company Reg No." name="regNo" placeholder="Optional" />
                          <Input label="VAT Number" name="vat" placeholder="Optional" />
                      </div>
                      <div className="pt-4 flex justify-end">
                          <Button onClick={handleProfileSave}>Update Company Details</Button>
                      </div>
                  </div>
              </div>
          )}

          {/* Banking & Payouts Tab */}
          {activeTab === 'banking' && (
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm max-w-2xl">
                  <div className="mb-6">
                      <h3 className="text-lg font-semibold text-zinc-900">Stripe Connect Integration</h3>
                      <p className="text-sm text-zinc-500 mt-1">
                          Link your bank account to enable direct rent collection, automated payouts, and live financial data feeds via Stripe Treasury & Financial Connections.
                      </p>
                  </div>

                  {!userProfile.stripeConnectId ? (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 text-center">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                              <BanknotesIcon className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h4 className="font-bold text-indigo-900 mb-2">Get Paid Directly</h4>
                          <p className="text-sm text-indigo-700 mb-6 max-w-sm mx-auto">
                              Connect your existing bank account. Tenants pay rent via Doorap, and funds settle directly into your account. Plus, see your bank feed live in the dashboard.
                          </p>
                          <Button 
                            onClick={handleConnectStripe} 
                            isLoading={isConnectingStripe}
                            className="bg-[#635bff] hover:bg-[#5851e2] text-white border-none shadow-md"
                          >
                              Connect with Stripe
                          </Button>
                      </div>
                  ) : (
                      <div className="space-y-6">
                          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="p-2 bg-green-100 rounded-full mr-4">
                                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-green-900">Account Connected</h4>
                                  <p className="text-xs text-green-700">Stripe ID: {userProfile.stripeConnectId}</p>
                              </div>
                              <div className="ml-auto">
                                  <span className="px-3 py-1 bg-white text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm">Active</span>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50">
                                  <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Payouts</p>
                                  <p className="text-zinc-900 font-medium flex items-center">
                                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" /> Enabled
                                  </p>
                              </div>
                              <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50">
                                  <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Data Feed</p>
                                  <p className="text-zinc-900 font-medium flex items-center">
                                      <ArrowPathIcon className="w-4 h-4 text-blue-500 mr-2" /> Live Sync
                                  </p>
                              </div>
                          </div>

                          <div className="pt-4 border-t border-zinc-100">
                              <h4 className="font-semibold text-zinc-900 mb-3">Linked Bank Account</h4>
                              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-md">
                                  <div className="flex items-center">
                                      <div className="w-10 h-10 bg-zinc-100 rounded flex items-center justify-center mr-3 font-bold text-zinc-500 text-xs">BANK</div>
                                      <div>
                                          <p className="text-sm font-medium text-zinc-900">Barclays Business</p>
                                          <p className="text-xs text-zinc-500">**** 4492</p>
                                      </div>
                                  </div>
                                  <Button size="sm" variant="outline">Update</Button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
              <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                      <h3 className="font-semibold text-zinc-900">Team Members</h3>
                      <Button size="sm" onClick={() => { setEditingMember(null); setIsTeamModalOpen(true); }} leftIcon={<UserPlusIcon className="w-4 h-4"/>}>Invite Member</Button>
                  </div>
                  <div className="divide-y divide-zinc-100">
                      {teamMembers.map(member => (
                          <div key={member.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                      {member.name.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="font-medium text-zinc-900">{member.name}</p>
                                      <p className="text-xs text-zinc-500">{member.email} • {member.role}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {member.status}
                                  </span>
                                  <div className="flex gap-2">
                                      <button onClick={() => { setEditingMember(member); setIsTeamModalOpen(true); }} className="text-zinc-400 hover:text-zinc-600"><PencilIcon className="w-4 h-4"/></button>
                                      <button onClick={() => deleteTeamMember(member.id)} className="text-zinc-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Portal Access Tab */}
          {activeTab === 'portal' && (
              <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                      <h3 className="font-semibold text-zinc-900">Landlord Portal Access</h3>
                      <p className="text-xs text-zinc-500">Control which clients can log in to view their portfolio.</p>
                  </div>
                  <div className="divide-y divide-zinc-100">
                      {landlords.map(landlord => (
                          <div key={landlord.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                              <div>
                                  <p className="font-medium text-zinc-900">{landlord.name}</p>
                                  <p className="text-xs text-zinc-500">{landlord.email}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                  <span className={`text-xs ${landlord.portalAccess ? 'text-green-600' : 'text-zinc-400'}`}>
                                      {landlord.portalAccess ? 'Access Enabled' : 'Access Disabled'}
                                  </span>
                                  <button 
                                      onClick={() => handleTogglePortalAccess(landlord)}
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${landlord.portalAccess ? 'bg-green-600' : 'bg-zinc-200'}`}
                                  >
                                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${landlord.portalAccess ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Portals Configuration Tab */}
          {activeTab === 'portals' && (
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm max-w-2xl">
                  <div className="mb-6 border-b border-zinc-100 pb-4">
                      <h3 className="text-lg font-semibold text-zinc-900">Portal Syndication</h3>
                      <p className="text-sm text-zinc-500">Configure automated feeds to Rightmove, Zoopla, and OnTheMarket.</p>
                  </div>

                  {/* Rightmove */}
                  <div className="mb-8 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                      <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                              <div className="w-8 h-8 bg-white rounded border border-zinc-200 flex items-center justify-center mr-3 font-bold text-zinc-800 text-xs">RM</div>
                              <h4 className="font-bold text-zinc-900">Rightmove</h4>
                          </div>
                          <button 
                              onClick={() => setRightmoveEnabled(!rightmoveEnabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${rightmoveEnabled ? 'bg-green-600' : 'bg-zinc-200'}`}
                          >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rightmoveEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>
                      {rightmoveEnabled && (
                          <div className="space-y-3 animate-fade-in">
                              <Input label="Branch ID" name="rm_branch" placeholder="e.g. 12345" />
                              <Input label="Certificate / Network ID" name="rm_cert" type="password" placeholder="••••••••" />
                              <div className="flex justify-end"><Button size="sm" variant="outline">Verify Connection</Button></div>
                          </div>
                      )}
                  </div>

                  {/* Zoopla */}
                  <div className="mb-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                      <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                              <div className="w-8 h-8 bg-purple-800 rounded border border-zinc-200 flex items-center justify-center mr-3 font-bold text-white text-xs">Z</div>
                              <h4 className="font-bold text-zinc-900">Zoopla</h4>
                          </div>
                          <button 
                              onClick={() => setZooplaEnabled(!zooplaEnabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${zooplaEnabled ? 'bg-green-600' : 'bg-zinc-200'}`}
                          >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${zooplaEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>
                      {zooplaEnabled && (
                          <div className="space-y-3 animate-fade-in">
                              <Input label="Branch Reference" name="zoo_branch" placeholder="e.g. ZP9921" />
                              <Input label="Real-time Data Feed (RTDF) Key" name="zoo_key" type="password" placeholder="••••••••" />
                              <div className="flex justify-end"><Button size="sm" variant="outline">Verify Connection</Button></div>
                          </div>
                      )}
                  </div>
                  
                  <div className="flex justify-end pt-4">
                      <Button onClick={() => alert("Settings Saved")}>Save Portal Settings</Button>
                  </div>
              </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm max-w-xl">
                  <h3 className="text-lg font-medium text-zinc-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                      <Input 
                        label="Current Password" 
                        type="password" 
                        name="current" 
                        value={passwordForm.current} 
                        onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} 
                        required 
                      />
                      <Input 
                        label="New Password" 
                        type="password" 
                        name="new" 
                        value={passwordForm.new} 
                        onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} 
                        required 
                      />
                      <Input 
                        label="Confirm New Password" 
                        type="password" 
                        name="confirm" 
                        value={passwordForm.confirm} 
                        onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} 
                        required 
                      />
                      <div className="pt-2 flex justify-end">
                          <Button type="submit" leftIcon={<KeyIcon className="w-4 h-4"/>}>Update Password</Button>
                      </div>
                  </form>
                  
                  <div className="mt-8 pt-6 border-t border-zinc-100">
                      <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                      <p className="text-sm text-zinc-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                      <Button variant="danger">Delete Account</Button>
                  </div>
              </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm max-w-2xl">
                  <div className="flex items-center justify-between mb-6">
                      <div>
                          <h3 className="text-lg font-semibold text-zinc-900">SendGrid Email Integration</h3>
                          <p className="text-sm text-zinc-500">Enable bulk emails and automated notifications.</p>
                      </div>
                      {emailSettings?.isActive && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center"><CheckCircleIcon className="w-3 h-3 mr-1"/> Connected</span>}
                  </div>
                  <div className="space-y-4">
                      <Input 
                        label="API Key" 
                        name="apiKey"
                        type="password" 
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)} 
                        placeholder="SG.xxxxxxxx" 
                      />
                      <div className="flex justify-end">
                          <Button onClick={handleSaveEmailSettings} isLoading={isSavingEmail}>
                              {emailSettings?.isActive ? 'Update Configuration' : 'Connect'}
                          </Button>
                      </div>
                  </div>
              </div>
          )}
      </div>

      <TeamMemberModal />
    </div>
  );
};

export default SettingsPage;
