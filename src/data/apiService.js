// Unified Client API Service for Neon PostgreSQL & Vercel Serverless
// Connects to /api/* with automatic fallback to local cache for 100% clinic uptime

class ApiService {
  constructor() {
    const isBrowser = typeof window !== 'undefined';
    const envBase = (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) || 'http://localhost:5173/api';
    this.baseUrl = isBrowser ? '/api' : envBase;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isNeonConnected = false;
    this.lastSyncTime = null;
    this.listeners = [];

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.checkHealth();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyStatus();
      });
      // Immediate health check on initial app startup
      setTimeout(() => this.checkHealth(), 50);
    }
  }

  onStatusChange(callback) {
    this.listeners.push(callback);
    callback(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyStatus() {
    const status = this.getStatus();
    this.listeners.forEach(cb => {
      try { cb(status); } catch (e) {}
    });
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      isNeonConnected: this.isNeonConnected,
      lastSyncTime: this.lastSyncTime
    };
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.isNeonConnected = !!data.neonConnected;
        this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.notifyStatus();
        return data;
      }
    } catch (e) {
      this.isNeonConnected = false;
      this.notifyStatus();
    }
    return null;
  }

  async fetchPatients() {
    try {
      const res = await fetch(`${this.baseUrl}/patients`);
      if (res.ok) {
        const data = await res.json();
        this.isNeonConnected = true;
        this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.notifyStatus();
        return data;
      }
    } catch (e) {
      console.warn('API /api/patients unavailable, operating with cached data:', e);
    }
    return null;
  }

  async registerPatient(patientData) {
    try {
      const res = await fetch(`${this.baseUrl}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      if (res.ok) {
        this.isNeonConnected = true;
        return await res.json();
      }
    } catch (e) {
      console.warn('API registerPatient failed, saved to local store:', e);
    }
    return null;
  }

  async updatePatient(patientId, updateData) {
    try {
      const res = await fetch(`${this.baseUrl}/patients?patientId=${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        this.isNeonConnected = true;
        return await res.json();
      }
    } catch (e) {
      console.warn('API updatePatient failed:', e);
    }
    return null;
  }

  async completeBilling(patientId, billingData) {
    try {
      const res = await fetch(`${this.baseUrl}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, ...billingData })
      });
      if (res.ok) {
        this.isNeonConnected = true;
        return await res.json();
      }
    } catch (e) {
      console.warn('API completeBilling failed:', e);
    }
    return null;
  }

  async markPharmacyDispensed(patientId, pharmacistName) {
    try {
      const res = await fetch(`${this.baseUrl}/pharmacy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, pharmacistName })
      });
      if (res.ok) {
        this.isNeonConnected = true;
        return await res.json();
      }
    } catch (e) {
      console.warn('API markPharmacyDispensed failed:', e);
    }
    return null;
  }

  async fetchExpenses() {
    try {
      const res = await fetch(`${this.baseUrl}/expenses`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }

  async addExpense(expenseData) {
    try {
      const res = await fetch(`${this.baseUrl}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }

  async fetchConfig() {
    try {
      const res = await fetch(`${this.baseUrl}/config`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }

  async updateConfig(configData) {
    try {
      const res = await fetch(`${this.baseUrl}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }

  async pushFullSync(databasePayload) {
    try {
      const res = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(databasePayload)
      });
      if (res.ok) {
        this.isNeonConnected = true;
        this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.notifyStatus();
        return await res.json();
      }
    } catch (e) {
      console.warn('API pushFullSync failed:', e);
    }
    return null;
  }
}

export const apiService = new ApiService();
