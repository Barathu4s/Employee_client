const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

export const apiService = {
  async getEmployees() {
    const res = await fetch(`${BASE_URL}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  async createEmployee(employee, files) {
    const form = new FormData();
    Object.entries(employee).forEach(([k, v]) => form.append(k, String(v)));
    if (files?.image) form.append('image', files.image);
    if (files?.document) form.append('document', files.document);
    const res = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.error || 'Failed to create employee');
    }
    return res.json();
  },

  async updateEmployee(employeeId, employee, files) {
    const form = new FormData();
    Object.entries(employee).forEach(([k, v]) => form.append(k, String(v)));
    if (files?.image) form.append('image', files.image);
    if (files?.document) form.append('document', files.document);
    const res = await fetch(`${BASE_URL}/employees/${employeeId}`, {
      method: 'PUT',
      body: form
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.error || 'Failed to update employee');
    }
    return res.json();
  },

  async deleteEmployee(employeeId) {
    const res = await fetch(`${BASE_URL}/employees/${employeeId}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.error || 'Failed to delete employee');
    }
    return true;
  },

  async isEmailUnique(email, excludeId = null) {
    if (!email) return true;
    const url = new URL(`${BASE_URL}/employees/check-email`);
    url.searchParams.set('email', String(email).trim().toLowerCase());
    if (excludeId != null) url.searchParams.set('excludeId', String(excludeId));
    const res = await fetch(url.toString());
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.isUnique);
  }
};

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}


