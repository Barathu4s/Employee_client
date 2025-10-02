import React, { useState, useEffect } from 'react';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import { apiService } from './services/apiService';

function App() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(''); 

  // initial load
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.searchEmployees('', 1, 5, sortBy);
        setEmployees(res.items);
        setTotal(res.total);
        setPage(1);
      } catch (e) {
        console.error(e);
        alert('Failed to load employees');
      }
    };
    load();
  }, []);

  const reloadPage = async (targetPage = page) => {
    const q = searchQuery.trim();
    const res = await apiService.searchEmployees(q, targetPage, rowsPerPage, sortBy);
    setEmployees(res.items || []);
    setTotal(res.total || 0);
    setPage(targetPage);
  };

  const handleAddEmployee = async (employeeData, files) => {
    try {
      await apiService.createEmployee(employeeData, files);
      await reloadPage(1); // after add, reload first page (5 per page)
      setShowForm(false);
      alert('Employee added successfully!');
    } catch (e) {
      alert(e?.message || 'Error adding employee. Please try again.');
    }
  };

  const handleUpdateEmployee = async (employeeData, files) => {
    try {
      await apiService.updateEmployee(editingEmployee.employeeId, employeeData, files);
      await reloadPage();
      setShowForm(false);
      setEditingEmployee(null);
      setIsEditing(false);
      alert('Employee updated successfully!');
    } catch (e) {
      alert(e?.message || 'Error updating employee. Please try again.');
    }
  };

  const handleEditEmployee = async (employee) => {
    try {
      const fresh = await apiService.getEmployeeById(employee.employeeId);
      setEditingEmployee(fresh);
      setIsEditing(true);
      setShowForm(true);
    } catch (e) {
      alert(e?.message || 'Failed to fetch employee');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await apiService.deleteEmployee(employeeId);
      // If last item on page removed, go to previous page if now empty
      const nextPage = employees.length === 1 && page > 1 ? page - 1 : page;
      await reloadPage(nextPage);
      alert('Employee deleted successfully!');
    } catch (e) {
      alert(e?.message || 'Error deleting employee. Please try again.');
    }
  };

  const handleFormSubmit = (employeeData, files) => {
    if (isEditing) {
      handleUpdateEmployee(employeeData, files);
    } else {
      handleAddEmployee(employeeData, files);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
    setIsEditing(false);
  };

  // Handle adding new employee
  const handleAddNewEmployee = () => {
    setEditingEmployee(null);
    setIsEditing(false);
    setShowForm(true);
  };

  // pagination + server-side search
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const run = async () => {
      try {
        const q = searchQuery.trim();
        const res = await apiService.searchEmployees(q, page, rowsPerPage, sortBy);
        setEmployees(res.items || []);
        setTotal(res.total || 0);
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [searchQuery, page, rowsPerPage, sortBy]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Employee Form Management </h1>
              <p className="mt-1 text-sm text-gray-600">
                With Formik and Yup validation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {/* Total Employees: <span className="font-semibold text-gray-900">{employees.length}</span> */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showForm ? (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-black-900">Employee Details</h2>
                <p className="text-gray-600 mt-1">
                  View and manage all employees in your organization.
                </p>
              </div>
              <div className="w-full sm:w-auto flex items-center gap-5">
                <label htmlFor="employee-search" className="text-sm font-medium text-gray-700 whitespace-nowrap">Search</label>
                <input
                  id="employee-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Employee"
                  className="flex-1 sm:flex-none w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleAddNewEmployee}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add New Employee</span>
                </button>
              </div>
            </div>

            {/* Employee List */}
            <EmployeeList
              employees={employees}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
              sortBy={sortBy}
              onSortChange={(next) => {
                setSortBy(next);
                setPage(1);
              }}
            />

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">Total records: <span className="font-medium">{total}</span></div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >Prev</button>
                <span className="text-sm">Page {page}</span>
                <button
                  onClick={() => {
                    const maxPage = Math.max(1, Math.ceil(total / rowsPerPage));
                    setPage((p) => Math.min(maxPage, p + 1));
                  }}
                  disabled={page >= Math.ceil(total / rowsPerPage)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isEditing={isEditing}
            />
          </div>
        )}
      </main>

      
    </div>
  );
}

export default App;
