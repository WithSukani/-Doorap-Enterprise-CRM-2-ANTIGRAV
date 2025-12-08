
import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Document } from '../../types';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, document }) => {
    if (!document) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={document.name} size="xl">
            <div className="space-y-4">
                <div className="p-4 bg-white border rounded-md shadow-sm h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm font-sans text-zinc-700">
                    {document.content}
                </div>
                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={() => {
                        const element = window.document.createElement("a");
                        const file = new Blob([document.content || ''], { type: 'text/plain' });
                        element.href = URL.createObjectURL(file);
                        element.download = `${document.name}.txt`;
                        window.document.body.appendChild(element);
                        element.click();
                        window.document.body.removeChild(element);
                    }}>Download</Button>
                </div>
            </div>
        </Modal>
    );
};

export default DocumentViewerModal;
