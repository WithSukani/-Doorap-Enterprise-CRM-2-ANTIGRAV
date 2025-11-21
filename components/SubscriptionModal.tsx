
import React from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { SUBSCRIPTION_PLANS } from '../constants';
import { CheckCircleIcon } from './icons/HeroIcons';

interface SubscriptionModalProps {
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Subscription Plans" size="xl">
      <div className="space-y-6">
        <p className="text-neutral-DEFAULT text-center">
          Choose the plan that best fits your property management needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`p-6 rounded-lg shadow-lg border-2 ${plan.highlight ? 'border-primary bg-primary-light/10' : 'border-neutral-light bg-white'} flex flex-col`}
            >
              {plan.highlight && (
                <div className="text-xs font-semibold text-primary bg-primary-light/30 px-3 py-1 rounded-full self-start mb-3">
                  POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold text-neutral-dark mb-2">{plan.name}</h3>
              <p className="text-3xl font-extrabold text-primary mb-1">
                {plan.priceDisplay}
                {plan.pricePerMonth && <span className="text-base font-normal text-neutral-DEFAULT">/month</span>}
              </p>
              {plan.pricePerMonth && <p className="text-xs text-neutral-DEFAULT mb-4">Billed monthly. VAT may apply.</p>}
              {!plan.pricePerMonth && <p className="text-xs text-neutral-DEFAULT mb-4">Get a personalized quote.</p>}

              <ul className="space-y-2 mb-6 text-sm text-neutral-dark flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-primary-dark mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant={plan.highlight ? 'primary' : 'outline'} 
                className="w-full mt-auto"
                onClick={() => alert(`Selected plan: ${plan.name}`)}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-neutral-DEFAULT">
          Need something different? <a href="#" className="text-primary hover:underline">Contact us</a> for custom solutions.
        </p>
      </div>
    </Modal>
  );
};

export default SubscriptionModal;