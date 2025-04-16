import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="flex justify-center dark:bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>

    );
};

export default Loader;
