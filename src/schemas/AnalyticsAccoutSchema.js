/** @format */

import * as Yup from 'yup';

export const AddAnalyticsAccountSchema = Yup.object({
    id: Yup.string().required('Please enter account id'),
    name: Yup.string().required('Please enter account name'),
});

export const UpdateAnalyticsAccountSchema = Yup.object({
    id: Yup.string().required('Please enter account id'),
    name: Yup.string().required('Please enter account name'),
});
