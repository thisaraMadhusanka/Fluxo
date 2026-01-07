import React from 'react';

const ComingSoon = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h1 className="text-2xl font-bold text-gray-300 mb-2">{title || 'Coming Soon'}</h1>
            <p className="text-gray-400">This feature is under development.</p>
        </div>
    );
};

export default ComingSoon;
