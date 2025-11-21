
import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../../types';
import PageHeader from '../PageHeader';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, InformationCircleIcon, ArrowPathIcon, CheckCircleIcon, CloudArrowUpIcon, TrashIcon } from '../icons/HeroIcons'; 
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

const SyncCalendarModal = ({ isOpen, onClose, connectedProviders, onConnect, onDisconnect }: { 
    isOpen: boolean; 
    onClose: () => void;
    connectedProviders: string[];
    onConnect: (providerId: string) => void;
    onDisconnect: (providerId: string) => void;
}) => {
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    const providers = [
        { id: 'google', name: 'Google Calendar', color: 'bg-blue-600' },
        { id: 'apple', name: 'Apple Calendar (iCloud)', color: 'bg-gray-800' },
        { id: 'outlook', name: 'Microsoft Outlook', color: 'bg-sky-600' },
    ];

    const handleConnectClick = (providerId: string) => {
        setLoadingProvider(providerId);
        // Simulate API latency
        setTimeout(() => {
            onConnect(providerId);
            setLoadingProvider(null);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sync External Calendars" size="md">
            <div className="space-y-6">
                <p className="text-sm text-zinc-500">
                    Connect your external calendars to automatically sync viewing appointments, inspections, and reminders.
                </p>
                <div className="space-y-3">
                    {providers.map(provider => {
                        const isConnected = connectedProviders.includes(provider.id);
                        const isLoading = loadingProvider === provider.id;

                        return (
                            <div key={provider.id} className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 transition-colors">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 ${provider.color}`}>
                                        {provider.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-zinc-900 text-sm">{provider.name}</h4>
                                        <p className="text-xs text-zinc-500">
                                            {isConnected ? 'Sync Active' : 'Not Connected'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {isLoading ? (
                                        <Spinner className="w-5 h-5 text-zinc-400" />
                                    ) : isConnected ? (
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                                                <CheckCircleIcon className="w-3 h-3 mr-1" /> Connected
                                            </span>
                                            <button 
                                                onClick={() => onDisconnect(provider.id)}
                                                className="text-zinc-400 hover:text-red-500 transition-colors"
                                                title="Disconnect"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleConnectClick(provider.id)}
                                        >
                                            Connect
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-start">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                        <strong>Note:</strong> Synchronization is two-way. Events created in Doorap will appear on your external calendar, and availability will be checked against your external calendar to prevent double bookings.
                    </p>
                </div>
                <div className="flex justify-end pt-2">
                    <Button onClick={onClose}>Done</Button>
                </div>
            </div>
        </Modal>
    );
};

const CalendarPage: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday...

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    if (event.link) {
        navigate(event.link);
    }
  };

  const handleConnectProvider = (id: string) => {
      setConnectedProviders(prev => [...prev, id]);
  };

  const handleDisconnectProvider = (id: string) => {
      setConnectedProviders(prev => prev.filter(p => p !== id));
  };

  const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(event => {
      const dateStr = new Date(event.start).toISOString().split('T')[0];
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(event);
    });
    return map;
  }, [events]);

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    let firstDay = firstDayOfMonth(year, month); 

    const today = new Date();
    today.setHours(0,0,0,0);

    const dayCells = [];
    for (let i = 0; i < firstDay; i++) { 
      dayCells.push(<div key={`empty-${i}`} className="border border-neutral-light p-2 h-32 bg-zinc-50/30"></div>);
    }

    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = eventsByDate.get(dateStr) || [];
      const isToday = date.getTime() === today.getTime();

      dayCells.push(
        <div key={day} className={`border border-neutral-light p-2 h-32 overflow-y-auto transition-colors hover:bg-zinc-50 ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-1">
            <div className={`font-semibold text-sm w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-neutral-dark'}`}>{day}</div>
            {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>}
          </div>
          <ul className="text-xs space-y-1">
            {dayEvents.slice(0, 3).map(event => ( // Show first 3 events
              <li 
                key={event.id} 
                className={`px-1.5 py-1 rounded truncate cursor-pointer hover:opacity-80 font-medium`}
                style={{ backgroundColor: event.color ? `${event.color}15` : '#e0e7ff', color: event.color || '#4338ca', borderLeft: `2px solid ${event.color || '#4338ca'}` }}
                title={event.title}
                onClick={() => handleEventClick(event)}
              >
                {event.title}
              </li>
            ))}
            {dayEvents.length > 3 && <li className="text-zinc-400 text-[10px] text-center font-medium">+{dayEvents.length - 3} more</li>}
          </ul>
        </div>
      );
    }
    return dayCells;
  };
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="animate-slide-in-left h-full flex flex-col">
      <PageHeader 
        title="Calendar" 
        subtitle="View your scheduled events, reminders, and deadlines." 
        actions={
            <Button variant="outline" onClick={() => setIsSyncModalOpen(true)} leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>
                Sync Calendar
            </Button>
        }
      />
      
      {connectedProviders.length > 0 && (
          <div className="mb-4 flex items-center gap-2 px-1">
              <span className="text-xs font-medium text-zinc-500">Synced with:</span>
              {connectedProviders.map(p => (
                  <span key={p} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 capitalize">
                      <CloudArrowUpIcon className="w-3 h-3 mr-1"/> {p}
                  </span>
              ))}
          </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200">
          <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-zinc-900">{monthYearString}</h2>
          <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center font-semibold text-xs py-3 text-zinc-500 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr flex-1 overflow-y-auto">
            {renderCalendarGrid()}
        </div>
        
        {events.length === 0 && (
             <div className="p-4 bg-yellow-50 border-t border-yellow-100 flex items-center justify-center text-yellow-800 text-sm">
                <InformationCircleIcon className="w-5 h-5 mr-2"/>
                No events to display for this month.
            </div>
        )}
      </div>

      <SyncCalendarModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)}
        connectedProviders={connectedProviders}
        onConnect={handleConnectProvider}
        onDisconnect={handleDisconnectProvider}
      />
    </div>
  );
};

export default CalendarPage;
