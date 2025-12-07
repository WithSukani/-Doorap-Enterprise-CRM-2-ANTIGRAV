
import React, { useState, useMemo } from 'react';
import { Document, DocumentTemplate, Folder, Property, Tenant, UserProfile, MaintenanceRequest } from '../../types';
import PageHeader from '../PageHeader';
import Button from '../common/Button';
import DocumentForm from '../forms/DocumentForm';
import DocumentGenerationModal from '../modals/DocumentGenerationModal';
import Modal from '../common/Modal';
import Input from '../common/Input';
import {
    FolderIcon, FolderOpenIcon, DocumentTextIcon, PlusCircleIcon,
    ArrowDownLeftIcon, SparklesIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon
} from '../icons/HeroIcons';

// Define CreateFolderModal locally since previous export might be tricky to import if not standard
const LocalCreateFolderModal = ({ isOpen, onClose, onSubmit }: any) => {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ id: `fold_${Date.now()}`, name, type: 'custom' }); setName(''); onClose(); }
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Folder">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Folder Name" name="name" value={name} onChange={e => setName(e.target.value)} autoFocus />
                <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Create</Button></div>
            </form>
        </Modal>
    )
}

interface DocumentsPageProps {
    documents: Document[];
    addDocument: (doc: Document) => void;
    deleteDocument: (id: string) => void;
    folders: Folder[];
    addFolder: (folder: Folder) => void;
    deleteFolder: (id: string) => void;
    documentTemplates: DocumentTemplate[];
    addDocumentTemplate: (template: DocumentTemplate) => void;
    properties: Property[];
    tenants: Tenant[];
    userProfile: UserProfile;
    maintenanceRequests: MaintenanceRequest[];
}

const SYSTEM_FOLDERS: Folder[] = [
    { id: 'all', name: 'All Documents', type: 'system' },
    { id: 'lease', name: 'Leases & Agreements', type: 'system' },
    { id: 'compliance', name: 'Compliance & Safety', type: 'system' },
    { id: 'finance', name: 'Invoices & Receipts', type: 'system' },
];

const DocumentsPage: React.FC<DocumentsPageProps> = (props) => {
    const [activeFolderId, setActiveFolderId] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

    const allFolders = [...SYSTEM_FOLDERS, ...(props.folders || [])];

    const filteredDocuments = useMemo(() => {
        return (props.documents || []).filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesFolder = true;
            if (activeFolderId === 'all') matchesFolder = true;
            else if (activeFolderId === 'lease') matchesFolder = doc.type.toLowerCase().includes('lease') || doc.type.toLowerCase().includes('agreement');
            else if (activeFolderId === 'compliance') matchesFolder = doc.type.toLowerCase().includes('certificate') || doc.type.toLowerCase().includes('safety');
            else if (activeFolderId === 'finance') matchesFolder = doc.type.toLowerCase().includes('invoice') || doc.type.toLowerCase().includes('receipt') || doc.type.toLowerCase().includes('financial');
            else matchesFolder = doc.folderId === activeFolderId;

            return matchesSearch && matchesFolder;
        });
    }, [props.documents, searchTerm, activeFolderId]);

    const handleUpload = (doc: Document) => {
        // If inside a custom folder, assign it
        if (activeFolderId !== 'all' && !SYSTEM_FOLDERS.find(f => f.id === activeFolderId)) {
            doc.folderId = activeFolderId;
        }
        props.addDocument(doc);
        setIsUploadModalOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] animate-fade-in">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-zinc-200 flex flex-col">
                <div className="p-4 border-b border-zinc-100">
                    <h2 className="font-bold text-zinc-900 text-lg">Filing Cabinet</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {allFolders.map(folder => (
                        <button
                            key={folder.id}
                            onClick={() => setActiveFolderId(folder.id)}
                            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeFolderId === folder.id ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                                }`}
                        >
                            {activeFolderId === folder.id ? <FolderOpenIcon className="w-5 h-5 mr-2 text-zinc-800" /> : <FolderIcon className="w-5 h-5 mr-2 text-zinc-400" />}
                            {folder.name}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-zinc-100">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setIsCreateFolderModalOpen(true)} leftIcon={<PlusCircleIcon className="w-4 h-4" />}>New Folder</Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-zinc-50">
                {/* Toolbar */}
                <div className="bg-white border-b border-zinc-200 p-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center bg-zinc-100 px-3 py-2 rounded-md w-64">
                        <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 mr-2" />
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full placeholder-zinc-400"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => setIsGenerateModalOpen(true)} leftIcon={<SparklesIcon className="w-5 h-5" />}>Draft with Dori</Button>
                        <Button variant="outline" onClick={() => setIsUploadModalOpen(true)} leftIcon={<ArrowDownLeftIcon className="w-5 h-5" />}>Upload</Button>
                    </div>
                </div>

                {/* File Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredDocuments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredDocuments.map(doc => (
                                <div key={doc.id} className="group bg-white p-4 rounded-lg border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer relative">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <DocumentTextIcon className="w-6 h-6" />
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete?')) props.deleteDocument(doc.id) }} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h4 className="font-medium text-zinc-900 text-sm truncate mb-1" title={doc.name}>{doc.name}</h4>
                                    <p className="text-xs text-zinc-500">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                                    {doc.expiryDate && <p className="text-[10px] text-orange-500 mt-1">Exp: {new Date(doc.expiryDate).toLocaleDateString()}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                            <FolderIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>No documents found in this folder.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <LocalCreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onSubmit={props.addFolder}
            />
            <DocumentForm
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSubmit={handleUpload}
                parentId="general" // Default to general if uploaded directly
                parentType="property" // Fallback
            />
            <DocumentGenerationModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onSubmit={handleUpload} // Reuse upload handler to add generated doc
                documentTemplates={props.documentTemplates}
                properties={props.properties}
                tenants={props.tenants}
                userProfile={props.userProfile}
                parentObject={props.properties[0]} // Default context
            />
        </div>
    );
};

export default DocumentsPage;
