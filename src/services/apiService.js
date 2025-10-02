const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

export const apiService = {
  async getEmployees() {
    const res = await fetch(`${BASE_URL}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  async getEmployeeById(employeeId) {
    const res = await fetch(`${BASE_URL}/employees/${employeeId}`);
    if (!res.ok) throw new Error('Failed to fetch employee');
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
  },

  async searchEmployees(q, page = 1, pageSize = 10, sort) {
    const url = new URL(`${BASE_URL}/employees/search`);
    if (q) url.searchParams.set('q', q);
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));
    if (sort) url.searchParams.set('sort', String(sort));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to search employees');
    return res.json();
  },

  async imageMeta(employeeId) {
    const res = await fetch(`${BASE_URL}/employees/${employeeId}/image/meta`);
    if (!res.ok) return { mimeType: null, sizeBytes: null };
    return res.json();
  },

  async documentMeta(employeeId) {
    const res = await fetch(`${BASE_URL}/employees/${employeeId}/document/meta`);
    if (!res.ok) return { mimeType: null, sizeBytes: null };
    return res.json();
  },

  imageUrl(employeeId) {
    if (!employeeId) return '';
    return `${BASE_URL}/files/employees/${employeeId}/image`;
  },

  documentUrl(employeeId) {
    if (!employeeId) return '';
    return `${BASE_URL}/files/employees/${employeeId}/document`;
  }
};

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}


