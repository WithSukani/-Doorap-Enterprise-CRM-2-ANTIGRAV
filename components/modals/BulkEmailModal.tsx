
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import { PaperAirplaneIcon, UserGroupIcon } from '../icons/HeroIcons';

interface BulkEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipients: { id: string; name: string; email: string }[];
    context: 'Tenants' | 'Landlords';
}

const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ isOpen, onClose, recipients, context }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);

    const handleSend = () => {
        if (!subject || !message) return;
        
        setIsSending(true);
        // Simulate API latency
        setTimeout(() => {
            setIsSending(false);
            setSentSuccess(true);
            setTimeout(() => {
                setSentSuccess(false);
                setSubject('');
                setMessage('');
                onClose();
            }, 1500);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Bulk Email to ${context}`} size="lg">
            {sentSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <PaperAirplaneIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900">Emails Sent!</h3>
                    <p className="text-zinc-500 mt-2">Successfully dispatched to {recipients.length} recipients.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-zinc-50 p-3 rounded-md border border-zinc-200 flex items-center justify-between">
                        <div className="flex items-center text-sm text-zinc-700">
                            <UserGroupIcon className="w-5 h-5 mr-2 text-zinc-400"/>
                            <span>Recipients: <strong>{recipients.length} {context}</strong></span>
                        </div>
                        <span className="text-xs text-zinc-400">via SendGrid</span>
                    </div>

                    <Input 
                        label="Subject Line" 
                        name="subject" 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)} 
                        placeholder={`Important update for all ${context.toLowerCase()}...`}
                    />

                    <Textarea 
                        label="Message Body" 
                        name="message" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        rows={8}
                        placeholder="Dear {{Name}}, write your message here..."
                    />
                    
                    <p className="text-xs text-zinc-500">
                        Tip: Use <strong>{'{{Name}}'}</strong> to personalize emails for each recipient.
                    </p>

                    <div className="flex justify-end pt-4 border-t border-zinc-100">
                        <Button variant="outline" onClick={onClose} className="mr-2">Cancel</Button>
                        <Button onClick={handleSend} isLoading={isSending} leftIcon={<PaperAirplaneIcon className="w-4 h-4"/>}>
                            Send Broadcast
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default BulkEmailModal;
