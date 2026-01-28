import './style.css';

// Application State
const state = {
  pickup: '',
  drop: '',
  date: '',
  selectedVehicle: null,
  step: 1 // 1: Locations, 2: Vehicle Selection
};

// Vehicles Data (Mock Dynamic Pricing)
const vehicles = [
  { id: 'innova', name: 'Innova / Crysta', type: 'Prime SUV', price: 3500, seats: 7, time: '3 min' },
  { id: 'wagonr', name: 'WagonR', type: 'Mini', price: 2500, seats: 4, time: '5 min' },
  { id: 'alto', name: 'Alto', type: 'Micro', price: 2000, seats: 3, time: '2 min' },
  { id: 'scorpio', name: 'Scorpio', type: 'SUV', price: 3800, seats: 7, time: '8 min' }
];


// Initial Render: Full Website Structure
document.querySelector('#app').innerHTML = `
  <div class="map-visual"></div> <!-- Fixed Background -->

  <!-- Full Page Scrollable Wrapper -->
  <div class="website-content">
    
    <!-- Navbar -->
    <nav class="navbar">
      <a href="#hero" class="brand">Sikkim Taxi Service</a>
      <ul class="nav-links">
        <li><a href="#hero">Book</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#testimonials">Reviews</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <a href="tel:+919339727733" style="padding: 10px 20px; background: #000; color: white; border-radius: 30px; text-decoration: none; font-size: 0.9rem;">Call Us</a>
    </nav>

    <!-- Hero Section with Booking Widget -->
    <section id="hero" class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content">
          <h1 class="hero-title">The Smartest Way to Travel in Sikkim</h1>
         
        </div>

        <!-- The App Widget (Floating Card) -->
        <div class="app-widget-card" id="booking-widget">
           <!-- Step 1: Location Input -->
          <div id="step-location" class="booking-container">
            <h2 class="step-title">Where to?</h2>
            
            <div class="location-inputs">
              <div class="input-row">
                <div class="input-icon"></div>
                From
                <input type="text" id="pickup" class="app-input" placeholder="Pickup location" value="Bagdogra Airport">
              </div>
              <div class="input-row">
                <div class="input-icon square"></div>
                To
                <input type="text" id="drop" class="app-input" placeholder="Drop location" value="Gangtok, MG Marg">
              </div>
            </div>
            
            <h3 style="font-size: 1rem; margin-bottom: 10px; color: #64748b; margin-top: 20px;">When?</h3>
            <div class="input-row">
              <input type="date" id="date" class="app-input">
            </div>
            
            <div style="margin-top: 20px;">
              <button id="action-btn" class="btn-black">Find Ride</button>
            </div>
          </div>

          <!-- Step 2: Vehicle Selection -->
          <div id="step-vehicle" class="booking-container hidden">
            <button id="back-btn" style="background: none; border: none; font-size: 0.9rem; margin-bottom: 15px; cursor: pointer; color: #64748b;">← Back</button>
            <h2 class="step-title" style="font-size: 1.5rem;">Choose a ride</h2>
            
            <div class="vehicle-list" id="vehicle-list-container" style="max-height: 300px; overflow-y: auto;">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="section">
       <h2 class="section-title fade-in-up">More than just a Taxi</h2>
       <div class="services-grid">
          <div class="service-card fade-in-up delay-100">
             <div class="service-icon"><i class="ri-plane-fill" style="color: var(--color-brand);"></i></div>
             <h3>Airport Transfers</h3>
             <p style="color: #64748b; margin-top: 10px;">Punctual pickups from Bagdogra (IXB) and Pakyong. We track flights to ensure no waiting charges.</p>
          </div>
          <div class="service-card fade-in-up delay-200">
             <div class="service-icon"><i class="ri-mountain-fill" style="color: var(--color-brand);"></i></div>
             <h3>Sightseeing Packages</h3>
             <p style="color: #64748b; margin-top: 10px;">Curated tours for Nathula Pass, Tsomgo Lake, Pelling Skywalk, and North Sikkim valleys.</p>
          </div>
           <div class="service-card fade-in-up delay-300">
             <div class="service-icon"><i class="ri-briefcase-4-fill" style="color: var(--color-brand);"></i></div>
             <h3>Corporate Travel</h3>
             <p style="color: #64748b; margin-top: 10px;">Premium fleet (Innova Crysta) for business meetings and VIP delegates in Gangtok.</p>
          </div>
       </div>
    </section>

    <!-- Testimonials -->
    <section id="testimonials" class="section" style="background: #f8fafc;">
       <h2 class="section-title fade-in-up">Guest Stories</h2>
       <div class="testimonials-row">
          <div class="testimonial-card-white fade-in-up delay-100">
             <div style="color: #fbbf24; margin-bottom: 10px;"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></div>
             <p style="margin-bottom: 20px; font-style: italic;">"The app-like experience made booking so easy. The driver arrived exactly on time at Bagdogra."</p>
             <div style="font-weight: 700;">Anjali M.</div>
             <div style="font-size: 0.8rem; color: #64748b;">Mumbai</div>
          </div>
           <div class="testimonial-card-white fade-in-up delay-200">
             <div style="color: #fbbf24; margin-bottom: 10px;"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></div>
             <p style="margin-bottom: 20px; font-style: italic;">"Transparent pricing helped us plan our budget. The Innova was brand new."</p>
             <div style="font-weight: 700;">David Ross</div>
             <div style="font-size: 0.8rem; color: #64748b;">UK</div>
          </div>
           <div class="testimonial-card-white fade-in-up delay-300">
             <div style="color: #fbbf24; margin-bottom: 10px;"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></div>
             <p style="margin-bottom: 20px; font-style: italic;">"Sikkim Taxi Service is a game changer. No haggling with local drivers needed."</p>
             <div style="font-weight: 700;">Rahul Verma</div>
             <div style="font-size: 0.8rem; color: #64748b;">Delhi</div>
          </div>
       </div>
    </section>

    <!-- Enquiry Form Section -->
    <section id="contact" class="section" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; position: relative; overflow: hidden;">
       <!-- Animated Background Elements -->
       <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none;">
         <div style="position: absolute; top: 20%; left: 10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%); border-radius: 50%; filter: blur(60px);"></div>
         <div style="position: absolute; bottom: 10%; right: 15%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%); border-radius: 50%; filter: blur(80px);"></div>
       </div>

       <div style="position: relative; z-index: 1;">
         <h2 class="section-title fade-in-up" style="color: white; margin-bottom: 15px;">Have Questions?</h2>
         <p style="text-align: center; max-width: 600px; margin: 0 auto 50px; opacity: 0.8; font-size: 1.1rem;">Send us your enquiry and our team will get back to you within 24 hours</p>
         
         <div class="enquiry-form-container fade-in-up delay-100">
           <form id="enquiry-form" class="enquiry-form">
             <div class="form-row">
               <div class="form-group">
                 <label for="enquiry-name" class="form-label">
                   <i class="ri-user-line"></i> Full Name
                 </label>
                 <input 
                   type="text" 
                   id="enquiry-name" 
                   class="form-input" 
                   placeholder="Enter your name" 
                   required
                 >
               </div>
               
               <div class="form-group">
                 <label for="enquiry-email" class="form-label">
                   <i class="ri-mail-line"></i> Email Address
                 </label>
                 <input 
                   type="email" 
                   id="enquiry-email" 
                   class="form-input" 
                   placeholder="your@email.com" 
                   required
                 >
               </div>
             </div>

             <div class="form-row">
               <div class="form-group">
                 <label for="enquiry-phone" class="form-label">
                   <i class="ri-phone-line"></i> Phone Number
                 </label>
                 <input 
                   type="tel" 
                   id="enquiry-phone" 
                   class="form-input" 
                   placeholder="+91 XXXXX XXXXX" 
                   required
                 >
               </div>

               <div class="form-group">
                 <label for="enquiry-subject" class="form-label">
                   <i class="ri-sparkling-line"></i> Subject
                 </label>
                 <select id="enquiry-subject" class="form-input" required>
                   <option value="">Select a topic</option>
                   <option value="Booking Inquiry">Booking Inquiry</option>
                   <option value="Package Details">Package Details</option>
                   <option value="Pricing Information">Pricing Information</option>
                   <option value="Corporate Services">Corporate Services</option>
                   <option value="General Query">General Query</option>
                   <option value="Other">Other</option>
                 </select>
               </div>
             </div>

             <div class="form-group">
               <label for="enquiry-message" class="form-label">
                 <i class="ri-message-3-line"></i> Your Message
               </label>
               <textarea 
                 id="enquiry-message" 
                 class="form-input form-textarea" 
                 placeholder="Tell us about your travel plans or any questions you have..." 
                 rows="5"
                 required
               ></textarea>
             </div>

             <div style="text-align: center; margin-top: 30px;">
               <button type="submit" id="enquiry-submit-btn" class="btn-submit-enquiry">
                 <i class="ri-send-plane-fill"></i> Send Enquiry
               </button>
             </div>

             <div id="enquiry-status" class="enquiry-status"></div>
           </form>
         </div>

         <!-- Quick Contact Info -->
         <div class="quick-contact-info fade-in-up delay-200">
           <div class="contact-info-item">
             <i class="ri-phone-fill"></i>
             <div>
               <div class="contact-label">Call Us</div>
               <a href="tel:+919339727733" class="contact-value">+91 93397 27733</a>
             </div>
           </div>
           <div class="contact-info-item">
             <i class="ri-whatsapp-fill"></i>
             <div>
               <div class="contact-label">WhatsApp</div>
               <a href="https://wa.me/919339727733" target="_blank" class="contact-value">Chat with Us</a>
             </div>
           </div>
           <div class="contact-info-item">
             <i class="ri-time-line"></i>
             <div>
               <div class="contact-label">Available</div>
               <div class="contact-value">24/7 Support</div>
             </div>
           </div>
         </div>
       </div>
    </section>

    <footer class="site-footer">
       <div style="font-size: 1.5rem; font-weight: 800; margin-bottom: 20px;">Sikkim Taxi Service</div>
       <p style="opacity: 0.7; max-width: 400px; margin: 0 auto 30px;">Connecting travelers to the beauty of the Himalayas with safety and technology.</p>
       <div style="opacity: 0.5; font-size: 0.9rem;">&copy; 2026 Sikkim Taxi Service. All rights reserved.</div>
    </footer>

    <!-- Confirmation Modal -->
    <div id="booking-modal" class="modal-overlay">
      <div class="modal-card">
        <button class="btn-close" onclick="closeModal()">×</button>
        <h2 class="modal-title">Confirm Booking</h2>
        
        <div class="booking-summary" id="modal-summary">
           <!-- Populated via JS -->
        </div>

        <div style="margin: 15px 0;">
            <label style="display:block; text-align:left; font-size:0.9rem; color:#64748b; margin-bottom:5px;">Your Details</label>
            <input type="text" id="book-name" class="app-input" placeholder="Full Name" style="width:100%; margin-bottom:10px; border:1px solid #cbd5e1;">
            <input type="tel" id="book-phone" class="app-input" placeholder="Phone Number" style="width:100%; margin-bottom:10px; border:1px solid #cbd5e1;">
            <input type="email" id="book-email" class="app-input" placeholder="Email Address" style="width:100%; border:1px solid #cbd5e1;">
        </div>

        <div id="booking-status" class="enquiry-status" style="margin-bottom: 15px;"></div>

        <div class="modal-actions">
           <button class="btn-whatsapp" onclick="finalizeBooking('whatsapp')">
              <span>Book on WhatsApp</span>
           </button>
           <button class="btn-email" onclick="finalizeBooking('email')">
              Book via Email
           </button>
        </div>
        <p style="text-align: center; font-size: 0.8rem; color: #94a3b8; margin-top: 15px;">Fastest response via WhatsApp</p>
      </div>
    </div>

  </div>
`;

