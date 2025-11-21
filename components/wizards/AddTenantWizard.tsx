
import React, { useState } from 'react';
import { Tenant, Property } from '../../types';
import { extractLeaseDetailsFromFile } from '../ai/gemini';
import Modal from '../common/Modal';
import Button from '../common/Button';
import TenantFormFields from '../forms/TenantFormFields';
import Spinner from '../common/Spinner';
import { ArrowPathIcon, DocumentTextIcon, SparklesIcon } from '../icons/HeroIcons';

interface AddTenantWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tenant: Tenant) => void;
  properties: Property[];
  defaultPropertyId?: string;
}

type WizardStep = 'upload' | 'form';

const AddTenantWizard: React.FC<AddTenantWizardProps> = ({ isOpen, onClose, onSubmit, properties, defaultPropertyId }) => {
  const [step, setStep] = useState<WizardStep>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<Tenant> | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!file.type.startsWith('image/') && !allowedMimeTypes.includes(file.type)) {
        setError('Please upload an image, PDF, or Word document.');
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await extractLeaseDetailsFromFile(file);
      setExtractedData(data);
      setStep('form');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    setExtractedData(null);
    setStep('form');
  };
  
  const handleReset = () => {
    setStep('upload');
    setExtractedData(null);
    setError(null);
    setIsLoading(false);
  };

  const handleFormSubmit = (tenant: Tenant) => {
    onSubmit(tenant);
  };
  
  const handleClose = () => {
    handleReset();
    onClose();
  }
  
  const title = step === 'upload' ? 'Add New Tenant' : (extractedData ? 'Review and Complete Tenant Details' : 'Enter Tenant Details');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
      {step === 'upload' && (
        <div className="text-center p-4">
          <SparklesIcon className="w-16 h-16 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold text-neutral-dark mb-2">Automate with Dori</h3>
          <p className="text-neutral-DEFAULT mb-6">Upload a lease agreement (Image, PDF, or Word Doc) to automatically extract tenant details.</p>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40">
                <Spinner />
                <p className="mt-2 text-neutral-DEFAULT">Analyzing document...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
                <label htmlFor="lease-upload" className="w-full cursor-pointer bg-primary text-white font-semibold py-3 px-4 rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Upload Lease Document
                </label>
                <input type="file" id="lease-upload" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx" />

                <Button variant="outline" onClick={handleSkip} className="w-full">
                    Skip and Enter Manually
                </Button>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-secondary">{error}</p>}
        </div>
      )}

      {step === 'form' && (
        <>
        {extractedData && (
             <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-r-md">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">
                        <SparklesIcon className="w-5 h-5 inline mr-1" />
                        Dori successfully extracted details. Please review and save.
                    </p>
                    <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>
                        Start Over
                    </Button>
                </div>
             </div>
        )}
        <TenantFormFields
          onCancel={step === 'form' && extractedData ? handleReset : handleClose}
          onSubmit={handleFormSubmit}
          initialData={extractedData}
          properties={properties}
          defaultPropertyId={defaultPropertyId}
        />
        </>
      )}
    </Modal>
  );
};

export default AddTenantWizard;