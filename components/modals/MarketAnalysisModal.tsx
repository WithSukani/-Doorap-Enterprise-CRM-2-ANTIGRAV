
import React, { useState, useEffect } from 'react';
import { Property, Tenant, MarketAnalysis } from '../../types';
import { getMarketAnalysis } from '../ai/gemini';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { 
    InformationCircleIcon, CurrencyDollarIconSolid, BanknotesIcon, ChartPieIcon, 
    ArrowTrendingUpIcon, ClockIcon, SparklesIcon, LightBulbIcon, MapPinIcon, IconProps 
} from '../icons/HeroIcons';

interface MarketAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  tenants: Tenant[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string | null;
  icon: React.ReactElement<IconProps>;
  colorClass?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext = null, icon, colorClass = 'text-zinc-900' }) => (
    <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex items-start space-x-4">
        <div className={`p-3 bg-zinc-50 rounded-md border border-zinc-100 text-zinc-500`}>
             {React.cloneElement(icon, { className: `w-5 h-5` })}
        </div>
        <div>
            <h4 className="text-sm font-medium text-zinc-500">{title}</h4>
            <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
            {subtext && <p className="text-xs text-zinc-400 mt-1">{subtext}</p>}
        </div>
    </div>
);

interface AnalysisSectionProps {
    title: string;
    children: React.ReactNode;
    icon: React.ReactElement<IconProps>;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ title, children, icon }) => (
    <section className="animate-fade-in">
        <h3 className="flex items-center text-base font-semibold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">
            {React.cloneElement(icon, {className: "w-5 h-5 mr-2 text-zinc-500"})}
            {title}
        </h3>
        {children}
    </section>
)

const MarketAnalysisModal: React.FC<MarketAnalysisModalProps> = ({ isOpen, onClose, property, tenants }) => {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && property) {
      const fetchAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
          const result = await getMarketAnalysis(property, tenants);
          setAnalysis(result);
        } catch (err: any) {
          setError(err.message || 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnalysis();
    }
  }, [isOpen, property, tenants]);

  const getDemandStyling = (demandLevel: 'Low' | 'Medium' | 'High') => {
      switch (demandLevel) {
          case 'High': return 'text-green-600';
          case 'Medium': return 'text-blue-600';
          case 'Low': return 'text-orange-600';
          default: return 'text-zinc-900';
      }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-80">
          <Spinner />
          <p className="mt-4 text-zinc-500 font-medium">Generating deep market analysis...</p>
          <p className="text-xs text-zinc-400 mt-1">This uses Dori's capabilities and may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <h3 className="font-semibold mb-2">Error Generating Analysis</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (analysis) {
        const rentComparisonText = analysis.rentComparisonPercentage !== undefined 
            ? `${Math.abs(analysis.rentComparisonPercentage)}% ${analysis.rentComparisonPercentage >= 0 ? 'above' : 'below'} market`
            : "No current rent data.";

      return (
        <div className="space-y-8">
            <AnalysisSection title="Key Valuations" icon={<CurrencyDollarIconSolid/>}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard 
                        title="Est. Sale Price"
                        value={`£${analysis.estimatedSalePrice.toLocaleString()}`}
                        icon={<BanknotesIcon />}
                        colorClass="text-zinc-900"
                    />
                    <MetricCard 
                        title="Est. Monthly Rent"
                        value={`£${analysis.estimatedAverageRent.toLocaleString()}`}
                        subtext={rentComparisonText}
                        icon={<BanknotesIcon />}
                        colorClass="text-zinc-900"
                    />
                    <MetricCard 
                        title="Est. Gross Yield"
                        value={`${analysis.estimatedYieldPercentage.toFixed(2)}%`}
                        icon={<ChartPieIcon />}
                        colorClass="text-zinc-900"
                    />
                </div>
            </AnalysisSection>
            
            <AnalysisSection title="Market Dynamics" icon={<ArrowTrendingUpIcon/>}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <MetricCard 
                        title="Rental Demand"
                        value={analysis.localMarketDemand}
                        icon={<ArrowTrendingUpIcon />}
                        colorClass={getDemandStyling(analysis.localMarketDemand)}
                    />
                    <MetricCard 
                        title="Avg. Time to Let"
                        value={`${analysis.averageTimeToLetDays} days`}
                        icon={<ClockIcon />}
                        colorClass="text-zinc-900"
                    />
                </div>
                <div className="p-4 bg-zinc-50 rounded-md border border-zinc-100">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Market Trend Summary</p>
                  <p className="text-sm text-zinc-700 leading-relaxed">{analysis.marketTrendSummary}</p>
                </div>
            </AnalysisSection>

             <AnalysisSection title="Local Insights" icon={<MapPinIcon />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 rounded-md border border-zinc-100">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Key Amenities</h4>
                        <ul className="space-y-2">
                            {analysis.keyAmenities.map((amenity, index) => (
                                <li key={index} className="flex items-start text-sm text-zinc-700">
                                    <SparklesIcon className="w-4 h-4 mr-2 mt-0.5 text-zinc-400 flex-shrink-0"/>
                                    <span>{amenity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="p-4 bg-zinc-50 rounded-md border border-zinc-100">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Area Analysis</h4>
                        <p className="text-sm text-zinc-700 leading-relaxed">{analysis.areaAnalysis}</p>
                    </div>
                </div>
            </AnalysisSection>

            <AnalysisSection title="Investment Outlook" icon={<LightBulbIcon />}>
                 <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-900 leading-relaxed font-medium">{analysis.investmentSummary}</p>
                </div>
            </AnalysisSection>

        </div>
      );
    }

    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Dori's Market Analysis: ${property?.address}`} size="xl">
      <div className="p-1">
        <div className="flex items-start text-sm text-zinc-600 bg-zinc-50 p-4 rounded-md mb-6 border border-zinc-100">
          <InformationCircleIcon className="w-5 h-5 mr-3 text-zinc-400 flex-shrink-0 mt-0.5" />
          <span>This analysis is generated by Dori based on simulated market data. It provides estimates and trends for informational purposes.</span>
        </div>
        {renderContent()}
      </div>
    </Modal>
  );
};

export default MarketAnalysisModal;