export const hideAlert = () => {
  const elt = document.querySelector('.alert');
  if (elt) elt.parentElement.removeChild(elt);
};
//type succes or error
export const showAlert = (type, message) => {
  hideAlert();
  const html = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', html);
  window.setTimeout(hideAlert, 1500);
};