// Logic Binding
const pickupInput = document.getElementById('pickup');
const dropInput = document.getElementById('drop');
const dateInput = document.getElementById('date');
const actionBtn = document.getElementById('action-btn');
const stepLocation = document.getElementById('step-location');
const stepVehicle = document.getElementById('step-vehicle');
const vehicleListContainer = document.getElementById('vehicle-list-container');
const backBtn = document.getElementById('back-btn');
const modal = document.getElementById('booking-modal');
const modalSummary = document.getElementById('modal-summary');

// Set today's date
dateInput.valueAsDate = new Date();

// Open Modal Helper
function openBookingModal() {
  const veh = vehicles.find(v => v.id === state.selectedVehicle);

  // Reset inputs when opening
  const nameInput = document.getElementById('book-name');
  const phoneInput = document.getElementById('book-phone');
  const emailInput = document.getElementById('book-email');
  const statusEl = document.getElementById('booking-status');

  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (emailInput) emailInput.value = '';
  if (statusEl) {
    statusEl.style.display = 'none';
    statusEl.className = 'enquiry-status';
  }

  // Populate Modal
  modalSummary.innerHTML = `
    <div class="summary-row">
       <span class="summary-label"><i class="ri-map-pin-2-line"></i> Route</span>
       <span class="summary-value">${state.pickup} <i class="ri-arrow-right-line" style="font-size:0.8rem; color:#94a3b8;"></i> ${state.drop}</span>
    </div>
    <div class="summary-row">
       <span class="summary-label"><i class="ri-roadster-line"></i> Vehicle</span>
       <span class="summary-value">${veh.name}</span>
    </div>
    <div class="summary-row">
       <span class="summary-label"><i class="ri-calendar-event-line"></i> Date</span>
       <span class="summary-value">${state.date}</span>
    </div>
    <hr style="border:0; border-top:1px dashed #cbd5e1; margin:10px 0;">
    <div class="summary-row" style="font-size: 1.1rem;">
       <span class="summary-label">Total Estimate</span>
       <span class="summary-value">₹${veh.price}</span>
    </div>
  `;

  modal.classList.add('active');
}

