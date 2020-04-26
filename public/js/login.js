import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    console.log(result);
    if (result.data.status === 'success') {
      showAlert('success', 'logged in successfuly');
      window.setTimeout(() => {
        //to reloade the page
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'logged out successfuly');
      //force reload from the server
      window.setTimeout(() => {
        //to reloade the page
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'account created  successfuly');
      //force reload from the server
      window.setTimeout(() => {
        //to reloade the page
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const resetPass = async (password, passwordConfirm) => {
  const token = window.location.href.split('/')[4];
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/users/restPassword/${token}`,
      data: {
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'password rested  successfuly');
      //force reload from the server
      window.setTimeout(() => {
        //to reloade the page
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
export const forgotpass = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v1/users/forgotPassword`,
      data: {
        email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'email sent successfuly');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
