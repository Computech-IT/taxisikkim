import './style.css';

// =====================
// Inject Full HTML
// =====================
document.querySelector('#app').innerHTML = `
  <div class="map-visual"></div>

  <div class="website-content">
    <nav class="navbar">
      <a href="#hero" class="brand">Sikkim Taxi Service</a>
      <ul class="nav-links">
        <li><a href="#hero">Book</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#testimonials">Reviews</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <a href="tel:+919339727733" style="padding:10px 20px; background:#000; color:white; border-radius:30px; text-decoration:none; font-size:0.9rem;">Call Us</a>
    </nav>

    <section id="hero" class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content">
          <h1 class="hero-title">The Smartest Way to Travel in Sikkim</h1>
        </div>

        <div class="app-widget-card" id="booking-widget">
          <div id="step-location" class="booking-container">
            <h2 class="step-title" style="margin-bottom: 20px;">Plan Your Journey</h2>
            
            <div class="location-inputs">
              <div class="form-group" style="margin-bottom: 15px;">
                <label class="form-label" style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; display: block;">
                  <i class="ri-map-pin-line" style="color: #3b82f6;"></i> Pickup From
                </label>
                <input type="text" id="pickup" class="app-input" placeholder="Pickup location" value="Bagdogra Airport" style="width: 100%;">
              </div>
              
              <div class="form-group" style="margin-bottom: 15px;">
                <label class="form-label" style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; display: block;">
                  <i class="ri-map-pin-2-fill" style="color: #ef4444;"></i> Drop To
                </label>
                <input type="text" id="drop" class="app-input" placeholder="Drop location" value="Gangtok, MG Marg" style="width: 100%;">
              </div>
            </div>
            
            <div class="form-group" style="margin-top: 20px;">
              <label class="form-label" style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; display: block;">
                <i class="ri-calendar-line" style="color: #6366f1;"></i> Travel Date
              </label>
              <input type="date" id="date" class="app-input" style="width: 100%;">
            </div>
            
            <div style="margin-top: 25px;">
              <button id="action-btn" class="btn-black" style="width: 100%; padding: 16px; border-radius: 14px; font-weight: 700;">Find Available Rides</button>
            </div>
          </div>

          <div id="step-vehicle" class="booking-container hidden">
            <button id="back-btn" style="background:none; border:none; font-size:0.9rem; margin-bottom:15px; cursor:pointer; color:#64748b;">← Back</button>
            <h2 class="step-title">Choose a ride</h2>
            <div class="vehicle-list" id="vehicle-list-container" style="max-height:300px; overflow-y:auto;"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="section">
      <h2 class="section-title">More than just a Taxi</h2>
      <div class="services-grid">
        <div class="service-card">
          <div class="service-icon"><i class="ri-plane-fill" style="color: var(--color-brand);"></i></div>
          <h3>Airport Transfers</h3>
          <p style="color:#64748b;">Punctual pickups from Bagdogra (IXB) and Pakyong. We track flights to ensure no waiting charges.</p>
        </div>
        <div class="service-card">
          <div class="service-icon"><i class="ri-mountain-fill" style="color: var(--color-brand);"></i></div>
          <h3>Sightseeing Packages</h3>
          <p style="color:#64748b;">Curated tours for Nathula Pass, Tsomgo Lake, Pelling Skywalk, and North Sikkim valleys.</p>
        </div>
        <div class="service-card">
          <div class="service-icon"><i class="ri-briefcase-4-fill" style="color: var(--color-brand);"></i></div>
          <h3>Corporate Travel</h3>
          <p style="color:#64748b;">Premium fleet (Innova Crysta) for business meetings and VIP delegates in Gangtok.</p>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="section" style="background: #0f172a; padding: 100px 20px; border-top: 1px solid rgba(255,255,255,0.05);">
       <h2 class="section-title" style="color: white; margin-bottom: 10px;">Guest Stories</h2>
       <p style="text-align: center; color: rgba(255,255,255,0.6); margin-bottom: 50px;">Real experiences from travelers who explored Sikkim with us</p>
       
       <div class="testimonials-row" style="display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; scroll-behavior: smooth;">
          <div class="testimonial-card-white" style="min-width: 300px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px);">
             <div>
               <div style="color: #fbbf24; margin-bottom: 15px; font-size: 0.9rem;">
                 <i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i>
               </div>
               <p style="margin-bottom: 25px; font-style: italic; color: rgba(255,255,255,0.9); line-height: 1.6; font-size: 1rem;">"The app-like experience made booking so easy. The driver arrived exactly on time at Bagdogra."</p>
             </div>
             <div>
               <div style="font-weight: 700; color: white;">Anjali M.</div>
               <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;"><i class="ri-map-pin-line"></i> Mumbai, India</div>
             </div>
          </div>

          <div class="testimonial-card-white" style="min-width: 300px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px);">
             <div>
               <div style="color: #fbbf24; margin-bottom: 15px; font-size: 0.9rem;">
                 <i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i>
               </div>
               <p style="margin-bottom: 25px; font-style: italic; color: rgba(255,255,255,0.9); line-height: 1.6; font-size: 1rem;">"Transparent pricing helped us plan our budget perfectly. The Innova Crysta was brand new and very clean."</p>
             </div>
             <div>
               <div style="font-weight: 700; color: white;">David Ross</div>
               <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;"><i class="ri-global-line"></i> United Kingdom</div>
             </div>
          </div>

          <div class="testimonial-card-white" style="min-width: 300px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px);">
             <div>
               <div style="color: #fbbf24; margin-bottom: 15px; font-size: 0.9rem;">
                 <i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i>
               </div>
               <p style="margin-bottom: 25px; font-style: italic; color: rgba(255,255,255,0.9); line-height: 1.6; font-size: 1rem;">"Sikkim Taxi Service is a total game changer. Professional drivers and no haggling needed."</p>
             </div>
             <div>
               <div style="font-weight: 700; color: white;">Rahul Verma</div>
               <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px;"><i class="ri-map-pin-line"></i> Delhi, India</div>
             </div>
          </div>
       </div>
    </section>

    <!-- Enquiry Section -->
    <section id="contact" class="section" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; position: relative; overflow: hidden;">
       <!-- Animated Background Elements -->
       <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none;">
         <div style="position: absolute; top: 20%; left: 10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%); border-radius: 50%; filter: blur(60px);"></div>
         <div style="position: absolute; bottom: 10%; right: 15%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%); border-radius: 50%; filter: blur(80px);"></div>
       </div>

       <div style="position: relative; z-index: 1;">
         <h2 class="section-title" style="color: white; margin-bottom: 15px;">Have Questions?</h2>
         <p style="text-align: center; max-width: 600px; margin: 0 auto 50px; opacity: 0.8; font-size: 1.1rem;">Send us your enquiry and our team will get back to you within 24 hours</p>
         
         <div class="enquiry-form-container">
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
         <div class="quick-contact-info">
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
      <div style="font-size:1.5rem; font-weight:800; margin-bottom:20px;">Sikkim Taxi Service</div>
      <p style="opacity:0.7; max-width:400px; margin:0 auto 30px;">Connecting travelers to the beauty of the Himalayas with safety and technology.</p>
      <div style="opacity:0.5; font-size:0.9rem;">&copy; 2026 Sikkim Taxi Service. All rights reserved.</div>
    </footer>

    <!-- Booking Modal -->
    <div id="booking-modal" class="modal-overlay">
      <div class="modal-card" style="max-width: 450px; padding: 30px;">
        <button class="btn-close" onclick="closeModal()">×</button>
        <h2 class="modal-title" style="font-size: 1.5rem; margin-bottom: 20px;">Confirm Your Ride</h2>
        
        <div class="booking-summary" id="modal-summary" style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
           <!-- Populated via JS -->
        </div>

        <div class="booking-form-fields" style="display: flex; flex-direction: column; gap: 15px;">
          <div class="form-group">
            <label class="form-label" style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px; display: block;">Full Name</label>
            <div style="position: relative;">
              <i class="ri-user-line" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
              <input type="text" id="book-name" class="app-input" placeholder="Enter your full name" style="width: 100%; padding-left: 45px; border: 1px solid #cbd5e1;">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px; display: block;">Phone Number</label>
            <div style="position: relative;">
              <i class="ri-phone-line" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
              <input type="tel" id="book-phone" class="app-input" placeholder="+91 XXXXX XXXXX" style="width: 100%; padding-left: 45px; border: 1px solid #cbd5e1;">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px; display: block;">Email Address</label>
            <div style="position: relative;">
              <i class="ri-mail-line" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
              <input type="email" id="book-email" class="app-input" placeholder="your@email.com" style="width: 100%; padding-left: 45px; border: 1px solid #cbd5e1;">
            </div>
          </div>
        </div>

        <div id="booking-status" class="enquiry-status" style="margin: 20px 0;"></div>

        <div class="modal-actions" style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 10px;">
          <button class="btn-whatsapp" onclick="finalizeBooking('whatsapp')" style="padding: 16px; border-radius: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <i class="ri-whatsapp-line" style="font-size: 1.2rem;"></i> Book on WhatsApp
          </button>
          <button class="btn-email" onclick="finalizeBooking('email')" style="padding: 16px; border-radius: 14px; font-weight: 700; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <i class="ri-mail-send-line" style="font-size: 1.2rem;"></i> Book via Email
          </button>
          <button onclick="closeModal()" style="background: none; border: 1px solid #e2e8f0; padding: 12px; border-radius: 14px; color: #64748b; font-size: 0.9rem; cursor: pointer; transition: all 0.3s;">
            Cancel & Close
          </button>
        </div>
      </div>
    </div>
  </div>
`;

