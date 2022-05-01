/*eslint-disable*/
// import { notification } from './notification';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password },
    });

    console.log(res);

    if (res.data.status === 'success') {
      notification('success', 'Login successfully');
      window.setTimeout(function () {
        window.location.assign('/');
      }, 1500);
    }
  } catch (err) {
    notification('success', err.response.data.message);
    // console.log(email, password);
    // console.log(err);
  }
};
