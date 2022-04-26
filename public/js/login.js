/*eslint-disable*/

const form = document
  .queryselector('.customSeletor')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('working');
    const email = form.querySelector('#email');
    const password = form.querySelector('#password');
    alert(email, password);
  });

console.log('heelo');

console.log(form);