// Render Vehicles with Click-to-Open logic
function renderVehicles() {
  vehicleListContainer.innerHTML = vehicles.map(v => `
    <div class="vehicle-option" onclick="selectVehicle('${v.id}', true)" id="veh-${v.id}">
      <div style="font-size: 2rem; margin-right: 15px;">${v.id === 'innova' || v.id === 'scorpio' ? '🚐' : '🚗'}</div>
      <div class="veh-info">
        <div class="veh-name">${v.name} <span class="seat-badge">${v.seats} seats</span></div>
        <div class="veh-meta">${v.time} away • ${v.type}</div>
      </div>
      <div class="veh-price">₹${v.price}</div>
    </div>
  `).join('');
}

// Handle State Changes
window.selectVehicle = (id, shouldOpen = false) => {
  state.selectedVehicle = id;
  // Update Visuals
  document.querySelectorAll('.vehicle-option').forEach(el => el.classList.remove('selected'));
  const el = document.getElementById(`veh-${id}`);
  if (el) el.classList.add('selected');

  // Update Button
  const veh = vehicles.find(v => v.id === id);
  actionBtn.innerText = `Confirm ${veh.name}`;
  actionBtn.style.background = '#000'; // Reset color

  if (shouldOpen) {
    openBookingModal();
  }
}

