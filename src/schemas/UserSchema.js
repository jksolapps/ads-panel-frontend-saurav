/** @format */

import * as Yup from 'yup';

export const LoginUserSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
  // password: Yup.string().required('Please enter password'),
});

export const AddUserSchema = Yup.object({
  name: Yup.string().max(40).required('Please enter name'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
  // password: Yup.string().required('Please enter password'),
  role: Yup.string().required('Please select user role'),
});

export const UpdateUserSchema = Yup.object({
  name: Yup.string().max(40).required('Please enter name'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
  role: Yup.string().required('Please select user role'),
});

export const UpdateProfileSchema = Yup.object({
  name: Yup.string().max(40).required('Please enter name'),
  email: Yup.string().email().required('Please enter email'),
});

export const PermissionSchema = Yup.object({
  userSelectOptions: Yup.string().required('Please select user'),
  appSelectOptions: Yup.string().required('Please select application'),
  // multiSelectOptions: Yup.array().min(1, 'Please select ad unit'),
  multiSelectOptions: Yup.mixed().test(
    'is-array-or-object',
    'Please select ad unit',
    value => Array.isArray(value) || typeof value === 'object'
  ).required('Please select ad unit'),
});


