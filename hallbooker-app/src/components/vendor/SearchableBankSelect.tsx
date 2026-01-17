import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Bank {
  name: string;
  code: string;
}

interface SearchableBankSelectProps {
  banks: Bank[];
  onSelect: (bank: Bank) => void;
  selectedBankCode?: string;
  disabled?: boolean;
}

const SearchableBankSelect: React.FC<SearchableBankSelectProps> = ({
  banks,
  onSelect,
  selectedBankCode,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedBank = banks.find(b => b.code === selectedBankCode);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'hover:border-gray-400'}`}
      >
        <span className={selectedBank ? 'text-gray-900' : 'text-gray-500'}>
          {selectedBank ? selectedBank.name : 'Select a bank'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search banks..."
                className="w-full pl-9 pr-4 py-2 text-sm border-none focus:ring-0 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredBanks.length > 0 ? (
              filteredBanks.map((bank) => (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => {
                    onSelect(bank);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className={`text-sm ${selectedBankCode === bank.code ? 'font-semibold text-primary' : 'text-gray-700'}`}>
                    {bank.name}
                  </span>
                  {selectedBankCode === bank.code && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No banks found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableBankSelect;
