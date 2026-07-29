// State & Config
const state = {
  selectedProduct: 'Custom Photo Magnet',
  basePrice: 499,
  customText: 'Our Forever Story ✨ 2026',
  photoUrl: './assets/mywork2.jpg',
  finish: 'white',
  includeGiftWrap: true,
  includeLed: false,
  phoneNumber: '9553819025',
  googleSheetScriptUrl: ''
};

// Calculate Total Price
function calculatePrice() {
  let total = state.basePrice;
  if (state.includeGiftWrap) total += 99;
  if (state.includeLed) total += 199;
  return total;
}

// Update DOM UI elements
function updatePreview() {
  const captionEl = document.getElementById('previewCaption');
  const photoEl = document.getElementById('previewPhoto');
  const frameEl = document.getElementById('previewFrame');
  const priceEl = document.getElementById('totalPriceText');
  const priceElModal = document.getElementById('modalTotalPrice');

  if (captionEl) captionEl.textContent = state.customText || 'Our Story ✨';
  if (photoEl) photoEl.src = state.photoUrl;

  if (frameEl) {
    if (state.finish === 'rose-gold') {
      frameEl.style.background = 'linear-gradient(135deg, #ffe4e1 0%, #ffb7b2 100%)';
      frameEl.style.borderColor = '#ffb7b2';
    } else if (state.finish === 'gold') {
      frameEl.style.background = 'linear-gradient(135deg, #fff9c4 0%, #ffd700 100%)';
      frameEl.style.borderColor = '#ffd700';
    } else if (state.finish === 'acrylic') {
      frameEl.style.background = 'rgba(224, 242, 254, 0.85)';
      frameEl.style.borderColor = '#38bdf8';
    } else {
      frameEl.style.background = '#ffffff';
      frameEl.style.borderColor = '#ffffff';
    }
  }

  const currentPrice = calculatePrice();
  if (priceEl) priceEl.textContent = `₹${currentPrice}`;
  if (priceElModal) priceElModal.textContent = `₹${currentPrice}`;
}

// Toast notification
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }
}

// Category Filter Handler
function filterCategory(catName, btnEl) {
  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const cardCat = card.dataset.category || '';
    if (catName === 'All' || cardCat.includes(catName)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Order Form Handler (Direct WhatsApp + Google Sheets Log)
function handleOrderSubmit(e) {
  e.preventDefault();

  const customerName = document.getElementById('custName').value;
  const customerPhone = document.getElementById('custPhone').value;
  const deliveryAddress = document.getElementById('custAddress').value;

  if (!customerName || !customerPhone) {
    alert('Please enter your Name and Mobile Number!');
    return;
  }

  const totalPrice = calculatePrice();

  // Order Details Payload
  const orderData = {
    timestamp: new Date().toLocaleString(),
    brand: 'Magnetify Ur Story (@magnetify_ur_story)',
    customerName,
    customerPhone,
    deliveryAddress: deliveryAddress || 'Shared on WhatsApp',
    productName: state.selectedProduct,
    customInscription: state.customText,
    finish: state.finish.toUpperCase(),
    giftBoxWrapped: state.includeGiftWrap ? 'Yes (+₹99)' : 'No',
    ledGlow: state.includeLed ? 'Yes (+₹199)' : 'No',
    totalPrice: `₹${totalPrice}`
  };

  // Submit to Google Sheets Webhook if configured
  const sheetUrl = state.googleSheetScriptUrl || localStorage.getItem('google_sheet_url');
  if (sheetUrl) {
    fetch(sheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    }).catch(err => console.log('Google Sheets submit notice:', err));
  }

  showToast('✅ Details Saved! Opening WhatsApp to complete order...');

  // Format WhatsApp Message directly to 9553819025
  const waText = `Hi Magnetify Ur Story! 👋 I want to confirm my custom order:

👤 *Name:* ${customerName}
📞 *Phone:* ${customerPhone}
📍 *Address:* ${deliveryAddress || 'Visakhapatnam'}

🎁 *Product:* ${state.selectedProduct}
✍️ *Custom Inscription:* "${state.customText}"
🎨 *Finish:* ${state.finish.toUpperCase()}
✨ *Gift Box Packaging:* ${state.includeGiftWrap ? 'Yes (+₹99)' : 'Standard'}
💡 *LED Lighting:* ${state.includeLed ? 'Yes (+₹199)' : 'No'}
💰 *Total Amount:* ₹${totalPrice}

I will upload my photo attachment now! 📸`;

  const waUrl = `https://wa.me/919553819025?text=${encodeURIComponent(waText)}`;
  
  closeModal();
  setTimeout(() => {
    window.open(waUrl, '_blank');
  }, 800);
}

// Modal open / close
function openOrderModal(productName, price) {
  if (productName) {
    state.selectedProduct = productName;
    state.basePrice = price || 499;
  }
  const modalProdEl = document.getElementById('modalSelectedProduct');
  if (modalProdEl) modalProdEl.textContent = state.selectedProduct;
  
  updatePreview();
  const modal = document.getElementById('orderModal');
  if (modal) modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('orderModal');
  if (modal) modal.classList.remove('active');
}

// Open Google Sheets Setup Modal
function openSheetConfig() {
  const modal = document.getElementById('sheetModal');
  if (modal) modal.classList.add('active');
}

function saveSheetUrl() {
  const urlInput = document.getElementById('sheetUrlInput').value;
  if (urlInput) {
    state.googleSheetScriptUrl = urlInput;
    localStorage.setItem('google_sheet_url', urlInput);
    showToast('✅ Google Sheets Webhook Connected!');
    const modal = document.getElementById('sheetModal');
    if (modal) modal.classList.remove('active');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('customTextInput');
  if (textInput) {
    textInput.addEventListener('input', (e) => {
      state.customText = e.target.value;
      updatePreview();
    });
  }

  const photoInput = document.getElementById('photoUploadInput');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          state.photoUrl = reader.result;
          updatePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const finishBtns = document.querySelectorAll('.finish-btn');
  finishBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      finishBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.finish = btn.dataset.finish;
      updatePreview();
    });
  });

  const wrapCheck = document.getElementById('giftWrapCheck');
  if (wrapCheck) {
    wrapCheck.addEventListener('change', (e) => {
      state.includeGiftWrap = e.target.checked;
      updatePreview();
    });
  }

  const ledCheck = document.getElementById('ledCheck');
  if (ledCheck) {
    ledCheck.addEventListener('change', (e) => {
      state.includeLed = e.target.checked;
      updatePreview();
    });
  }

  const savedSheet = localStorage.getItem('google_sheet_url');
  if (savedSheet) state.googleSheetScriptUrl = savedSheet;

  updatePreview();
});
