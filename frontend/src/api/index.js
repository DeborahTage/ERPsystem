import api from './axios';

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
};

export const userApi = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/users/${id}/status`, { status }),
};

export const farmApi = {
  getAll: () => api.get('/api/farms'),
  getById: (id) => api.get(`/api/farms/${id}`),
  create: (data) => api.post('/api/farms', data),
  update: (id, data) => api.put(`/api/farms/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/farms/${id}/status`, { status }),
};

export const flockApi = {
  getAll: () => api.get('/api/flocks'),
  getById: (id) => api.get(`/api/flocks/${id}`),
  create: (data) => api.post('/api/flocks', data),
  update: (id, data) => api.put(`/api/flocks/${id}`, data),
  close: (id) => api.patch(`/api/flocks/${id}/close`),
};

export const dailyRecordApi = {
  getAll: (params) => api.get('/api/daily-farm-records', { params }),
  getById: (id) => api.get(`/api/daily-farm-records/${id}`),
  create: (data) => api.post('/api/daily-farm-records', data),
  update: (id, data) => api.put(`/api/daily-farm-records/${id}`, data),
};

export const inventoryApi = {
  getItems: () => api.get('/api/inventory/items'),
  getItem: (id) => api.get(`/api/inventory/items/${id}`),
  createItem: (data) => api.post('/api/inventory/items', data),
  updateItem: (id, data) => api.put(`/api/inventory/items/${id}`, data),
  stockIn: (data) => api.post('/api/inventory/stock-in', data),
  stockOut: (data) => api.post('/api/inventory/stock-out', data),
  getCurrentStock: () => api.get('/api/inventory/current-stock'),
  getLowStock: () => api.get('/api/inventory/low-stock'),
  getExpiryAlerts: () => api.get('/api/inventory/expiry-alerts'),
};

export const vetApi = {
  getVaccinations: () => api.get('/api/vet/vaccinations'),
  createVaccination: (data) => api.post('/api/vet/vaccinations', data),
  completeVaccination: (id) => api.patch(`/api/vet/vaccinations/${id}/complete`),
  getDiseaseCases: () => api.get('/api/vet/disease-cases'),
  createDiseaseCase: (data) => api.post('/api/vet/disease-cases', data),
  updateDiseaseCase: (id, data) => api.put(`/api/vet/disease-cases/${id}`, data),
  getTreatments: () => api.get('/api/vet/treatments'),
  createTreatment: (data) => api.post('/api/vet/treatments', data),
  getPrescriptions: () => api.get('/api/vet/prescriptions'),
  createPrescription: (data) => api.post('/api/vet/prescriptions', data),
  dispensePrescription: (id) => api.patch(`/api/vet/prescriptions/${id}/dispense`),
};

export const pharmacyApi = {
  getCustomers: () => api.get('/api/pharmacy/customers'),
  createCustomer: (data) => api.post('/api/pharmacy/customers', data),
  getSales: () => api.get('/api/pharmacy/sales'),
  createSale: (data) => api.post('/api/pharmacy/sales', data),
  getReceipt: (id) => api.get(`/api/pharmacy/sales/${id}/receipt`),
};

export const financeApi = {
  getAll: () => api.get('/api/finance/transactions'),
  create: (data) => api.post('/api/finance/transactions', data),
  getIncome: () => api.get('/api/finance/income'),
  getExpenses: () => api.get('/api/finance/expenses'),
  getProfitLoss: (params) => api.get('/api/finance/profit-loss', { params }),
};

export const crmApi = {
  getClients: () => api.get('/api/crm/clients'),
  getClient: (id) => api.get(`/api/crm/clients/${id}`),
  createClient: (data) => api.post('/api/crm/clients', data),
  updateClient: (id, data) => api.put(`/api/crm/clients/${id}`, data),
  getVisits: (params) => api.get('/api/crm/farm-visits', { params }),
  createVisit: (data) => api.post('/api/crm/farm-visits', data),
  getFollowUps: () => api.get('/api/crm/follow-ups'),
};

export const notificationApi = {
  getAll: () => api.get('/api/notifications'),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`),
};

export const dashboardApi = {
  admin: () => api.get('/api/dashboard/admin'),
  farmManager: () => api.get('/api/dashboard/farm-manager'),
  store: () => api.get('/api/dashboard/store'),
  vet: () => api.get('/api/dashboard/vet'),
  pharmacy: () => api.get('/api/dashboard/pharmacy'),
  finance: () => api.get('/api/dashboard/finance'),
};
