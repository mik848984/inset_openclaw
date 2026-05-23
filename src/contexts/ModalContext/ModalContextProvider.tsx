import React, { useState } from 'react';
import { ModalContext } from '@/contexts/ModalContext/index';
import PaymentModal from '@/components/modals/PaymentModal';
import ModelsModal from '@/components/modals/ModelsModal';
import TariffModal from '@/components/modals/TariffModal';
import PayBalanceModal from '@/components/modals/PayBalanceModal';
import { useUser } from '@/utils/hooks/useUser';
import AuthorizationModal from '@/components/modals/AuthorizationModal';
import UserEditModal from '@/components/modals/UserEditModal';
import DetailUserModal from '@/components/modals/DetailUserModal';
import YouTubeModal from '@/components/modals/YouTubeModal';
import AvitoAgentCreateModal from '../../components/modals/HrAgentCreateModal';
import BestSearchHrModal from '@/components/modals/BestSearchModal';
import HrAgentUpdateModal from '@/components/modals/HrAgentUpdateModal';
import BillingModal from '@/components/modals/BillingModal';

interface IProps {
  children: React.ReactNode;
}

function ModalContextProvider({ children }: IProps) {
  const [grade, setGrade] = useState('');
  const [itemId, setItemId] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [tariffModalData, setTariffModalData] = useState([]);
  const [paymentModalData, setPaymentModalData] = useState([]);
  const [modelsModalOpen, setModelsModalOpen] = useState(false);
  const [tariffModalOpen, setTariffModalOpen] = useState(false);
  const [payBalanceModalOpen, setPayBalanceModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [authorizationModalOpen, setAuthorizationModalOpen] = useState(false);
  const [youTubeModalOpen, setYouTubeModalOpen] = useState(false);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [userEditOpen, setUserEditOpen] = useState(false);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [avitoAgentCreateOpen, setAvitoAgentCreateOpen] = useState(false);
  const [bestSearchModalOpen, setBestSearchModalOpen] = useState(false);
  const [hrAgentUpdateModalOpen, setHrAgentUpdateModalOpen] = useState(false);

  useUser();

  const onCloseAfterRedirect = () => {
    setPayBalanceModalOpen(false);
    setTariffModalOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        itemId,
        setItemId: (id) => {
          setItemId(id);
          setGrade('');
        },
        grade,
        setGrade: (grade) => {
          setGrade(grade);
          setItemId('');
        },
        tariffModalData,
        setTariffModalData,
        paymentModalData,
        setPaymentModalData,
        paymentModalOpen,
        setPaymentModalOpen,
        modelsModalOpen,
        setModelsModalOpen,
        tariffModalOpen,
        setTariffModalOpen,
        payBalanceModalOpen,
        setPayBalanceModalOpen,
        billingModalOpen,
        setBillingModalOpen,
        authorizationModalOpen,
        setAuthorizationModalOpen,
        sideBarOpen,
        setSideBarOpen,
        userEditOpen,
        setUserEditOpen,
        userDetailOpen,
        setUserDetailOpen,
        youTubeModalOpen,
        setYouTubeModalOpen,
        avitoAgentCreateOpen,
        setAvitoAgentCreateOpen,
        bestSearchModalOpen,
        setBestSearchModalOpen,
        hrAgentUpdateModalOpen,
        setHrAgentUpdateModalOpen,
      }}
    >
      {children}
      <ModelsModal
        onClose={() => setModelsModalOpen(false)}
        open={modelsModalOpen}
      />
      <TariffModal
        onClose={() => setTariffModalOpen(false)}
        open={tariffModalOpen}
      />

      <DetailUserModal
        onClose={() => setUserDetailOpen(false)}
        open={userDetailOpen}
      />
      <UserEditModal
        onClose={() => {
          setUserEditOpen(false);
          setUserDetailOpen(true);
        }}
        open={userEditOpen}
      />
      <PayBalanceModal
        onClose={() => setPayBalanceModalOpen(false)}
        open={payBalanceModalOpen}
      />
      <BillingModal
        onClose={() => setBillingModalOpen(false)}
        open={billingModalOpen}
      />
      <PaymentModal
        itemId={itemId}
        grade={grade}
        onClose={() => {
          setPaymentModalOpen(false);
          onCloseAfterRedirect();
        }}
        open={paymentModalOpen}
      />
      <AuthorizationModal
        onCloseAfterRedirect={onCloseAfterRedirect}
        onClose={() => setAuthorizationModalOpen(false)}
        open={authorizationModalOpen}
      />
      <YouTubeModal
        onClose={() => setYouTubeModalOpen(false)}
        open={youTubeModalOpen}
      />
      <AvitoAgentCreateModal
        onClose={() => setAvitoAgentCreateOpen(false)}
        open={avitoAgentCreateOpen}
      />
      <BestSearchHrModal
        onClose={() => setBestSearchModalOpen(false)}
        open={bestSearchModalOpen}
      />
      <HrAgentUpdateModal
        onClose={() => setHrAgentUpdateModalOpen(false)}
        open={hrAgentUpdateModalOpen}
      />
    </ModalContext.Provider>
  );
}

export default ModalContextProvider;
