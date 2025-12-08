
import React, { useState } from 'react';
import { DocumentTemplate, Folder } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Spinner from '../common/Spinner';
import { TrashIcon, PlusCircleIcon, SparklesIcon, XMarkIcon } from '../icons/HeroIcons';
import { generateDocumentTemplate } from '../ai/gemini';

interface TemplateManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: DocumentTemplate[];
    folders?: Folder[];
    onAdd: (template: DocumentTemplate) => void;
    onDelete: (id: string) => void;
    onUse?: (template: DocumentTemplate) => void;
}

const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
    isOpen, onClose, templates, folders = [], onAdd, onDelete, onUse
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const [newTemplate, setNewTemplate] = useState<Partial<DocumentTemplate>>({
        name: '',
        content: '',
        description: '',
        folderId: ''
    });

    const handleCreate = () => {
        if (!newTemplate.name || !newTemplate.content) {
            alert("Please fill in all required fields");
            return;
        }

        const template: DocumentTemplate = {
            id: `temp_${Date.now()}`,
            name: newTemplate.name!,
            content: newTemplate.content!,
            category: 'General',
            description: newTemplate.description,
            folderId: newTemplate.folderId
        };

        onAdd(template);
        // if (onUse) onUse(template); // Removed to prevent auto-opening generation modal

        // Reset
        setNewTemplate({ name: '', content: '', description: '', folderId: '' });
        onClose();
    };

    const handleAiDraft = async () => {
        if (!newTemplate.description && !newTemplate.name) return;
        setIsGenerating(true);
        try {
            // Mock AI or real call
            const prompt = `Create a ${newTemplate.name || 'document'} template. Description: ${newTemplate.description}`;
            const draft = await generateDocumentTemplate(prompt);
            // The draft is likely a string based on generateDocumentTemplate usage elsewhere (it returns content string).
            // If draft is an object, we need to handle that. 
            // Previous code: setNewTemplate(prev => ({ ...prev, content: draft })); where draft was treated as string?
            // Lint said: Type 'Partial<DocumentTemplate>' is not assignable to type 'string'.
            // This implies 'draft' might have been typed as Partial<DocumentTemplate> in previous context or similar.
            // Let's assume generateDocumentTemplate returns a string content.
            // If it returns an object, we need to extract content.
            if (typeof draft === 'string') {
                setNewTemplate(prev => ({ ...prev, content: draft }));
            } else {
                // Fallback if it returns object
                // @ts-ignore
                setNewTemplate(prev => ({ ...prev, content: draft.content || '' }));
            }
        } catch (error) {
            console.error(error);
            setNewTemplate(prev => ({ ...prev, content: "Error generating draft. Please try again." }));
        } finally {
            setIsGenerating(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-indigo-100 flex justify-between items-center bg-indigo-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-indigo-900">Add New Document Template</h3>
                        <p className="text-sm text-indigo-600/80">Create a reusable template for your documents</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-indigo-400 hover:text-indigo-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <Input
                                name="newTempName"
                                label="Template Name"
                                placeholder="e.g., Standard Tenancy Agreement"
                                value={newTemplate.name}
                                onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                            />
                        </div>

                        <Textarea
                            name="newTempDesc"
                            label="Description (Optional)"
                            placeholder="Brief description of the template purpose"
                            rows={2}
                            value={newTemplate.description || ''}
                            onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Select Folder</label>
                            <select
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={newTemplate.folderId || ''}
                                onChange={e => setNewTemplate({ ...newTemplate, folderId: e.target.value })}
                            >
                                <option value="">Select a folder to organize this template</option>
                                {folders.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                                    Dori Concise Template Generation
                                </h4>
                                <p className="text-xs text-indigo-700 mb-0">Let Dori create a short, effective template for you based on your description.</p>
                            </div>
                            <div className="w-full md:w-auto">
                                <Button onClick={handleAiDraft} isLoading={isGenerating} disabled={!newTemplate.description && !newTemplate.name} className="w-full md:w-auto bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50">Use Dori</Button>
                            </div>
                        </div>
                        <Textarea
                            name="newTempContent"
                            label="Template Content"
                            placeholder="Enter template text. You can use placeholders like {{TENANT_NAME}}, {{PROPERTY_ADDRESS}}, etc."
                            rows={10}
                            value={newTemplate.content}
                            onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        />

                        <div className="bg-zinc-50 p-3 rounded-md border border-zinc-200">
                            <p className="text-xs font-medium text-zinc-700 mb-2">Available Placeholders:</p>
                            <div className="flex flex-wrap gap-2">
                                {['{{TENANT_NAME}}', '{{PROPERTY_ADDRESS}}', '{{LANDLORD_NAME}}', '{{LEASE_START}}', '{{LEASE_END}}', '{{RENT_AMOUNT}}'].map(p => (
                                    <span key={p} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white border border-zinc-200 text-zinc-600 font-mono">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-indigo-50">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleCreate}>Save Template</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateManagerModal;
