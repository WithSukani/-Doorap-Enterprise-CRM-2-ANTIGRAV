
import React, { useState, useEffect } from 'react';
import { Expense, Property, ExpenseCategory } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Expense) => void;
  initialData?: Expense | null;
  properties: Property[];
}

const getInitialState = (initialData?: Expense | null, properties: Property[] = []): Partial<Expense> => {
  return initialData || {
    propertyId: properties.length > 0 ? properties[0].id : '',
    date: new Date().toISOString().split('T')[0],
    category: ExpenseCategory.OTHER,
    description: '',
    amount: undefined,
    vendor: '',
    receiptUrl: '',
    notes: ''
  };
};

const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, onSubmit, initialData, properties }) => {
  const [expense, setExpense] = useState<Partial<Expense>>(getInitialState(initialData, properties));
  const [errors, setErrors] = useState<Partial<Record<keyof Expense, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setExpense(getInitialState(initialData, properties));
      setErrors({});
    }
  }, [initialData, isOpen, properties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Expense]) {
      setErrors(prev => ({ ...prev, [name as keyof Expense]: undefined }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
    if (errors[name as keyof Expense]) {
      setErrors(prev => ({ ...prev, [name as keyof Expense]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof Expense, string>> = {};
    if (!expense.propertyId) newErrors.propertyId = 'Property is required.';
    if (!expense.date) newErrors.date = 'Expense date is required.';
    if (!expense.category) newErrors.category = 'Category is required.';
    if (!expense.description?.trim()) newErrors.description = 'Description is required.';
    if (expense.amount === undefined || isNaN(expense.amount) || expense.amount <= 0) newErrors.amount = 'Valid amount is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const finalExpense: Expense = {
      id: initialData?.id || `exp_${Date.now()}`,
      propertyId: expense.propertyId!,
      date: expense.date!,
      category: expense.category!,
      description: expense.description!,
      amount: expense.amount!,
      vendor: expense.vendor,
      receiptUrl: expense.receiptUrl,
      notes: expense.notes
    };
    onSubmit(finalExpense);
  };

  const propertyOptions = properties.map(p => ({ value: p.id, label: p.address }));
  const categoryOptions = Object.values(ExpenseCategory).map(cat => ({ value: cat, label: cat }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Expense' : 'Log New Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select name="propertyId" label="Property" value={expense.propertyId || ''} onChange={handleChange} options={propertyOptions} error={errors.propertyId} placeholder="Select property" disabled={properties.length === 0}/>
        <Input name="date" label="Expense Date" type="date" value={expense.date || ''} onChange={handleChange} error={errors.date} />
        <Select name="category" label="Category" value={expense.category || ''} onChange={handleChange} options={categoryOptions} error={errors.category} />
        <Input name="description" label="Description" value={expense.description || ''} onChange={handleChange} error={errors.description} placeholder="e.g., Boiler repair parts" />
        <Input name="amount" label="Amount (£)" type="number" step="0.01" value={expense.amount || ''} onChange={handleAmountChange} error={errors.amount} />
        <Input name="vendor" label="Vendor (Optional)" value={expense.vendor || ''} onChange={handleChange} placeholder="e.g., PlumbQuick Ltd." />
        <Input name="receiptUrl" label="Receipt URL (Optional)" value={expense.receiptUrl || ''} onChange={handleChange} placeholder="Link to receipt image/PDF" />
        <Textarea name="notes" label="Notes (Optional)" value={expense.notes || ''} onChange={handleChange} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={properties.length === 0}>{initialData ? 'Save Changes' : 'Log Expense'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseForm;
  