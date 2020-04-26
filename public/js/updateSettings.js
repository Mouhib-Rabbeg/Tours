import axios from 'axios';
import { showAlert } from './alerts';

export const updateUserinfo = async (data) => {
  //retrive id from token
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Updated Successfully ');
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateUserPassword = async (
  currentPassword,
  password,
  passwordConfirm
) => {
  //retrive id from token
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMyPassword',
      data: {
        currentPassword,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'password updated !');
      //location.reload();
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
