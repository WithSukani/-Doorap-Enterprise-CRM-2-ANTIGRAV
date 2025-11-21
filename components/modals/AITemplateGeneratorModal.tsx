
import React, { useState } from 'react';
import { DocumentTemplate } from '../../types';
import { generateDocumentTemplate } from '../ai/gemini';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Spinner from '../common/Spinner';
import { ArrowUturnLeftIcon, SparklesIcon } from '../icons/HeroIcons';

interface AITemplateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: DocumentTemplate) => void;
}

type WizardStep = 'prompt' | 'review';

const AITemplateGeneratorModal: React.FC<AITemplateGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<WizardStep>('prompt');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<Partial<DocumentTemplate> | null>(null);

  const examplePrompts = [
    "A late rent notice",
    "A welcome letter for a new tenant",
    "A 24-hour inspection notification",
    "A standard residential lease agreement",
    "An addendum for a pet policy"
  ];

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please provide a description for the template.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const templateData = await generateDocumentTemplate(description);
      setGeneratedTemplate(templateData);
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
      setStep('prompt');
      setError(null);
      // Keep generatedTemplate so user can go back and forth without losing data
  }

  const handleSave = () => {
    if (!generatedTemplate || !generatedTemplate.name || !generatedTemplate.category || !generatedTemplate.content) {
      setError('Generated data is incomplete. Please ensure all fields are filled.');
      return;
    }
    const finalTemplate: DocumentTemplate = {
      id: `dtmpl_${Date.now()}`,
      name: generatedTemplate.name,
      category: generatedTemplate.category,
      content: generatedTemplate.content,
    };
    onSubmit(finalTemplate);
  };
  
  const handleCloseAndReset = () => {
      setStep('prompt');
      setIsLoading(false);
      setError(null);
      setDescription('');
      setGeneratedTemplate(null);
      onClose();
  }
  
  const handleGeneratedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setGeneratedTemplate(prev => prev ? {...prev, [name]: value} : null);
  }

  const title = step === 'prompt' ? 'Create Template with Dori' : 'Review & Save Template';

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndReset} title={title} size="lg">
      <div className="space-y-4">
        {step === 'prompt' && (
          <div>
            <Textarea
              label="Describe the document you want to create"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., A formal notice to a tenant about an upcoming property inspection in 48 hours."
              rows={4}
            />
             <div className="mt-2 text-xs text-neutral-DEFAULT">
                <span>Examples: </span>
                {examplePrompts.map((p, i) => (
                    <React.Fragment key={p}>
                        <button type="button" onClick={() => setDescription(p)} className="hover:underline text-primary">{`"${p}"`}</button>
                        {i < examplePrompts.length - 1 && ', '}
                    </React.Fragment>
                ))}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center p-4 mt-4">
                <Spinner />
                <p className="ml-3 text-neutral-DEFAULT">Dori is writing...</p>
              </div>
            )}
            
            {error && <p className="text-sm text-secondary text-center mt-2">{error}</p>}
            
            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseAndReset}>
                Cancel
              </Button>
              <Button type="button" onClick={handleGenerate} isLoading={isLoading} disabled={!description.trim()}>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && generatedTemplate && (
          <div>
            <Input
              label="Template Name"
              name="name"
              value={generatedTemplate.name || ''}
              onChange={handleGeneratedChange}
            />
            <Input
              label="Category"
              name="category"
              value={generatedTemplate.category || ''}
              onChange={handleGeneratedChange}
            />
            <Textarea
              label="Template Content"
              name="content"
              value={generatedTemplate.content || ''}
              onChange={handleGeneratedChange}
              rows={12}
            />
            {error && <p className="text-sm text-secondary text-center mt-2">{error}</p>}
            <div className="flex justify-between items-center pt-4 mt-4 border-t">
              <Button type="button" variant="ghost" onClick={handleBack} leftIcon={<ArrowUturnLeftIcon className="w-4 h-4"/>}>
                Back
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={handleCloseAndReset}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AITemplateGeneratorModal;