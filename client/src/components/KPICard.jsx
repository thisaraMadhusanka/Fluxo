import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const KPICard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={clsx("p-3 rounded-xl bg-opacity-10", `bg-${color} text-${color}`)}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={clsx("text-sm font-medium px-2 py-1 rounded-full",
                        trend > 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold mt-1 text-text-primary">{value}</p>
        </motion.div>
    );
};

export default KPICard;
