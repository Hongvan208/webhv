// GỌI API từ MockAPI để lấy sản phẩm
const API_URL = 'https://680e2d31c47cb8074d925038.mockapi.io/api/candyshop/products';

let products = [];
let cart = [];
let currentDetailIndex = null;
let currentUser = null;

// ======== NAVIGATION =========
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === pageId);
    page.classList.toggle('hidden', page.id !== pageId);
  });
  if (pageId === 'orders') renderOrders();
}

// ======== AUTH =========
function openLogin() {
  document.getElementById('authModal').classList.remove('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
}

document.getElementById('closeAuth').onclick = () => {
  document.getElementById('authModal').classList.add('hidden');
};

document.getElementById('showRegister').onclick = () => {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
};

document.getElementById('showLogin').onclick = () => {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
};

document.querySelector("#loginForm form").onsubmit = function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  if (username) {
    currentUser = username;
    localStorage.setItem("currentUser", JSON.stringify({ username, role: username === 'admin' ? 'admin' : 'user' }));
    updateNavbarForUser();
    document.getElementById("authModal").classList.add("hidden");
  } else {
    alert("Vui lòng nhập tài khoản!");
  }
};

document.querySelector("#registerForm form").onsubmit = function (e) {
  e.preventDefault();
  const username = document.getElementById("newUsername").value.trim();
  if (username) {
    currentUser = username;
    localStorage.setItem("currentUser", JSON.stringify({ username, role: username === 'admin' ? 'admin' : 'user' }));
    updateNavbarForUser();
    document.getElementById("authModal").classList.add("hidden");
  } else {
    alert("Vui lòng nhập tên đăng ký!");
  }
};

function updateNavbarForUser() {
  const loginBtn = document.getElementById("login-btn");
  const adminSection = document.getElementById('admin-section');
  const current = JSON.parse(localStorage.getItem("currentUser"));
  if (current) {
    currentUser = current.username;
    loginBtn.innerHTML = `${current.username} | Đăng xuất`;
    loginBtn.onclick = logoutUser;
    if (adminSection) adminSection.style.display = current.role === 'admin' ? 'block' : 'none';
  } else {
    loginBtn.innerHTML = "Đăng nhập/Đăng ký";
    loginBtn.onclick = openLogin;
    if (adminSection) adminSection.style.display = 'none';
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateNavbarForUser();
}

// ======== GỌI API + HIỂN THỊ SẢN PHẨM =========
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm:', error);
  }
}

function renderProducts() {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';
  products.forEach((p, index) => {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><b>${Number(p.price).toLocaleString()}₫</b></p>
      <button onclick="viewDetail(${index})">Xem chi tiết</button>
      <button onclick="addToCart(${index})">Thêm vào giỏ</button>
    `;
    productList.appendChild(div);
  });
}

// ======== CHI TIẾT SẢN PHẨM =========
function viewDetail(index) {
  currentDetailIndex = index;
  const p = products[index];
  document.getElementById('detailName').innerText = p.name;
  document.getElementById('detailImage').src = p.image;
  document.getElementById('detailDesc').innerText = p.description;
  document.getElementById('detailPrice').innerText = Number(p.price).toLocaleString() + '₫';
  document.getElementById('productDetailModal').classList.remove('hidden');
}

document.getElementById('closeProductDetail').onclick = () => {
  document.getElementById('productDetailModal').classList.add('hidden');
};

const addToCartDetailBtn = document.createElement('button');
addToCartDetailBtn.id = 'detailAddToCart';
addToCartDetailBtn.textContent = 'Thêm vào giỏ';
document.querySelector('#productDetailModal .popup-content').appendChild(addToCartDetailBtn);
addToCartDetailBtn.onclick = () => {
  if (currentDetailIndex !== null) {
    addToCart(currentDetailIndex);
    document.getElementById('productDetailModal').classList.add('hidden');
  }
};

// ======== GIỎ HÀNG =========
function addToCart(index) {
  cart.push(products[index]);
  updateCart();
}

function updateCart() {
  const cartList = document.getElementById('cart-list');
  cartList.innerHTML = '';
  let total = 0;
  cart.forEach((p, i) => {
    total += Number(p.price);
    cartList.innerHTML += `
      <div>${p.name} - ${Number(p.price).toLocaleString()}₫ 
        <button onclick="removeCart(${i})">Xoá</button>
      </div>
    `;
  });
  document.getElementById('total').innerText = `Tổng tiền: ${total.toLocaleString()}₫`;
}

function removeCart(i) {
  cart.splice(i, 1);
  updateCart();
}

// ======== ĐẶT HÀNG =========
function checkout() {
  if (!cart.length) return alert('Giỏ hàng trống!');
  const address = document.getElementById('address').value.trim();
  if (!address) return alert('Vui lòng nhập địa chỉ giao hàng!');

  const user = currentUser || 'khách';
  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const order = {
    username: user,
    date: new Date().toISOString(),
    items: cart.map(item => ({ name: item.name, quantity: 1 })),
    total: total.toLocaleString() + '₫'
  };

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  alert('Đặt hàng thành công!');
  cart = [];
  updateCart();
  document.getElementById('address').value = '';
}

// ======== HIỂN THỊ ĐƠN HÀNG =========
function renderOrders() {
  const orderList = document.getElementById("order-list");
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  if (!user) {
    orderList.innerHTML = "<p>Vui lòng đăng nhập để xem đơn hàng!</p>";
    return;
  }

  const filteredOrders = user.role === 'admin' ? orders : orders.filter(o => o.username === user.username);

  if (!filteredOrders.length) {
    orderList.innerHTML = "<p>Không có đơn hàng nào.</p>";
    return;
  }

  orderList.innerHTML = "";
  filteredOrders.forEach(order => {
    const div = document.createElement("div");
    div.className = "order-card";
    div.innerHTML = `
      <strong>Khách hàng:</strong> ${order.username}<br>
      <strong>Ngày đặt:</strong> ${new Date(order.date).toLocaleString()}<br>
      <strong>Sản phẩm:</strong>
      <ul>
        ${order.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join("")}
      </ul>
      <strong>Tổng tiền:</strong> ${order.total}
    `;
    orderList.appendChild(div);
  });
}

// ======== QUẢN LÝ SẢN PHẨM (ADMIN) =========
function addProduct(event) {
  event.preventDefault();
  if (currentUser !== 'admin') {
    alert('Bạn không có quyền thêm sản phẩm!');
    return;
  }
  const name = document.getElementById('admin-name').value.trim();
  const desc = document.getElementById('admin-desc').value.trim();
  const price = parseInt(document.getElementById('admin-price').value);
  const img = document.getElementById('admin-image').value.trim();
  if (name && desc && price && img) {
    products.push({ name, description: desc, price, image: img });
    alert('Đã thêm sản phẩm mới!');
    renderProducts();
  } else {
    alert('Vui lòng điền đầy đủ thông tin!');
  }
}

// ======== KHI TẢI TRANG =========
window.onload = () => {
  fetchProducts();
  updateNavbarForUser();
};
