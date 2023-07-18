/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v1/users/login`,
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/', 0);
      });
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/users/logout`,
    });

    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const signup = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v1/users/signup`,
      data: {
        name,
        email,
        password,
        confirmPassword,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Account created successfuly');
      window.setTimeout(() => {
        location.assign('/', 0);
      });
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// document.querySelector('form').addEventListener('submit', (e) => {
//     const res = axios({
//         method: 'POST',
//         url: 'api/v1/users/login'
//     })
//   e.preventDefault();
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;

//   console.log(email, password);
// });
