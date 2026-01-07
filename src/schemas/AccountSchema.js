/** @format */

import * as Yup from 'yup';

export const AddAccountSchema = Yup.object({
  name: Yup.string(),
  //.required('Please enter account name'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
  publicId: Yup.string().required('Please enter public id'),
  accessToken: Yup.string()
    .test({
      name: 'isValidJSON',
      message: 'Please enter a valid JSON',
      test: (value) => {
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          return false;
        }
      },
    })
    .required('Please enter access token'),
});

export const UpdateAccountSchema = Yup.object({
  name: Yup.string(),
  //.required('Please enter account name'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
  publicId: Yup.string().required('Please enter public id'),
  accessToken: Yup.string()
    .test({
      name: 'isValidJSON',
      message: 'Please enter a valid JSON',
      test: (value) => {
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          return false;
        }
      },
    })
    .required('Please enter access token'),
});
