
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { employeeValidationSchema } from '../validation/employeeValidation';
import { apiService } from '../services/apiService';


const EmployeeForm = ({ employee, onSubmit, onCancel, isEditing = false }) => {
  const [localImageUrl, setLocalImageUrl] = React.useState(null);
  const [localDocUrl, setLocalDocUrl] = React.useState(null);
  React.useEffect(() => {
    return () => {
      if (localImageUrl) URL.revokeObjectURL(localImageUrl);
      if (localDocUrl) URL.revokeObjectURL(localDocUrl);
    };
  }, [localImageUrl, localDocUrl]);
  const toDateInputValue = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const initialValues = {
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phoneNumber: employee?.phoneNumber || '',
    department: employee?.department || '',
    position: employee?.position || '',
    salary: employee?.salary || '',
    dateOfJoining: toDateInputValue(employee?.dateOfJoining),
    address: employee?.address || '',
    isActive: typeof employee?.isActive === 'boolean' ? employee.isActive : true,
    image: null,
    document: null,
  };

  const validationSchema = Yup.object({
    ...employeeValidationSchema.fields,
    image: (() => {
      let schema = Yup.mixed().nullable()
        .test('fileSize', 'Image must be <= 1MB', (value) => !value || value.size <= 1 * 1024 * 1024)
        .test('fileType', 'Only JPG, JPEG, PNG allowed', (value) => !value || ['image/jpeg','image/png'].includes(value.type));
      if (!isEditing) schema = schema.required('Image is required');
      return schema;
    })(),
    document: (() => {
      let schema = Yup.mixed().nullable()
        .test('fileSize', 'Document must be <= 5MB', (value) => !value || value.size <= 5 * 1024 * 1024)
        .test('fileType', 'Only PDF or Word allowed', (value) => !value || ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(value.type));
      if (!isEditing) schema = schema.required('Document is required');
      return schema;
    })(),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const unique = await apiService.isEmailUnique(values.email, employee?.employeeId);
      if (!unique) { setFieldError('email', 'Email must be unique'); setSubmitting(false); return; }

      const employeeData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        department: values.department,
        position: values.position,
        salary: parseFloat(values.salary),
        dateOfJoining: values.dateOfJoining,
        address: values.address,
        isActive: Boolean(values.isActive),
      };

      const files = { image: values.image, document: values.document };
      await onSubmit(employeeData, files);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, touched, setFieldValue, values }) => (
          <Form className="space-y-6">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit Employee' : 'Add New Employee'}
              </h2>

              {/* Toggle button for Active/Inactive */}
              <Field name="isActive">
                {({ field, form }) => (
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${
                        field.value ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {field.value ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      onClick={() => form.setFieldValue('isActive', !field.value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        field.value ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          field.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </Field>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-600">*</span>
                </label>
                <Field
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName && touched.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter First Name"
                />
                <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-600">*</span>
                </label>
                <Field
                  type="text"
                  id="lastName"
                  name="lastName"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName && touched.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Last Name"
                />
                <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-600">*</span>
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Email Address"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <Field
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit Phone Number"
                />
                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-600">*</span>
                </label>
                <Field
                  as="select"
                  id="department"
                  name="department"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.department && touched.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="IT">Information Technology</option>
                  <option value="Customer Service">Customer Service</option>
                </Field>
                <ErrorMessage name="department" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Position <span className="text-red-600">*</span>
                </label>
                <Field
                  type="text"
                  id="position"
                  name="position"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.position && touched.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Position"
                />
                <ErrorMessage name="position" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                  Salary <span className="text-red-600">*</span>
                </label>
                <Field
                  type="number"
                  id="salary"
                  name="salary"
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.salary && touched.salary ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Salary"
                />
                <ErrorMessage name="salary" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Joining <span className="text-red-600">*</span>
                </label>
                <Field
                  type="date"
                  id="dateOfJoining"
                  name="dateOfJoining"
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dateOfJoining && touched.dateOfJoining ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage name="dateOfJoining" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-600">*</span>
              </label>
              <Field
                as="textarea"
                id="address"
                name="address"
                rows="3"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address && touched.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter Full Address"
              />
              <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            {/* Existing File Previews (when editing) */}
            {isEditing && employee?.employeeId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="border rounded p-2 bg-gray-50">
                    <img
                      src={localImageUrl || `${apiService.imageUrl(employee.employeeId)}?t=${employee.updatedAt || ''}`}
                      alt="Employee"
                      className="w-full h-48 object-contain bg-white"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="mt-2 text-right">
                      {localImageUrl ? (
                        <a href={localImageUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Open selected image</a>
                      ) : (
                        <a href={apiService.imageUrl(employee.employeeId)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Open image in new tab</a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="border rounded p-2 bg-gray-50">
                    {localDocUrl ? (
                      <iframe title="Selected Document" src={localDocUrl} className="w-full h-48 bg-white" />
                    ) : (
                      <iframe title="Employee Document" src={`${apiService.documentUrl(employee.employeeId)}?t=${employee.updatedAt || ''}`} className="w-full h-48 bg-white" />
                    )}
                    <div className="mt-2 text-right">
                      {localDocUrl ? (
                        <a href={localDocUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Open selected document</a>
                      ) : (
                        <a href={apiService.documentUrl(employee.employeeId)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Open document in new tab</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image (jpg, jpeg, png; max 1MB) { !isEditing && <span className="text-red-600">*</span> }</label>
                <input
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] || null;
                    setFieldValue('image', file);
                    if (localImageUrl) URL.revokeObjectURL(localImageUrl);
                    setLocalImageUrl(file ? URL.createObjectURL(file) : null);
                  }}
                  className="w-full"
                />
                <ErrorMessage name="image" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document (pdf, doc, docx; max 5MB) { !isEditing && <span className="text-red-600">*</span> }</label>
                <input
                  name="document"
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] || null;
                    setFieldValue('document', file);
                    if (localDocUrl) URL.revokeObjectURL(localDocUrl);
                    setLocalDocUrl(file ? URL.createObjectURL(file) : null);
                  }}
                  className="w-full"
                />
                <ErrorMessage name="document" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Add Employee'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EmployeeForm;