// Modal Functions
window.closeModal = () => {
  modal.classList.remove('active');

  // Reset the form to initial state
  state.step = 1;
  stepVehicle.classList.add('hidden');
  stepLocation.classList.remove('hidden');
  actionBtn.innerText = "Find Ride";
  actionBtn.style.background = 'var(--gradient-ocean)';
  actionBtn.disabled = false;
}

window.finalizeBooking = async (method) => {
  const name = document.getElementById('book-name').value.trim();
  const phone = document.getElementById('book-phone').value.trim();
  const email = document.getElementById('book-email').value.trim();
  const statusEl = document.getElementById('booking-status');

  // Helper to show status inside modal
  const showStatus = (msg, type) => {
    statusEl.textContent = msg;
    statusEl.className = `enquiry-status ${type}`; // Reusing existing css class
    statusEl.style.display = 'block';
  };

  if (!name || !phone) {
    showStatus("Please enter at least Name and Phone Number.", 'error');
    return;
  }

  // If Email method, Email is required
  if (method === 'email' && !email) {
    showStatus("Please enter your Email Address for email booking.", 'error');
    return;
  }

  const veh = vehicles.find(v => v.id === state.selectedVehicle);
  const details = {
    name: name,
    email: email, // Can be empty if whatsapp
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

      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showStatus('✓ Booking Request Sent! Check your email.', 'success');
        setTimeout(() => closeModal(), 2000); // Close after 2s
      } else {
        showStatus(`Failed: ${data.message || 'Server error'}`, 'error');
      }
    } catch (e) {
      console.error(e);
      showStatus('Connection error. Please try WhatsApp.', 'error');
    }
  }
}

