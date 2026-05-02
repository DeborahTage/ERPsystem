export const ROLES = {
  ADMIN: 'ADMIN',
  GENERAL_MANAGER: 'GENERAL_MANAGER',
  OPERATIONS_MANAGER: 'OPERATIONS_MANAGER',
  FARM_MANAGER: 'FARM_MANAGER',
  VETERINARY_OFFICER: 'VETERINARY_OFFICER',
  STORE_KEEPER: 'STORE_KEEPER',
  PHARMACY_SALES: 'PHARMACY_SALES',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  EXTENSION_WORKER: 'EXTENSION_WORKER',
};

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER];

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount || 0);

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-GB') : '-';

export const statusBadge = (status) => {
  const map = {
    ACTIVE: 'success', INACTIVE: 'secondary', CLOSED: 'dark',
    PENDING: 'warning', DISPENSED: 'success', CANCELLED: 'danger',
    SCHEDULED: 'primary', COMPLETED: 'success', MISSED: 'danger',
    LEAD: 'info', LOST: 'danger', LOW: 'success', MODERATE: 'warning',
    HIGH: 'danger', CRITICAL: 'dark', CONTROLLED: 'warning', RESOLVED: 'success',
  };
  return map[status] || 'secondary';
};