// =====================
// All JS Logic inside DOMContentLoaded
// =====================
window.addEventListener('DOMContentLoaded', () => {

  const state = {
    pickup: '',
    drop: '',
    date: '',
    selectedVehicle: null,
    step: 1
  };

  const vehicles = [
    { id: 'innova', name: 'Innova / Crysta', type: 'Prime SUV', price: 4500, seats: 7, time: '3 min' },
    { id: 'wagonr', name: 'WagonR', type: 'Mini', price: 3500, seats: 4, time: '5 min' },
    // { id: 'alto', name: 'Alto', type: 'Micro', price: 2000, seats: 3, time: '2 min' },
    { id: 'scorpio', name: 'Scorpio', type: 'SUV', price: 4500, seats: 7, time: '8 min' }
  ];

  // DOM Elements
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
  const enquiryForm = document.getElementById('enquiry-form');
  const enquiryStatus = document.getElementById('enquiry-status');
  const enquirySubmitBtn = document.getElementById('enquiry-submit-btn');

  // Initialize date
  dateInput.valueAsDate = new Date();

  // ---- Functions ----

  function renderVehicles() {
    vehicleListContainer.innerHTML = vehicles.map(v => `
      <div class="vehicle-option" onclick="selectVehicle('${v.id}', true)" id="veh-${v.id}">
        <div style="font-size:2rem; margin-right:15px;">${v.id === 'innova' || v.id === 'scorpio' ? '🚐' : '🚗'}</div>
        <div class="veh-info">
          <div class="veh-name">${v.name} <span class="seat-badge">${v.seats} seats</span></div>
          <div class="veh-meta">${v.time} away • ${v.type}</div>
        </div>
        <div class="veh-price">₹${v.price}</div>
      </div>
    `).join('');
  }

  window.selectVehicle = (id, openModal = false) => {
    state.selectedVehicle = id;
    document.querySelectorAll('.vehicle-option').forEach(el => el.classList.remove('selected'));
    const el = document.getElementById(`veh-${id}`);
    if (el) el.classList.add('selected');

    const veh = vehicles.find(v => v.id === id);
    actionBtn.innerText = `Confirm ${veh.name}`;
    actionBtn.style.background = '#000';

    if (openModal) openBookingModal();
  }

  function openBookingModal() {
    const veh = vehicles.find(v => v.id === state.selectedVehicle);
    modalSummary.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #64748b; font-size: 0.9rem;">Route</span>
          <span style="font-weight: 700; color: #0f172a;">${state.pickup} <i class="ri-arrow-right-line" style="color: #94a3b8; font-size: 0.8rem;"></i> ${state.drop}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #64748b; font-size: 0.9rem;">Vehicle</span>
          <span style="font-weight: 700; color: #0f172a;">${veh.name}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #64748b; font-size: 0.9rem;">Travel Date</span>
          <span style="font-weight: 700; color: #0f172a;">${state.date}</span>
        </div>
        <div style="height: 1px; background: #e2e8f0; margin: 5px 0;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem;">
          <span style="font-weight: 600; color: #0f172a;">Total Estimate</span>
          <span style="font-weight: 800; color: #1e293b;">₹${veh.price}</span>
        </div>
      </div>
    `;
    modal.classList.add('active');

    document.getElementById('book-name').value = '';
    document.getElementById('book-phone').value = '';
    document.getElementById('book-email').value = '';
    document.getElementById('booking-status').style.display = 'none';
  }

  window.closeModal = () => {
    modal.classList.remove('active');
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

    const showStatus = (msg, type) => {
      statusEl.textContent = msg;
      statusEl.className = `enquiry-status ${type}`;
      statusEl.style.display = 'block';
    };

    if (!name || !phone) { showStatus("Name & Phone required", 'error'); return; }
    if (method === 'email' && !email) { showStatus("Email required for booking", 'error'); return; }

    const veh = vehicles.find(v => v.id === state.selectedVehicle);
    const details = { name, phone, email, vehicle: veh.name, pickup: state.pickup, drop: state.drop, date: state.date, price: veh.price };

    if (method === 'whatsapp') {
      const message = `Hi, I want to book a ride.%0AVehicle: ${details.vehicle}%0AName: ${details.name}%0APhone: ${details.phone}%0AEmail: ${details.email || 'N/A'}%0AFrom: ${details.pickup}%0ATo: ${details.drop}%0ADate: ${details.date}%0APrice: ₹${details.price}`;
      window.open(`https://wa.me/919339727733?text=${message}`, '_blank');
      closeModal();
    } else {
      try {
        showStatus('Sending booking request...', 'pending');
        const res = await fetch('/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) });
        const data = await res.json();
        if (res.ok && data.success) { showStatus('✓ Booking Request Sent!', 'success'); setTimeout(() => closeModal(), 2000); }
        else { showStatus(`Failed: ${data.message || 'Server error'}`, 'error'); }
      } catch (e) { console.error(e); showStatus('Connection error. Try WhatsApp.', 'error'); }
    }
  }

  actionBtn.addEventListener('click', () => {
    state.pickup = pickupInput.value;
    state.drop = dropInput.value;
    state.date = dateInput.value;
    if (state.step === 1) {
      if (!state.pickup || !state.drop) { alert("Enter pickup & drop"); return; }
      state.step = 2;
      stepLocation.classList.add('hidden');
      stepVehicle.classList.remove('hidden');
      renderVehicles();
      selectVehicle('innova', false);
    } else { openBookingModal(); }
  });

  backBtn.addEventListener('click', () => {
    state.step = 1;
    stepVehicle.classList.add('hidden');
    stepLocation.classList.remove('hidden');
    actionBtn.innerText = "Find Ride";
    actionBtn.style.background = '#000';
  });

  // ---- Enquiry Form ----
  enquiryForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('enquiry-name').value.trim();
    const email = document.getElementById('enquiry-email').value.trim();
    const phone = document.getElementById('enquiry-phone').value.trim();
    const subject = document.getElementById('enquiry-subject').value;
    const message = document.getElementById('enquiry-message').value.trim();

    const showEnquiryStatus = (msg, type) => {
      enquiryStatus.textContent = msg;
      enquiryStatus.className = `enquiry-status ${type}`;
      enquiryStatus.style.display = 'block';
      setTimeout(() => { enquiryStatus.style.display = 'none'; }, 5000);
    };

    if (!name || !email || !phone || !subject || !message) { showEnquiryStatus('Please fill all fields', 'error'); return; }

    enquirySubmitBtn.disabled = true;
    enquirySubmitBtn.textContent = 'Sending...';

    try {
      const res = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phone, subject, message }) });
      const data = await res.json();
      if (res.ok && data.success) { showEnquiryStatus('✓ Enquiry sent!', 'success'); enquiryForm.reset(); }
      else { showEnquiryStatus('Failed to send enquiry. Try WhatsApp or call.', 'error'); }
    } catch (e) { console.error(e); showEnquiryStatus('Connection error. Try WhatsApp or call.', 'error'); }
    finally { enquirySubmitBtn.disabled = false; enquirySubmitBtn.innerHTML = 'Send Enquiry'; }
  });

  // ---- Modal Dismissal Improvements ----

  // Close when clicking outside of the modal card
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

});
