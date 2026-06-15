import {
  customers,
  dashboardSummary,
  loans,
  payments,
} from "../../data/mockData";

const createDelay = (result) =>
  new Promise((resolve) => setTimeout(() => resolve(result), 250));

export function getDashboardData() {
  return createDelay(dashboardSummary);
}

export function getCustomers() {
  return createDelay(customers);
}

export function getLoans() {
  return createDelay(loans);
}

export function getPayments() {
  return createDelay(payments);
}
