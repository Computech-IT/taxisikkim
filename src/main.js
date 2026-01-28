import './style.css';

// API base URL
const API_BASE = "https://taxisikkim.com";

// Application State
const state = {
  pickup: '',
  drop: '',
  date: '',
  selectedVehicle: null,
  step: 1
};

const vehicles = [
  { id: 'innova', name: 'Innova / Crysta', type: 'Prime SUV', price: 3500, seats: 7, time: '3 min' },
  { id: 'wagonr', name: 'WagonR', type: 'Mini', price: 2500, seats: 4, time: '5 min' },
  { id: 'alto', name: 'Alto', type: 'Micro', price: 2000, seats: 3, time: '2 min' },
  { id: 'scorpio', name: 'Scorpio', type: 'SUV', price: 3800, seats: 7, time: '8 min' }
];

document.querySelector('#app').innerHTML = `... your unchanged HTML ...`;

// **************************
// Your unchanged DOM Logic
// **************************

window.finalizeBooking = async (method) => {
  const name = document.getElementById('book-name').value.trim();
  const phone = document.getElementById('book-phone').value.trim();
  const email = document.getElementById('book-email').value.trim();
  const statusEl = document.getElementById('booking-status');

  const showStatus = (msg, type) => {
    statusEl.textContent = msg;
    statusEl.className = `enquiry-status ${type}`;
    statusEl.style.display = 'block';
  };

  if (!name || !phone) {
    showStatus("Please enter at least Name and Phone Number.", 'error');
    return;
  }
  if (method === 'email' && !email) {
    showStatus("Please enter your Email Address for email booking.", 'error');
    return;
  }

  const veh = vehicles.find(v => v.id === state.selectedVehicle);
  const details = {
    name: name,
    email: email,
    phone: phone,
    vehicle: veh.name,
    pickup: state.pickup,
    drop: state.drop,
    date: state.date,
    price: veh.price
  };

  if (method === 'whatsapp') {
    const message = `Hi, I want to book a ride.%0A%0A🚖 *Vehicle*: ${details.vehicle}%0A👤 *Name*: ${details.name}%0A📱 *Phone*: ${details.phone}%0A📧 *Email*: ${details.email || 'N/A'}%0A📍 *From*: ${details.pickup}%0A🏁 *To*: ${details.drop}%0A📅 *Date*: ${details.date}%0A💰 *Price*: Approx ₹${details.price}`;
    window.open(`https://wa.me/919339727733?text=${message}`, '_blank');
    closeModal();
  } else if (method === 'email') {
    try {
      showStatus('Sending booking request...', 'pending');

      const response = await fetch(`${API_BASE}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showStatus('✓ Booking Request Sent! Check your email.', 'success');
        setTimeout(() => closeModal(), 2000);
      } else {
        showStatus(`Failed: ${data.message || 'Server error'}`, 'error');
      }
    } catch (e) {
      console.error(e);
      showStatus('Connection error. Please try WhatsApp.', 'error');
    }
  }
};

// Enquiry Form
enquiryForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('enquiry-name').value.trim();
  const email = document.getElementById('enquiry-email').value.trim();
  const phone = document.getElementById('enquiry-phone').value.trim();
  const subject = document.getElementById('enquiry-subject').value;
  const message = document.getElementById('enquiry-message').value.trim();

  if (!name || !email || !phone || !subject || !message) {
    showEnquiryStatus('Please fill in all fields', 'error');
    return;
  }

  enquirySubmitBtn.disabled = true;
  enquirySubmitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Sending...';

  try {
    const response = await fetch(`${API_BASE}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, subject, message })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showEnquiryStatus('✓ Thank you! Your enquiry has been sent successfully. We\'ll get back to you soon.', 'success');
      enquiryForm.reset();
    } else {
      showEnquiryStatus('Failed to send enquiry. Please try calling or WhatsApp instead.', 'error');
    }
  } catch (error) {
    console.error('Enquiry submission error:', error);
    showEnquiryStatus('Connection error. Please try calling or WhatsApp instead.', 'error');
  } finally {
    enquirySubmitBtn.disabled = false;
    enquirySubmitBtn.innerHTML = '<i class="ri-send-plane-fill"></i> Send Enquiry';
  }
});

function showEnquiryStatus(message, type) {
  enquiryStatus.textContent = message;
  enquiryStatus.className = `enquiry-status ${type}`;
  enquiryStatus.style.display = 'block';
  setTimeout(() => { enquiryStatus.style.display = 'none'; }, 5000);
}
