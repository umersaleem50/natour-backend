/*eslint-disable*/
console.log('working', document.getElementById('myForm'));
// const form = document
//   .queryselector('.customSeletor')
//   .addEventListener('submit', (e) => {
//     e.preventDefault();
//     console.log('working');
//     const email = form.querySelector('#email');
//     const password = form.querySelector('#password');
//     alert(email, password);
//   });

const form = document.getElementById('myForm');

const submitBtn = document.getElementById('submitBtn');

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password },
    });

    console.log(res);
  } catch (err) {
    console.log(err.response.data);
  }
};

submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});
