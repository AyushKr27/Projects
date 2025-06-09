// ✅ Fully updated script.js
// Consolidated: dark mode, auth, carousel, search, EmailJS, and corrected add-to-cart + badge update

document.addEventListener("DOMContentLoaded", () => {
  // ------------------ Carousel ------------------
  let slides = document.querySelectorAll(".slide");
  let current = 0;

  function showSlide(index) {
    if (!slides.length || !slides[index]) return;
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");
  }

  if (slides.length) {
    showSlide(current);
    setInterval(() => {
      current = (current + 1) % slides.length;
      showSlide(current);
    }, 3000);
  }

  // ------------------ Dark Mode ------------------
  const darkToggle = document.getElementById("darkToggle");
  if (localStorage.getItem("theme") === "dark-mode") {
    document.body.classList.add("dark-mode");
    if (darkToggle) darkToggle.textContent = "☀️";
  } else {
    if (darkToggle) darkToggle.textContent = "🌙";
  }

  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark-mode");
        darkToggle.textContent = "☀️";
      } else {
        localStorage.removeItem("theme");
        darkToggle.textContent = "🌙";
      }
    });
  }

  // ------------------ Login Modal ------------------
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const loginForm = document.getElementById('loginForm');

  function setLoggedIn(email) {
    loginBtn.textContent = `Logout (${email})`;
    loginBtn.classList.add('logged-in');
    localStorage.setItem('loggedInUser', email);
  }

  function setLoggedOut() {
    loginBtn.textContent = 'Login';
    loginBtn.classList.remove('logged-in');
    localStorage.removeItem('loggedInUser');
  }

  function checkLogin() {
    const user = localStorage.getItem('loggedInUser');
    user ? setLoggedIn(user) : setLoggedOut();
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (loginBtn.classList.contains('logged-in')) {
        setLoggedOut();
      } else {
        loginModal?.classList.remove('hidden');
      }
    });
  }

  closeModal?.addEventListener('click', () => {
    loginModal?.classList.add('hidden');
  });

  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    if (email && password.length >= 6) {
      setLoggedIn(email);
      loginModal?.classList.add('hidden');
      loginForm.reset();
    } else {
      alert('Please enter valid email and password (6+ chars).');
    }
  });

  window.addEventListener('click', e => {
    if (e.target === loginModal) {
      loginModal?.classList.add('hidden');
    }
  });

  checkLogin();

  // ------------------ Search Autocomplete ------------------
  const bookTitles = [
    "The Midnight Library", "Project Hail Mary", "Klara and the Sun",
    "The Four Winds", "Where the Crawdads Sing", "Becoming",
    "Educated", "The Night Circus", "The Testaments",
    "The Overstory", "Lincoln in the Bardo", "A Little Life"
  ];

  const searchInput = document.getElementById('search');
  if (searchInput) {
    const suggestionsBox = document.createElement('div');
    suggestionsBox.id = 'suggestions';
    searchInput.parentElement.appendChild(suggestionsBox);

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      suggestionsBox.innerHTML = '';
      if (!query) {
        suggestionsBox.style.display = 'none';
        return;
      }

      const matches = bookTitles.filter(title => title.toLowerCase().includes(query));
      if (!matches.length) {
        suggestionsBox.style.display = 'none';
        return;
      }

      matches.forEach(title => {
        const div = document.createElement('div');
        div.textContent = title;
        div.addEventListener('click', () => {
          searchInput.value = title;
          suggestionsBox.innerHTML = '';
          suggestionsBox.style.display = 'none';
        });
        suggestionsBox.appendChild(div);
      });

      suggestionsBox.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = 'none';
      }
    });
  }

  // ------------------ EmailJS Contact Form ------------------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }

      emailjs.send("service_bnmrnkq", "template_4egv9qk", { name, email, message })
        .then(() => {
          alert(`Thank you for your message, ${name}!`);
          this.reset();
        }, (error) => {
          console.error('Email error:', error);
          alert('There was a problem sending your message. Please try again.');
        });
    });
  }

  // ------------------ Cart Badge & Add to Cart ------------------
  const cartCountElement = document.querySelector('.cart-count');

  function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
      if (totalItems > 0) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = 'inline-block';
      } else {
        cartCountElement.style.display = 'none';
      }
    }
  }

  updateCartBadge(); // Initial badge update on page load

  const cartBtns = document.querySelectorAll('.add-to-cart-btn');
  cartBtns.forEach(btn => {
    const bookCard = btn.closest('.book-card');
    const minPrice = 199;
    const maxPrice = 999;
    const price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
    btn.setAttribute("data-price", price);

    const priceTag = document.createElement("div");
    priceTag.className = "price";
    priceTag.textContent = `₹${price}`;
    bookCard.appendChild(priceTag);

    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const author = btn.getAttribute('data-author');
      const img = bookCard.querySelector('img')?.src || '';
      const price = parseFloat(btn.getAttribute('data-price')) || 0;

      const newItem = { title, author, img, price, quantity: 1 };

      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existing = cart.find(item => item.title === newItem.title && item.author === newItem.author);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push(newItem);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
      alert(`${newItem.title} added to cart!`);
    });
  });
});
