
"use client";
import React from "react";
import VendorHeader from "@/components/vendor/VendorHeader";
import HallModal from "@/components/vendor/HallModal";
import { UIProvider, useUI } from "@/context/UIContext";

const TempModalPageContent = () => {
    const { isHallModalOpen, closeHallModal } = useUI();

    const handleSubmit = (formData: any) => {
        console.log("Form submitted:", formData);
        closeHallModal();
    };

    return (
        <div>
            <VendorHeader />
            <HallModal
                isOpen={isHallModalOpen}
                onClose={closeHallModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
};


const TempModalPage = () => {
    return (
        <UIProvider>
            <TempModalPageContent />
        </UIProvider>
    );
};

export default TempModalPage;
