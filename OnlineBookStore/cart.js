// Load cart from localStorage and render on page load 
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  const cartContainer = document.querySelector('.cart-items');
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Merge duplicates by title and author
  const mergedCart = [];
  cart.forEach(item => {
    const existingItem = mergedCart.find(
      i => i.title === item.title && i.author === item.author
    );
    if (existingItem) {
      // Merge quantities safely
      existingItem.quantity += item.quantity ? item.quantity : 1;
    } else {
      mergedCart.push({
        ...item,
        quantity: item.quantity ? item.quantity : 1
      });
    }
  });

  // Save merged cart back to localStorage
  localStorage.setItem('cart', JSON.stringify(mergedCart));

  if (mergedCart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    cartContainer.innerHTML = '';

    mergedCart.forEach((item, index) => {
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');

      const imgSrc = item.img || 'images/no-image.png';

      cartItem.innerHTML = `
        <img src="${imgSrc}" alt="${item.title}" />
        <div class="cart-item-details">
          <h3>${item.title}</h3>
          <p class="author">by ${item.author}</p>
          <p class="price">₹${item.price}</p>
        </div>
        <div class="qty-wrapper">
          <label for="qty${index}">Qty:</label>
          <input type="number" id="qty${index}" name="qty${index}" min="1" value="${item.quantity}" />
        </div>
        <button class="remove-btn">Remove</button>
      `;

      cartContainer.appendChild(cartItem);
    });
  }

  setupEventListeners();
  updateTotal();
}

// Event handlers for quantity and remove buttons
function setupEventListeners() {
  document.querySelectorAll('.remove-btn').forEach((btn, idx) => {
    btn.addEventListener('click', e => {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.splice(idx, 1); // remove item from array by current index
      localStorage.setItem('cart', JSON.stringify(cart));

      renderCart();
    });
  });

  document.querySelectorAll('.qty-wrapper input[type="number"]').forEach((input, idx) => {
    input.addEventListener('change', e => {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      let val = parseInt(e.target.value);
      if (val < 1) val = 1;
      e.target.value = val;

      if (cart[idx]) {
        cart[idx].quantity = val;
        localStorage.setItem('cart', JSON.stringify(cart));
      }

      updateTotal();
    });
  });

  const darkToggle = document.getElementById('darkToggle');
  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
    });
  }
}

// Calculate and update cart total
function updateTotal() {
  let total = 0;
  document.querySelectorAll('.cart-item').forEach(item => {
    const priceText = item.querySelector('.price').textContent;
    const price = parseFloat(priceText.replace('₹', '').replace('$', ''));
    const qty = parseInt(item.querySelector('input[type="number"]').value);
    total += price * qty;
  });
  document.getElementById('cart-total').textContent = '₹' + total.toFixed(2);
}
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  window.location.href = 'checkout.html';
});
