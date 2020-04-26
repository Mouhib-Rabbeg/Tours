//make js works in all browser
import '@babel/polyfill';
import { login, logout, signup, resetPass, forgotpass } from './login';
import { updateUserinfo, updateUserPassword } from './updateSettings';
import { bookTour } from './stripe';
//DOM ELEMENTS
const form = document.getElementById('form-login');
const formSignUp = document.getElementById('form-signup');
const fromUpdateInfo = document.querySelector('.form-user-data');
const fromUpdatePassword = document.querySelector('.form-user-settings');
const btnlogout = document.querySelector('.nav__el--logout');
const fromReset = document.getElementById('form-reset');
const fromForgot = document.getElementById('form-forgot');
const bookBtn = document.getElementById('book-tour');

//DELEGATION
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (btnlogout) {
  btnlogout.addEventListener('click', logout);
}

if (fromUpdateInfo) {
  fromUpdateInfo.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    //files is an array
    form.append('photo', document.getElementById('photo').files[0]);
    /* const email = document.getElementById('email').value;
    const name = document.getElementById('name').value; */

    updateUserinfo(form);
  });
}

if (fromUpdatePassword) {
  fromUpdatePassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('btn-pass').textContent = 'updating';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateUserPassword(currentPassword, password, passwordConfirm);

    document.getElementById('btn-pass').textContent = 'save password';
    fromUpdatePassword.reset();
  });
}
if (formSignUp) {
  formSignUp.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('btn-sign').textContent = 'sign up•••';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    await signup(name, email, password, passwordConfirm);
    document.getElementById('btn-sign').textContent = 'sign up';
  });
}

if (fromReset) {
  fromReset.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    await resetPass(password, passwordConfirm);
  });
}
if (fromForgot) {
  fromForgot.addEventListener('submit', async (e) => {
    document.getElementById('btn-forgot').textContent = 'sending•••';
    e.preventDefault();
    const email = document.getElementById('email').value;
    await forgotpass(email);
    document.getElementById('btn-forgot').textContent = 'submited';
  });
}
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing....';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}
