import {
  collectionTrend,
  dashboardMetrics,
  overdueAlerts,
  quickActions,
  recentPayments,
  statusDistribution,
  upcomingDues,
} from "../../data/dashboardData";

const createDelay = (result) =>
  new Promise((resolve) => setTimeout(() => resolve(result), 300));

export function getDashboardMetrics() {
  return createDelay(dashboardMetrics);
}

export function getCollectionTrend() {
  return createDelay(collectionTrend);
}

export function getStatusDistribution() {
  return createDelay(statusDistribution);
}

export function getRecentPayments() {
  return createDelay(recentPayments);
}

export function getUpcomingDues() {
  return createDelay(upcomingDues);
}

export function getOverdueAlerts() {
  return createDelay(overdueAlerts);
}

export function getQuickActions() {
  return createDelay(quickActions);
}
