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
      <div class="brand">Sikkim Taxi Service</div>
      <ul class="nav-links">
        <li><a href="#hero">Book</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#testimonials">Reviews</a></li>
      </ul>
      <a href="tel:+919876543210" style="padding: 10px 20px; background: #000; color: white; border-radius: 30px; text-decoration: none; font-size: 0.9rem;">Call Us</a>
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
                <input type="text" id="pickup" class="app-input" placeholder="Pickup location" value="Bagdogra Airport">
              </div>
              <div class="input-row">
                <div class="input-icon square"></div>
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

        <div class="modal-actions">
           <button class="btn-whatsapp" onclick="finalizeBooking('whatsapp')">
              <span>Chat on WhatsApp</span>
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
}

window.finalizeBooking = async (method) => {
  const veh = vehicles.find(v => v.id === state.selectedVehicle);
  const details = {
    vehicle: veh.name,
    pickup: state.pickup,
    drop: state.drop,
    date: state.date,
    price: veh.price
  };

  if (method === 'whatsapp') {
    const message = `Hi, I want to book a ride.%0A%0A🚖 *Vehicle*: ${details.vehicle}%0A📍 *From*: ${details.pickup}%0A🏁 *To*: ${details.drop}%0A📅 *Date*: ${details.date}%0A💰 *Price*: Approx ₹${details.price}`;
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
    closeModal();
  } else if (method === 'email') {
    // Basic Email Logic - In a real app, prompts for User Email
    const userEmail = prompt("Please confirm your email address:", "user@example.com");
    if (userEmail) {
      try {
        const response = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...details, email: userEmail })
        });
        if (response.ok) {
          alert(`Booking Request Sent! Check ${userEmail} for details.`);
        } else {
          alert('Connection error. Please try WhatsApp.');
        }
      } catch (e) {
        alert('Error sending request. Please try WhatsApp.');
      }
    }
    closeModal();
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
