import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, User, Users } from 'lucide-react';

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
}

export const CustomSelect = ({ value, onChange, options, placeholder }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={selectRef}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full min-w-[300px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-900/90 to-black border border-purple-500/30 text-gray-200 focus:outline-none hover:border-purple-500/50 transition-all duration-300 flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-400" />
                    <span>{value === 'All Users' ? placeholder || 'All Users' : value}</span>
                </div>
                <ChevronDown
                    size={20}
                    className={`text-purple-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 rounded-xl bg-gradient-to-r from-gray-900/90 to-black border border-purple-500/30 shadow-lg shadow-purple-500/10 overflow-hidden"
                    >
                        <div className="sticky top-0 p-2 bg-gradient-to-r from-gray-900/90 to-black border-b border-purple-500/30">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/40 border border-purple-500/30 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
                                    placeholder="Search users..."
                                />
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                            {filteredOptions.length === 0 ? (
                                <div className="flex items-center justify-center gap-2 p-4 text-gray-400">
                                    <User size={16} className="text-purple-400" />
                                    <span>No users found</span>
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <motion.button
                                        key={`${option}-${index}`}
                                        whileHover={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                                        onClick={() => {
                                            onChange(option);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-gray-200 hover:text-purple-400 transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <User size={16} className="text-purple-400" />
                                        {option}
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
