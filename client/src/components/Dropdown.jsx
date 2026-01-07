import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dropdown = ({ trigger, items, align = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (action) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {trigger}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${align === 'right' ? 'right-0' : 'left-0'
                            } mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50`}
                    >
                        {items.map((item, index) => (
                            <React.Fragment key={index}>
                                {item.divider ? (
                                    <div className="my-1 border-t border-gray-100" />
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault(); // Added default prevention
                                            e.stopPropagation();
                                            handleItemClick(item.action);
                                        }}
                                        disabled={item.disabled}
                                        className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${item.disabled
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : item.danger
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.icon && <item.icon size={16} className="mr-3" />}
                                        {item.label}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;
