
import React, { useState, useMemo } from 'react';
import { Vacancy, Applicant, Property, CommunicationLog, VacancyStatus, ApplicantStatus, PortalStatus } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import VacancyForm from '../forms/VacancyForm';
import ApplicantForm from '../forms/ApplicantForm';
import Modal from '../common/Modal';
import CommunicationLogSection from '../features/CommunicationLogSection';
import { PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon, UsersIcon, MegaphoneIcon, GlobeAltIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon, MapPinIcon, UserPlusIcon } from '../icons/HeroIcons';

interface VacancyCardProps {
  vacancy: Vacancy;
  property?: Property;
  applicantCount: number;
  onEdit: (vacancy: Vacancy) => void;
  onDelete: (vacancyId: string) => void;
  onViewDetails: (vacancy: Vacancy) => void;
  onSyncPortals: (vacancy: Vacancy) => void;
  onAddApplicant: (vacancy: Vacancy) => void;
}

const PortalBadge = ({ name, status, compact = false }: { name: string, status?: string, compact?: boolean }) => {
    const getStatusColor = (s?: string) => {
        switch(s) {
            case 'Live': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Error': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-zinc-100 text-zinc-400 border-zinc-200 opacity-60';
        }
    }
    
    return (
        <div className={`flex items-center rounded-md border ${getStatusColor(status)} ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'}`}>
            {!compact && <GlobeAltIcon className="w-3 h-3 mr-1"/>}
            <span className="font-medium">{name}{!compact && `: ${status || 'Off'}`}</span>
        </div>
    )
}

