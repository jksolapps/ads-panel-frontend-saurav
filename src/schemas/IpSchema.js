import * as Yup from 'yup';

export const editIp = Yup.object({
    role: Yup.string().required('Please select role'),
});
