import { createContext, useState } from 'react';

export type TariffModalDataType = {
  grade: string;
  description: string;
  price: number;
};

export type PaymentModalDataType = {
  price: number;
  id: string;
  description: string;
};

export interface IModalState {
  itemId: string;
  setItemId: (grade: string) => void;
  grade: string;
  setGrade: (grade: string) => void;
  tariffModalData?: TariffModalDataType[] | [];
  setTariffModalData: (data: []) => void;
  paymentModalData?: PaymentModalDataType[] | [];
  setPaymentModalData: (data: []) => void;
  setPaymentModalOpen: (open: boolean) => void;
  paymentModalOpen: boolean;
  modelsModalOpen: boolean;
  setModelsModalOpen: (open: boolean) => void;
  tariffModalOpen: boolean;
  setTariffModalOpen: (open: boolean) => void;
  payBalanceModalOpen: boolean;
  setPayBalanceModalOpen: (open: boolean) => void;
  // Unified billing entry point — открывает BillingModal с двумя вариантами:
  // подписка PRO (→ TariffModal) и пакеты запросов (→ PayBalanceModal).
  billingModalOpen: boolean;
  setBillingModalOpen: (open: boolean) => void;
  authorizationModalOpen: boolean;
  setAuthorizationModalOpen: (open: boolean) => void;
  sideBarOpen: boolean;
  setSideBarOpen: (open: boolean) => void;
  userEditOpen: boolean;
  setUserEditOpen: (open: boolean) => void;
  userDetailOpen: boolean;
  setUserDetailOpen: (open: boolean) => void;
  youTubeModalOpen: boolean;
  setYouTubeModalOpen: (open: boolean) => void;
  avitoAgentCreateOpen: boolean;
  setAvitoAgentCreateOpen: (open: boolean) => void;
  bestSearchModalOpen: boolean;
  setBestSearchModalOpen: (open: boolean) => void;
  hrAgentUpdateModalOpen: boolean;
  setHrAgentUpdateModalOpen: (open: boolean) => void;
}

export const ModalContext = createContext<Partial<IModalState>>({});
