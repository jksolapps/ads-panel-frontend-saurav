/** @format */

import * as Yup from 'yup';

export const AddGroup = Yup.object({
	name: Yup.string()
		.matches(/^\S.*\S$/, 'Name must not have trailing blank spaces at the beginning')
		.required('Please enter name'),
	role: Yup.string().required('Please select  role'),
	appSelectOptions: Yup.array().min(1, 'Please select apps'),
});

export const EditGroup = Yup.object({
	name: Yup.string()
		.matches(/^\S.*\S$/, 'Name must not have trailing blank spaces at the beginning')
		.required('Please enter name'),
	role: Yup.string().required('Please select  role'),
	appSelectOptions: Yup.array().min(1, 'Please select apps'),
});

export const AddGG = Yup.object({
	name: Yup.string()
		.matches(/^\S.*\S$/, 'Name must not have trailing blank spaces at the beginning')
		.required('Please enter name'),
	appSelectOptions: Yup.array().min(1, 'Please select apps'),
});

export const EditGG = Yup.object({
	name: Yup.string()
		.matches(/^\S.*\S$/, 'Name must not have trailing blank spaces at the beginning')
		.required('Please enter name'),
	appSelectOptions: Yup.array().min(1, 'Please select apps'),
});
