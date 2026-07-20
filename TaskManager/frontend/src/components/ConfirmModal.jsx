import React from "react";
const ConfirmModal=({show,onClose,onConfirm})=>{
    if(!show) return null;
    return(
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg text-center">
                <h2 className="text-lg">
                    Are you sure you want to create this task?
                </h2>
                <div>
                    <button className="px-2 py-2" onClick={onClose}>
                        No
                    </button>
                    <button className="px-2 py-2" onClick={onConfirm}>
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmModal;