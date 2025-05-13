import { useState } from "react";
import { useTranslation } from "react-i18next";
import EmergencyModal from "./EmergencyModal";

const EmergencyButton = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleOpenModal}
          className="emergency-button flex items-center justify-center px-4 py-3 bg-destructive text-white rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <span className="ri-alarm-warning-fill mr-2 text-xl"></span>
          <span className="font-medium">{t('emergency.needHelp')}</span>
        </button>
      </div>

      <EmergencyModal isVisible={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default EmergencyButton;
