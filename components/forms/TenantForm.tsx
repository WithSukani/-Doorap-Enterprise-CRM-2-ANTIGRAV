
import React from 'react';
import { Tenant, Property } from '../../types';
import Modal from '../common/Modal';
import TenantFormFields from './TenantFormFields';

interface TenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tenant: Tenant) => void;
  initialData?: Tenant | null;
  properties: Property[];
  defaultPropertyId?: string;
}

const TenantForm: React.FC<TenantFormProps> = ({ isOpen, onClose, onSubmit, initialData, properties, defaultPropertyId }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Tenant' : 'Add New Tenant'}>
      <TenantFormFields
        onCancel={onClose}
        onSubmit={onSubmit}
        initialData={initialData}
        properties={properties}
        defaultPropertyId={defaultPropertyId}
      />
    </Modal>
  );
};

export default TenantForm;