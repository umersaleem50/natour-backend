/*eslint-disable */

const submitBtn = document.getElementById('submitBtn');
const logoutBtn = document.querySelector('.nav__el--logout');
const mapEl = document.getElementById('map');
const settingBtn = document.querySelector('.btn-save-settings');
const nameSetting = document.querySelector('.form__input--nameSetting');
const emailSetting = document.querySelector('.form__input--emailSetting');
const btnSavePassword = document.querySelector('.btn--savePassword');

let locations = [];
if (mapEl) locations = JSON.parse(mapEl.dataset.location);

const hideNotification = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const notification = (type = 'error', message) => {
  hideNotification();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideNotification, 5000);
};

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password },
    });

    if (res.data.status === 'success') {
      notification('success', 'Login successfully');
      window.setTimeout(function () {
        window.location.assign('/');
      }, 1500);
    }
  } catch (err) {
    notification('error', err.response.data.message);

    // console.log(email, password);
    // console.log(err);
  }
};

const updateSetting = async (data, type) => {
  try {
    const updatedDate = await axios({
      url:
        type === 'data'
          ? 'http://127.0.0.1:3000/api/v1/users/updateMe'
          : 'http://127.0.0.1:3000/api/v1/users/updateMyPassword',
      method: 'PATCH',
      data: data,
    });
    notification('success', `${type.toUpperCase()} updated successfully!`);
    window.location.reload(true);
  } catch (err) {
    notification('error', err.message);
  }
};

const logout = async function () {
  try {
    const response = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if (response.data.status === 'success') {
      // location.reload(true);
      window.location.assign('/login');
    }
  } catch (err) {
    notification('error', 'Failed to logout, Please try again later');
  }
};

if (submitBtn) {
  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => logout());
}

if (settingBtn) {
  settingBtn.addEventListener('click', (e) => {
    const form = new FormData();
    form.append('name', nameSetting.value);
    form.append('email', emailSetting.value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSetting(form, 'data');
  });
}

if (btnSavePassword) {
  btnSavePassword.addEventListener('click', async (e) => {
    const passwordCurrent = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;

    await updateSetting(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#passwordConfirm').value = '';
  });
}

// var map = L.map('map').setView([51.505, -0.09], 13);

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

// L.marker([51.5, -0.09])
//   .addTo(map)
//   .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//   .openPopup();

const displayMap = () => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidW1lcnNhbGVlbTUwIiwiYSI6ImNsMmY1aXE4bzA0dG4zY2xqOGNhaTdvMzEifQ.0_4VsRd5Se0W1N-BtJ3FyA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/umersaleem50/cl2nt3d4r006u15lbsjbt96dr',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day: ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
    console.log(loc);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

if (document.querySelector('#map')) {
  displayMap();
}
