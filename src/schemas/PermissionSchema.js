import * as Yup from 'yup';

export const PermissionSchema = Yup.object({
    userSelectOptions: Yup.string().required('Please select user'),
    appSelectOptions: Yup.string().required('Please select apps'),
    multiSelectOptions: Yup.mixed().test('is-array-or-object', 'Please select ad unit', value => {
        if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) {
            throw new Yup.ValidationError('Please select ad unit', value, 'multiSelectOptions');
        }
        return true;
    })
});
