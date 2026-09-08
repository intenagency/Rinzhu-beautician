const ADMIN_WHATSAPP_NUMBER = "919883871300";
const HYGIENE_FEE = 49;

// Agar global scope me cart pehle se nahi bana hai to initialize karein
if (typeof cart === "undefined") {
  window.cart = [];
}

function proceedToBooking() {
  if (!Array.isArray(cart) || cart.length === 0) {
    alert("Aapka cart khali hai! Kripya pehle service chunein.");
    return;
  }
  
  const rawName = prompt("Apna Full Name darj karein:");
  if (rawName === null) return; // User cancelled
  
  const rawPhone = prompt("Apna 10-digit Mobile Number darj karein:");
  if (rawPhone === null) return; // User cancelled
  
  const custName = rawName.trim();
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '').slice(-10);
  
  if (!custName || cleanPhone.length < 10) {
    alert("Kripya valid Name aur 10-digit Mobile number bharein!");
    return;
  }
  
  const dateEl = document.getElementById('book-date');
  const slotEl = document.getElementById('book-slot');
  const addrEl = document.getElementById('book-address');
  
  const bookDate = dateEl && dateEl.value ? dateEl.value : new Date().toLocaleDateString();
  const bookSlot = slotEl && slotEl.value ? slotEl.value : "Immediate / Earliest Slot";
  
  let bookAddress = addrEl && addrEl.value.trim() ? addrEl.value.trim() : null;
  if (!bookAddress) {
    const rawAddr = prompt("Apna Delivery Address darj karein:");
    if (rawAddr === null) return;
    bookAddress = rawAddr.trim();
  }
  
  if (!bookAddress) {
    alert("Kripya Booking Address zaroor bharein!");
    return;
  }
  
  // Multi-service automatic discount logic
  let baseTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  let discountPercent = cart.length >= 5 ? 15 : (cart.length >= 3 ? 10 : (cart.length >= 2 ? 5 : 0));
  let discountAmount = Math.round((baseTotal * discountPercent) / 100);
  let finalPayable = (baseTotal - discountAmount) + HYGIENE_FEE;
  
  // Schema matching beautician.html, rating.html & index.html
  const newOrder = {
    id: "RB-" + Math.floor(100000 + Math.random() * 900000),
    customerName: custName,
    customerPhone: cleanPhone,
    services: cart.map(i => i.name).join(", "),
    bookingDate: bookDate,
    bookingSlot: bookSlot,
    deliveryAddress: bookAddress,
    googleMapsLocation: "Manual Address Shared",
    serviceBill: finalPayable,
    staffRequired: "1 Beautician",
    status: "Pending",
    timestamp: new Date().toLocaleString(),
    isRated: false
  };
  
  // Sync to database
  let allOrders = JSON.parse(localStorage.getItem('rinzhu_orders')) || [];
  allOrders.push(newOrder);
  localStorage.setItem('rinzhu_orders', JSON.stringify(allOrders));
  
  // WhatsApp Alert Formatter
  const whatsappMsg = `🌸 *New Salon Order - Rinzhu Beauty (Inten Agency)*\n\n` +
    `🆔 *Order ID:* ${newOrder.id}\n` +
    `👤 *Customer:* ${newOrder.customerName}\n` +
    `📱 *Phone:* +91 ${newOrder.customerPhone}\n` +
    `📅 *Slot:* ${newOrder.bookingDate} | ${newOrder.bookingSlot}\n` +
    `📍 *Address:* ${newOrder.deliveryAddress}\n` +
    `💆 *Services:* ${newOrder.services}\n` +
    `💰 *Total Bill:* ₹${newOrder.serviceBill}\n` +
    `📌 *Status:* Pending Beautician Assignment`;
  
  // Reset cart state
  cart = [];
  if (typeof renderCart === "function") renderCart();
  if (typeof updateCartUI === "function") updateCartUI();
  
  // Launch WhatsApp
  const waUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`;
  window.open(waUrl, '_blank');
}