const VacancyCard: React.FC<VacancyCardProps> = ({ vacancy, property, applicantCount, onEdit, onDelete, onViewDetails, onSyncPortals, onAddApplicant }) => {
  return (
    <div className="group bg-white rounded-lg border border-zinc-200 overflow-hidden flex flex-col h-full hover:border-zinc-300 transition-colors">
      {/* Image Header */}
      <div className="relative h-48 bg-zinc-100 overflow-hidden border-b border-zinc-100">
        <img 
            src={property?.imageUrl || 'https://picsum.photos/600/400'} 
            alt={vacancy.listingTitle} 
            className="w-full h-full object-cover opacity-95" 
        />
        <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md shadow-sm border backdrop-blur ${
                vacancy.status === 'Available' ? 'bg-green-100/90 text-green-800 border-green-200' : 'bg-zinc-100/90 text-zinc-600 border-zinc-200'
            }`}>
                {vacancy.status}
            </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-zinc-900 line-clamp-1 mb-1" title={vacancy.listingTitle}>{vacancy.listingTitle}</h3>
        <div className="flex items-center text-sm text-zinc-500 mb-4">
            <MapPinIcon className="w-4 h-4 mr-1.5 text-zinc-400"/>
            {property ? property.address : 'Unassigned Property'}
        </div>
        
        <div className="space-y-3 mb-6 flex-1">
            <div className="flex justify-between items-center text-sm border-b border-zinc-50 pb-2">
                <span className="text-zinc-500">Rent</span>
                <span className="font-medium text-zinc-900">£{vacancy.rentAmount.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-zinc-50 pb-2">
                <span className="text-zinc-500">Applicants</span>
                <span className="font-medium text-zinc-900 flex items-center">
                    <UsersIcon className="w-3.5 h-3.5 mr-1.5 text-zinc-400"/> {applicantCount}
                </span>
            </div>
            
            {/* Portal Status Section */}
            <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Portals</span>
                    <button onClick={(e) => { e.stopPropagation(); onSyncPortals(vacancy); }} className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center transition-colors">
                        <ArrowPathIcon className="w-3 h-3 mr-1"/> Sync
                    </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <PortalBadge name="RM" status={vacancy.portalStatus?.rightmove} compact />
                    <PortalBadge name="Z" status={vacancy.portalStatus?.zoopla} compact />
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 mt-auto">
          <Button size="sm" variant="secondary" onClick={() => onViewDetails(vacancy)} className="flex-1 justify-center">Details</Button>
          <Button size="sm" variant="outline" onClick={() => onAddApplicant(vacancy)} className="px-2.5 text-zinc-600 hover:text-indigo-600 hover:border-indigo-200" title="Add Applicant"><UserPlusIcon className="w-4 h-4"/></Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(vacancy)} className="px-2.5"><PencilIcon className="w-4 h-4"/></Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(vacancy.id)} className="text-red-600 hover:text-red-700 hover:border-red-200 px-2.5"><TrashIcon className="w-4 h-4"/></Button>
        </div>
      </div>
    </div>
  );
};

interface VacancyDetailsModalProps {
  vacancy: Vacancy | null;
  property?: Property;
  applicants: Applicant[];
  onClose: () => void;
  onAddApplicant: (vacancyId: string) => void;
  onEditApplicant: (applicant: Applicant) => void;
  onDeleteApplicant: (applicantId: string) => void;
  communicationLogs: CommunicationLog[];
  addCommunicationLog: (log: CommunicationLog) => void;
  deleteCommunicationLog: (logId: string) => void;
}

const VacancyDetailsModal: React.FC<VacancyDetailsModalProps> = ({ 
    vacancy, property, applicants, onClose, 
    onAddApplicant, onEditApplicant, onDeleteApplicant,
    communicationLogs, addCommunicationLog, deleteCommunicationLog
 }) => {
  if (!vacancy) return null;
  const relevantApplicants = applicants.filter(a => a.vacancyId === vacancy.id);

  return (
    <Modal isOpen={!!vacancy} onClose={onClose} title={`Vacancy: ${vacancy.listingTitle}`} size="xl">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                {property && <p className="text-sm text-zinc-600">{property.address}, {property.postcode}</p>}
                <p className="font-bold text-2xl text-zinc-900">£{vacancy.rentAmount.toLocaleString()} <span className="text-sm font-normal text-zinc-500">/ month</span></p>
            </div>
            <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${vacancy.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-600'}`}>
                    {vacancy.status}
                </span>
                <p className="text-xs text-zinc-400 mt-1">Available: {new Date(vacancy.availableDate).toLocaleDateString()}</p>
            </div>
        </div>

        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-3">
            <h4 className="font-semibold text-zinc-900 text-sm flex items-center"><GlobeAltIcon className="w-4 h-4 mr-2 text-indigo-500"/> Marketplace Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center justify-between bg-white p-2 rounded border border-zinc-200">
                    <span className="text-sm font-medium">Rightmove</span>
                    {vacancy.portalStatus?.rightmove === 'Live' ? (
                        <a href="#" className="text-xs text-green-600 hover:underline flex items-center"><CheckCircleIcon className="w-3 h-3 mr-1"/> View Live</a>
                    ) : (
                        <span className="text-xs text-zinc-400">Not Listed</span>
                    )}
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded border border-zinc-200">
                    <span className="text-sm font-medium">Zoopla</span>
                    {vacancy.portalStatus?.zoopla === 'Live' ? (
                        <a href="#" className="text-xs text-green-600 hover:underline flex items-center"><CheckCircleIcon className="w-3 h-3 mr-1"/> View Live</a>
                    ) : (
                        <span className="text-xs text-zinc-400">Not Listed</span>
                    )}
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded border border-zinc-200">
                    <span className="text-sm font-medium">OnTheMarket</span>
                    <span className="text-xs text-zinc-400">Not Listed</span>
                </div>
            </div>
        </div>

        {vacancy.description && (
            <div>
                <h4 className="font-semibold text-zinc-900 text-sm mb-1">Description</h4>
                <p className="text-sm text-zinc-600 leading-relaxed p-3 bg-zinc-50 rounded border border-zinc-100">{vacancy.description}</p>
            </div>
        )}

        <div className="mt-6 pt-6 border-t border-zinc-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-semibold text-neutral-dark flex items-center"><UsersIcon className="w-5 h-5 mr-2 text-zinc-400"/> Applicants ({relevantApplicants.length})</h4>
            <Button size="sm" onClick={() => onAddApplicant(vacancy.id)} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Add Applicant</Button>
          </div>
          {relevantApplicants.length > 0 ? (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {relevantApplicants.map(app => (
                <li key={app.id} className="p-3 bg-white border border-zinc-200 rounded-lg hover:shadow-sm transition-shadow flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm text-zinc-900">{app.name} <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${app.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600'}`}>{app.status}</span></p>
                    <p className="text-xs text-zinc-500">{app.email} • {app.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEditApplicant(app)} className="p-1 text-zinc-400 hover:text-zinc-600"><PencilIcon className="w-4 h-4"/></Button>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteApplicant(app.id)} className="p-1 text-zinc-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <div className="text-center py-6 bg-zinc-50 rounded-lg border border-dashed border-zinc-200 text-sm text-zinc-400">No applicants yet. Publishing to portals helps!</div>}
        </div>
      </div>
      <div className="flex justify-end pt-6 mt-4 border-t border-zinc-100">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};


interface VacanciesPageProps {
  vacancies: Vacancy[];
  addVacancy: (vacancy: Vacancy) => void;
  updateVacancy: (vacancy: Vacancy) => void;
  deleteVacancy: (vacancyId: string) => void;
  applicants: Applicant[];
  addApplicant: (applicant: Applicant) => void;
  updateApplicant: (applicant: Applicant) => void;
  deleteApplicant: (applicantId: string) => void;
  properties: Property[];
  getPropertyById: (propertyId: string) => Property | undefined;
  communicationLogs: CommunicationLog[]; // For potential applicant communication logs
  addCommunicationLog: (log: CommunicationLog) => void;
  deleteCommunicationLog: (logId: string) => void;
}

const VacanciesPage: React.FC<VacanciesPageProps> = ({
  vacancies, addVacancy, updateVacancy, deleteVacancy,
  applicants, addApplicant, updateApplicant, deleteApplicant,
  properties, getPropertyById,
  communicationLogs, addCommunicationLog, deleteCommunicationLog
}) => {
  const [isVacancyFormOpen, setIsVacancyFormOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [isApplicantFormOpen, setIsApplicantFormOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [currentVacancyIdForApplicant, setCurrentVacancyIdForApplicant] = useState<string | null>(null);
  const [viewingVacancy, setViewingVacancy] = useState<Vacancy | null>(null);

  // Vacancy Handlers
  const handleAddVacancy = () => { setEditingVacancy(null); setIsVacancyFormOpen(true); };
  const handleEditVacancy = (vacancy: Vacancy) => { setEditingVacancy(vacancy); setIsVacancyFormOpen(true); };
  const handleDeleteVacancy = (id: string) => { if (window.confirm('Delete this vacancy and all its applicants?')) deleteVacancy(id); };
  const handleVacancySubmit = (vacancy: Vacancy) => {
    if (editingVacancy) updateVacancy(vacancy); else addVacancy(vacancy);
    setIsVacancyFormOpen(false);
  };
  const handleViewVacancyDetails = (vacancy: Vacancy) => setViewingVacancy(vacancy);

  const handleSyncPortals = (vacancy: Vacancy) => {
      // Simulate API call to Portals
      const updatedVacancy = { 
          ...vacancy, 
          portalStatus: {
              rightmove: 'Pending' as const,
              zoopla: 'Pending' as const,
              onthemarket: 'Not Listed' as const
          }
      };
      updateVacancy(updatedVacancy);
      
      // Simulate completion after 2 seconds
      setTimeout(() => {
          updateVacancy({
              ...updatedVacancy,
              portalStatus: {
                  rightmove: 'Live' as const,
                  zoopla: 'Live' as const,
                  onthemarket: 'Not Listed' as const
              }
          });
          alert("Successfully synced with Rightmove and Zoopla!");
      }, 2000);
  }

  // Applicant Handlers
  const handleAddApplicantToVacancy = (vacancyId: string) => {
    setCurrentVacancyIdForApplicant(vacancyId);
    setEditingApplicant(null);
    setIsApplicantFormOpen(true);
  };
  const handleAddApplicantFromCard = (vacancy: Vacancy) => {
      handleAddApplicantToVacancy(vacancy.id);
  }

  const handleEditApplicant = (applicant: Applicant) => {
    setCurrentVacancyIdForApplicant(applicant.vacancyId);
    setEditingApplicant(applicant);
    setIsApplicantFormOpen(true);
  };
  const handleDeleteApplicant = (id: string) => { if (window.confirm('Delete this applicant?')) deleteApplicant(id); };
  const handleApplicantSubmit = (applicant: Applicant) => {
    if (editingApplicant) updateApplicant(applicant); else addApplicant(applicant);
    setIsApplicantFormOpen(false);
  };

  const applicantCountByVacancyId = useMemo(() => {
    return applicants.reduce((acc, app) => {
      acc[app.vacancyId] = (acc[app.vacancyId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [applicants]);

  return (
    <div className="animate-slide-in-left">
      <PageHeader
        title="Vacancies & Marketing"
        subtitle={`Manage listings across portals. ${vacancies.length} active.`}
        actions={<Button onClick={handleAddVacancy} leftIcon={<PlusCircleIcon className="w-5 h-5"/>} disabled={properties.length === 0}>List New Vacancy</Button>}
      />
      {properties.length === 0 && <p className="text-neutral-DEFAULT p-4 bg-yellow-50 rounded-md mb-4">Add properties before listing vacancies.</p>}

      {vacancies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vacancies.map(v => (
            <VacancyCard
              key={v.id}
              vacancy={v}
              property={getPropertyById(v.propertyId)}
              applicantCount={applicantCountByVacancyId[v.id] || 0}
              onEdit={handleEditVacancy}
              onDelete={handleDeleteVacancy}
              onViewDetails={handleViewVacancyDetails}
              onSyncPortals={handleSyncPortals}
              onAddApplicant={handleAddApplicantFromCard}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-zinc-200">
          <MegaphoneIcon className="w-16 h-16 mx-auto text-zinc-300 mb-4"/>
          <h3 className="text-lg font-semibold text-zinc-900">No active vacancies</h3>
          <p className="text-sm text-zinc-500 mb-6">Create a listing to syndicate to Rightmove & Zoopla.</p>
          <Button onClick={handleAddVacancy} variant="outline" leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>Create Listing</Button>
        </div>
      )}

      {isVacancyFormOpen && (
        <VacancyForm
          isOpen={isVacancyFormOpen}
          onClose={() => setIsVacancyFormOpen(false)}
          onSubmit={handleVacancySubmit}
          initialData={editingVacancy}
          properties={properties}
        />
      )}
      {isApplicantFormOpen && currentVacancyIdForApplicant && (
        <ApplicantForm
          isOpen={isApplicantFormOpen}
          onClose={() => setIsApplicantFormOpen(false)}
          onSubmit={handleApplicantSubmit}
          initialData={editingApplicant}
          vacancyId={currentVacancyIdForApplicant}
        />
      )}
      {viewingVacancy && (
        <VacancyDetailsModal
          vacancy={viewingVacancy}
          property={getPropertyById(viewingVacancy.propertyId)}
          applicants={applicants}
          onClose={() => setViewingVacancy(null)}
          onAddApplicant={handleAddApplicantToVacancy}
          onEditApplicant={handleEditApplicant}
          onDeleteApplicant={handleDeleteApplicant}
          communicationLogs={communicationLogs}
          addCommunicationLog={addCommunicationLog}
          deleteCommunicationLog={deleteCommunicationLog}
        />
      )}
    </div>
  );
};

export default VacanciesPage;
