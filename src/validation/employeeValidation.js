import * as Yup from 'yup';

export const employeeValidationSchema = Yup.object({
  firstName: Yup.string()
    .required('First Name is required')
    .min(2, 'First Name must be at least 2 characters')
    .max(50, 'First Name must be less than 50 characters'),
  lastName: Yup.string()
    .required('Last Name is required')
    .min(2, 'Last Name must be at least 2 characters')
    .max(50, 'Last Name must be less than 50 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phoneNumber: Yup.string()
    .required('Phone Number is required')
    .matches(/^\d{10}$/, 'Phone Number must be exactly 10 digits'),
  department: Yup.string()
    .required('Department is required')
    .min(2, 'Department must be at least 2 characters'),
  position: Yup.string()
    .required('Position is required')
    .min(2, 'Position must be at least 2 characters'),
  salary: Yup.number()
    .required('Salary is required')
    .positive('Salary must be a positive number')
    .min(1, 'Salary must be at least 1')
    .max(10000000, 'Salary must be less than 10,000,000'),
  dateOfJoining: Yup.date()
    .required('Date of Joining is required')
    .max(new Date(), 'Date of Joining cannot be in the future'),
  address: Yup.string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters')
});
