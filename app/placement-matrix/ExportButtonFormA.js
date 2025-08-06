'use client';

import * as allExports from "./exportExcelFormA";

export default function ExportButtonFormA() {
    const handleClick = async () => {
        console.log('Button clicked');
        console.log('Function exists:', !!allExports.exportFormAtoExcel);
        
        try {
            console.log('About to call exportFormAtoExcel...');
            await allExports.exportFormAtoExcel();
            console.log('Function completed successfully');
        } catch (error) {
            console.error('Error in exportFormAtoExcel:', error);
            console.error('Error stack:', error.stack);
        }
    };
    
    return (
        <button
            onClick={handleClick}
            className="cursor-pointer bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 px-4 py-2 font-semibold shadow"
        >
            Download Format A 
        </button>
    );
}