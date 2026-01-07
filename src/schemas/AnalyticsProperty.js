/** @format */

import * as Yup from 'yup';

export const AddAnalyticspropertySchema = Yup.object({
    account_selection: Yup.string().required('Please select account'),
    id: Yup.string().required('Please enter account id'),
    name: Yup.string().required('Please enter account name'),
});

export const UpdateAnalyticspropertyAccountSchema = Yup.object({
    account_selection: Yup.string().required('Please select user role'),
    id: Yup.string().required('Please enter account id'),
    name: Yup.string().required('Please enter account name'),
});
