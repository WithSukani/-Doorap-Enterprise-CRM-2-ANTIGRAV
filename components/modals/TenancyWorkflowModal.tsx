
import React, { useState } from 'react';
import { Tenant, Property, MeterReading, InventoryItem, Document } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { compareInventoryDocuments } from '../ai/gemini';
import { BoltIcon, CameraIcon, CheckCircleIcon, SparklesIcon, CloudArrowUpIcon, DocumentTextIcon } from '../icons/HeroIcons';

interface TenancyWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant;
    property: Property;
    type: 'Move In' | 'Move Out';
    onSaveMeterReadings: (readings: MeterReading[]) => void;
    onSaveInventory: (items: InventoryItem[]) => void;
    onComplete: (finalData: any) => void;
    addDocument: (doc: Document) => void;
    documents: Document[];
}

const TenancyWorkflowModal: React.FC<TenancyWorkflowModalProps> = ({
    isOpen, onClose, tenant, property, type, onSaveMeterReadings, onSaveInventory, onComplete, addDocument, documents
}) => {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Meters State
    const [gasReading, setGasReading] = useState('');
    const [elecReading, setElecReading] = useState('');
    const [waterReading, setWaterReading] = useState('');
    
    // Meter Photos State
    const [gasPhoto, setGasPhoto] = useState<File | null>(null);
    const [elecPhoto, setElecPhoto] = useState<File | null>(null);
    const [waterPhoto, setWaterPhoto] = useState<File | null>(null);

    // Inventory State (Document Based)
    const [checkInFile, setCheckInFile] = useState<File | null>(null);
    const [checkOutFile, setCheckOutFile] = useState<File | null>(null);
    
    // Selection State for existing docs
    const [selectedCheckInDocId, setSelectedCheckInDocId] = useState('');
    const [selectedCheckOutDocId, setSelectedCheckOutDocId] = useState('');
    const [checkInMode, setCheckInMode] = useState<'upload' | 'select'>('upload');
    const [checkOutMode, setCheckOutMode] = useState<'upload' | 'select'>('upload');

    const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [totalDeductionsOverride, setTotalDeductionsOverride] = useState<number>(0);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleRunAIComparison = async () => {
        if (!checkInFile || !checkOutFile) return;
        setIsAnalyzing(true);
        try {
            // Save documents first
            const checkInDoc: Document = {
                id: `doc_inv_in_${Date.now()}`, parentId: property.id, parentType: 'property',
                name: `Check-In Inventory - ${tenant.name}`, type: 'Inspection Report',
                uploadDate: new Date().toISOString(), fileName: checkInFile.name, fileSize: `${(checkInFile.size / 1024 / 1024).toFixed(2)}MB`
            };
            const checkOutDoc: Document = {
                id: `doc_inv_out_${Date.now()}`, parentId: property.id, parentType: 'property',
                name: `Check-Out Inventory - ${tenant.name}`, type: 'Inspection Report',
                uploadDate: new Date().toISOString(), fileName: checkOutFile.name, fileSize: `${(checkOutFile.size / 1024 / 1024).toFixed(2)}MB`
            };
            addDocument(checkInDoc);
            addDocument(checkOutDoc);

            // Run Analysis
            const result = await compareInventoryDocuments(checkInFile, checkOutFile);
            setAiAnalysisResult(result);
            
            const deductionMatch = result.match(/Total Deduction: £(\d+)/i);
            if (deductionMatch) {
                setTotalDeductionsOverride(parseInt(deductionMatch[1], 10));
            }

        } catch (e) {
            console.error(e);
            setAiAnalysisResult("Error analyzing documents. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const refundAmount = (tenant.securityDeposit || 0) - totalDeductionsOverride;

    const handleFinish = () => {
        // Save Meters
        const readings: MeterReading[] = [];
        if (gasReading) readings.push({ 
            id: `mr_g_${Date.now()}`, propertyId: property.id, type: 'Gas', reading: Number(gasReading), date, context: type,
            photoUrl: gasPhoto ? `#mock-photo-${gasPhoto.name}` : undefined
        });
        if (elecReading) readings.push({ 
            id: `mr_e_${Date.now()}`, propertyId: property.id, type: 'Electric', reading: Number(elecReading), date, context: type,
            photoUrl: elecPhoto ? `#mock-photo-${elecPhoto.name}` : undefined
        });
        if (waterReading) readings.push({ 
            id: `mr_w_${Date.now()}`, propertyId: property.id, type: 'Water', reading: Number(waterReading), date, context: type,
            photoUrl: waterPhoto ? `#mock-photo-${waterPhoto.name}` : undefined
        });
        
        onSaveMeterReadings(readings);
        
        // Save Analysis Report as Document (Move Out)
        if (aiAnalysisResult) {
            addDocument({
                id: `doc_ai_report_${Date.now()}`, parentId: tenant.id, parentType: 'tenant',
                name: `Dori's Deposit Assessment Report`, type: 'Other',
                uploadDate: new Date().toISOString(), content: aiAnalysisResult
            });
        }

        // Save Move-In Inventory Document if newly uploaded
        if (type === 'Move In' && checkInMode === 'upload' && checkInFile) {
             addDocument({
                id: `doc_inv_in_${Date.now()}`, 
                parentId: property.id, 
                parentType: 'property',
                name: `Check-In Inventory - ${tenant.name}`, 
                type: 'Inspection Report',
                uploadDate: new Date().toISOString(), 
                fileName: checkInFile.name, 
                fileSize: `${(checkInFile.size / 1024 / 1024).toFixed(2)}MB`,
                notes: 'Uploaded during Move-In workflow'
            });
        }

        onComplete({ date, refundAmount, totalDeductions: totalDeductionsOverride });
        onClose();
    };

    if (!isOpen) return null;

    // Helper to render upload box or select
    const renderDocInput = (
        mode: 'upload' | 'select', 
        setMode: (m: 'upload' | 'select') => void, 
        file: File | null, 
        setFile: (f: File | null) => void, 
        selectedId: string, 
        setSelectedId: (id: string) => void,
        label: string
    ) => (
        <div className="flex flex-col h-full">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700">{label}</span>
                <div className="flex gap-2 text-xs">
                    <button type="button" onClick={() => setMode('upload')} className={`${mode === 'upload' ? 'text-primary font-bold underline' : 'text-zinc-500 hover:text-primary'}`}>Upload</button>
                    <button type="button" onClick={() => setMode('select')} className={`${mode === 'select' ? 'text-primary font-bold underline' : 'text-zinc-500 hover:text-primary'}`}>Select Existing</button>
                </div>
            </div>
            
            {mode === 'upload' ? (
                <div className="border-2 border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-zinc-50 relative flex-1 min-h-[150px]">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                    <DocumentTextIcon className="w-8 h-8 text-zinc-300 mb-2"/>
                    <p className="text-sm font-medium truncate max-w-[200px]">{file ? file.name : 'Click to Upload'}</p>
                </div>
            ) : (
                <div className="flex-1">
                    <Select 
                        name="existingDoc" 
                        value={selectedId} 
                        onChange={e => setSelectedId(e.target.value)} 
                        options={[{value: '', label: 'Select Document...'}, ...documents.map((d: any) => ({ label: d.name, value: d.id }))]}
                        containerClassName="mb-0"
                    />
                    {selectedId && <p className="text-xs text-green-600 mt-2">Document Selected</p>}
                </div>
            )}
        </div>
    );

    const renderMeterInput = (label: string, value: string, setValue: (v: string) => void, photo: File | null, setPhoto: (f: File | null) => void) => (
        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-700">{label}</label>
                {photo ? (
                    <span className="text-xs text-green-600 flex items-center"><CheckCircleIcon className="w-3 h-3 mr-1"/> Photo Added</span>
                ) : (
                    <span className="text-xs text-zinc-400">No photo</span>
                )}
            </div>
            <div className="flex gap-2">
                <Input 
                    name={label} 
                    type="number" 
                    value={value} 
                    onChange={e => setValue(e.target.value)} 
                    placeholder="00000" 
                    containerClassName="mb-0 flex-1"
                />
                <div className="relative">
                    <input 
                        type="file" 
                        id={`upload-${label}`} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => e.target.files && setPhoto(e.target.files[0])}
                    />
                    <label 
                        htmlFor={`upload-${label}`} 
                        className={`flex items-center justify-center w-10 h-[42px] rounded-md border cursor-pointer transition-colors ${
                            photo ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-zinc-300 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600'
                        }`}
                        title="Upload Meter Photo"
                    >
                        <CameraIcon className="w-5 h-5" />
                    </label>
                </div>
            </div>
            {photo && <p className="text-[10px] text-zinc-500 mt-1 truncate">{photo.name}</p>}
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${type} Workflow: ${tenant.name}`} size="xl">
            {/* Stepper */}
            <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`flex items-center ${i < 3 ? 'w-full' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                            {i}
                        </div>
                        {i < 3 && <div className={`flex-1 h-1 mx-2 ${step > i ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Key Dates & Utilities</h3>
                        <Input label={`${type} Date`} name="workflowDate" type="date" value={date} onChange={e => setDate(e.target.value)} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {renderMeterInput("Gas Reading", gasReading, setGasReading, gasPhoto, setGasPhoto)}
                            {renderMeterInput("Electric Reading", elecReading, setElecReading, elecPhoto, setElecPhoto)}
                            {renderMeterInput("Water Reading", waterReading, setWaterReading, waterPhoto, setWaterPhoto)}
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm flex items-start">
                            <BoltIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                            <p>Please ensure clear photos of meters are uploaded for dispute resolution.</p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{type === 'Move Out' ? 'Inventory Comparison' : 'Inventory Check'}</h3>
                        </div>
                        
                        {type === 'Move Out' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderDocInput(checkInMode, setCheckInMode, checkInFile, setCheckInFile, selectedCheckInDocId, setSelectedCheckInDocId, "Original Inventory (Check-In)")}
                                    {renderDocInput(checkOutMode, setCheckOutMode, checkOutFile, setCheckOutFile, selectedCheckOutDocId, setSelectedCheckOutDocId, "Current Condition (Check-Out)")}
                                </div>

                                <div className="flex justify-center">
                                    <Button onClick={handleRunAIComparison} isLoading={isAnalyzing} disabled={(!checkInFile && !selectedCheckInDocId) || (!checkOutFile && !selectedCheckOutDocId)} leftIcon={<SparklesIcon className="w-4 h-4"/>}>
                                        Dori: Compare & Assess Damages
                                    </Button>
                                </div>

                                {aiAnalysisResult && (
                                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-sm space-y-2">
                                        <h4 className="font-bold text-zinc-900">Dori's Assessment Report</h4>
                                        <div className="whitespace-pre-wrap text-zinc-700 max-h-60 overflow-y-auto p-2 bg-white border border-zinc-100 rounded">
                                            {aiAnalysisResult}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm text-zinc-600">Please provide the signed inventory check-in report to store it on file.</p>
                                {renderDocInput(checkInMode, setCheckInMode, checkInFile, setCheckInFile, selectedCheckInDocId, setSelectedCheckInDocId, "Signed Inventory Report")}
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircleIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Ready to Complete</h3>
                        
                        {type === 'Move Out' && (
                            <div className="bg-zinc-50 p-6 rounded-lg max-w-sm mx-auto border border-zinc-200">
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-zinc-500">Security Deposit Held</span>
                                    <span className="font-medium">£{tenant.securityDeposit}</span>
                                </div>
                                <div className="flex justify-between mb-2 text-sm text-red-600">
                                    <span>Total Deductions (Est.)</span>
                                    <input 
                                        type="number" 
                                        className="w-20 text-right border-b border-red-200 bg-transparent focus:outline-none"
                                        value={totalDeductionsOverride}
                                        onChange={(e) => setTotalDeductionsOverride(Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex justify-between border-t border-zinc-200 pt-2 mt-2 font-bold text-lg">
                                    <span>To Return</span>
                                    <span>£{refundAmount}</span>
                                </div>
                            </div>
                        )}
                        
                        <p className="text-zinc-500 text-sm">
                            {type === 'Move In' 
                                ? "Keys handed over, inventory signed, and meters logged. Tenant is now active."
                                : "Final bill calculated. Proceed to process deposit return via the scheme."}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-6 border-t border-zinc-100 mt-4">
                <Button variant="ghost" onClick={handleBack} disabled={step === 1}>Back</Button>
                {step < 3 ? (
                    <Button onClick={handleNext}>Next Step</Button>
                ) : (
                    <Button onClick={handleFinish} variant="primary">Complete {type}</Button>
                )}
            </div>
        </Modal>
    );
};

export default TenancyWorkflowModal;