actionBtn.addEventListener('click', () => {
  state.pickup = pickupInput.value;
  state.drop = dropInput.value;
  state.date = dateInput.value;

  if (state.step === 1) {
    if (!state.pickup || !state.drop) {
      alert("Please enter pickup and drop locations");
      return;
    }
    // Move to Step 2
    state.step = 2;
    stepLocation.classList.add('hidden');
    stepVehicle.classList.remove('hidden');
    stepVehicle.classList.add('animate-in');

    renderVehicles();
    actionBtn.innerText = "Select a Vehicle";
    actionBtn.disabled = true; // wait for selection
    actionBtn.style.background = '#cbd5e1';

    // Auto Select first one for UX
    selectVehicle('innova', false); // Don't open modal automatically on initial load
    actionBtn.disabled = false;
  } else {
    // Open Confirmation Modal (Manual Click)
    openBookingModal();
  }
});

backBtn.addEventListener('click', () => {
  state.step = 1;
  stepVehicle.classList.add('hidden');
  stepLocation.classList.remove('hidden');
  actionBtn.innerText = "Find Ride";
  actionBtn.style.background = '#000';
});

// Enquiry Form Handler
const enquiryForm = document.getElementById('enquiry-form');
const enquiryStatus = document.getElementById('enquiry-status');
const enquirySubmitBtn = document.getElementById('enquiry-submit-btn');

enquiryForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('enquiry-name').value.trim();
  const email = document.getElementById('enquiry-email').value.trim();
  const phone = document.getElementById('enquiry-phone').value.trim();
  const subject = document.getElementById('enquiry-subject').value;
  const message = document.getElementById('enquiry-message').value.trim();

  // Validate form
  if (!name || !email || !phone || !subject || !message) {
    showEnquiryStatus('Please fill in all fields', 'error');
    return;
  }

  // Show loading state
  enquirySubmitBtn.disabled = true;
  enquirySubmitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Sending...';

  try {
    const response = await fetch('/api/enquiry', {
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
    // Reset button
    enquirySubmitBtn.disabled = false;
    enquirySubmitBtn.innerHTML = '<i class="ri-send-plane-fill"></i> Send Enquiry';
  }
});

function showEnquiryStatus(message, type) {
  enquiryStatus.textContent = message;
  enquiryStatus.className = `enquiry-status ${type}`;
  enquiryStatus.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    enquiryStatus.style.display = 'none';
  }, 5000);
}
