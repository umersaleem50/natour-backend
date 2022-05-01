/* eslint-disable */

const hideNotification = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const notification = (type = 'error', message) => {
  hideNotification();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideNotification, 5000);
};
