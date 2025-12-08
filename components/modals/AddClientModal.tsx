
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import { Landlord } from '../../types';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (landlord: Landlord) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active',
        enablePortal: false,
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newLandlord: Landlord = {
            id: `landlord_${Date.now()}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            status: formData.status as 'Active' | 'Inactive',
            sentiment: 'Neutral', // Default
            lastInteractionDate: new Date().toISOString(),
            isArchived: false,
            portalAccess: formData.enablePortal,
            notes: formData.notes
        };

        onSubmit(newLandlord);
        onClose();
        // Reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            status: 'Active',
            enablePortal: false,
            notes: ''
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Client">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Full Name / Company Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe or Real Estate Ltd"
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="client@example.com"
                        required
                    />
                    <Input
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="07700 900000"
                        required
                    />
                </div>

                <Input
                    label="Correspondence Address"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 10 Downing St, London"
                />

                <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                        { value: 'Pending', label: 'Pending' }
                    ]}
                />

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="enablePortal"
                            name="enablePortal"
                            type="checkbox"
                            checked={formData.enablePortal}
                            onChange={(e) => setFormData({ ...formData, enablePortal: e.target.checked })}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="enablePortal" className="font-medium text-zinc-700">Enable Client Portal Access</label>
                    </div>
                </div>

                <Textarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Internal notes about this client..."
                    rows={3}
                />

                <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-100 mt-6">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Client</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddClientModal;
