import { LucideIcon } from "lucide-react";

// UI конфигурации
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
}

export type StatusesUI = Record<string, StatusConfig>;

export type StatusGroupMap = Record<string, string[]>;

export type GroupTitleMap = Record<string, string>;

// Данные статистики
export interface StatsData {
  profit: number;
  count: number;
  received: number;
  outlay: number;
  receivedworker: number;
}

export interface ProfitStatsData {
  totalProfit: number;
  receivedworker: number;
  outlay: number;
  count: number;
  received: number;
}

export interface GoalData {
  day: number;
  month: number;
  all: number;
}

export interface LeafletStatsData {
  IN_PROCESS: number;
  FORPAYMENT: number;
  DONE: number;
  CANCELLED: number;
  DECLINED: number;
  totalDistributorProfitTOpay: number;
  totalDistributorProfitPaid: number;
}

export interface StatusCounts {
  PENDING: number;
  ON_THE_WAY: number;
  IN_PROGRESS: number;
  IN_PROGRESS_SD: number;
  CANCELLED: number;
  COMPLETED: number;
}

// Пропсы компонентов
export interface StatCardProps {
  title: string;
  stats: StatsData;
  target: number;
  icon: React.ReactNode;
  gradient: string;
}

export interface StatusGroupCardProps {
  groupKey: string;
  statuses: string[];
  totalCount: number;
  statusCounts: StatusCounts;
}