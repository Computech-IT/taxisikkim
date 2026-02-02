// ================================
// IMPORTS
// ================================
import { $, safeValue, showToast, openWhatsApp } from './utils.js';
import { vehicleData, bookingState } from './data.js';
import { submitBooking, submitEnquiry } from './api.js';

// ================================
// DOM READY
// ================================
document.addEventListener('DOMContentLoaded', () => {

    // ================================
    // MODAL FLOW MANAGEMENT
    // ================================
    const modal = $('bookingModal');
    const modalClose = $('closeModal');
    const stepSelection = $('modal-step-selection');
    const stepConfirmation = $('modal-step-confirmation');
    const stepSuccess = $('modal-step-success');
    const vehicleListContainer = $('vehicle-selection-list');
    const backBtn = $('backToSelection');
    const closeSuccessBtn = $('closeSuccessModal');
    const whatsappBtn = $('whatsapp-booking-btn');
    const inlineNotify = $('form-inline-notification');
    const enqInlineNotify = $('enq-inline-notification');

    const showStep = (step) => {
        [stepSelection, stepConfirmation, stepSuccess].forEach(el => el && el.classList.remove('active'));
        if (step === 1) stepSelection && stepSelection.classList.add('active');
        if (step === 2) stepConfirmation && stepConfirmation.classList.add('active');
        if (step === 3) stepSuccess && stepSuccess.classList.add('active');
    };

    const populateVehicles = () => {
        if (!vehicleListContainer) return;
        vehicleListContainer.innerHTML = '';

        vehicleData.forEach(veh => {
            const card = document.createElement('div');
            card.className = 'vehicle-option';
            card.innerHTML = `
                <div class="veh-icon" style="font-size: 2rem;">${veh.icon}</div>
                <div class="veh-info">
                    <div class="veh-name">${veh.name} <span class="seat-badge">${veh.seats} Seats</span></div>
                    <div class="veh-desc" style="font-size: 0.8rem; color: var(--color-text-muted);">Sanitized & Professional Service</div>
                </div>
                <div class="veh-price" style="text-align: right;">
                    <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-electric);">₹${veh.rate}</div>
                    <div style="font-size: 0.7rem; color: var(--color-text-dim);">Estimated Total</div>
                </div>
            `;
            card.onclick = () => selectVehicle(veh);
            vehicleListContainer.appendChild(card);
        });
    };

    const selectVehicle = (veh) => {
        bookingState.vehicle = veh.id;
        bookingState.rate = veh.rate;

        // Update Summary in Step 2
        const summary = $('chosen-vehicle-summary');
        if (summary) {
            summary.innerHTML = `
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; margin-bottom: 20px; border-left: 4px solid var(--color-electric);">
                    <div style="font-weight: 700; color: var(--color-text-primary);">${veh.name} selected</div>
                    <div style="font-size: 0.9rem; color: var(--color-text-secondary);">From: ${bookingState.pickup} To: ${bookingState.drop}</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-electric); margin-top: 5px;">₹${veh.rate} Total</div>
                </div>
            `;
        }

        safeValue('book-vehicle', veh.id);
        showStep(2);
    };

    if (backBtn) backBtn.addEventListener('click', () => showStep(1));
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', () => modal && modal.classList.remove('active'));

    // ================================
    // EVENT LISTENERS
    // ================================
    document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            bookingState.pickup = '';
            bookingState.drop = '';
            bookingState.date = '';
            modal && modal.classList.add('active');
            populateVehicles();
            showStep(1);
        });
    });

    const rideFinderForm = $('mainBookingForm');
    if (rideFinderForm) {
        rideFinderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            bookingState.pickup = $('ride-from') ? $('ride-from').value.trim() : '';
            bookingState.drop = $('ride-to') ? $('ride-to').value.trim() : '';
            bookingState.date = $('ride-date') ? $('ride-date').value : '';

            safeValue('book-pickup', bookingState.pickup);
            safeValue('book-drop', bookingState.drop);
            safeValue('book-date', bookingState.date);

            modal && modal.classList.add('active');
            populateVehicles();
            showStep(1);
        });
    }

    if (modalClose) modalClose.addEventListener('click', () => modal && modal.classList.remove('active'));

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });

    // ================================
    // FORM SUBMISSIONS
    // ================================
    const bookingForm = $('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const payload = {
                name: $('book-name') ? $('book-name').value.trim() : '',
                phone: $('book-phone') ? $('book-phone').value.trim() : '',
                email: $('book-email') ? $('book-email').value.trim() : '',
                pickup: bookingState.pickup,
                drop: bookingState.drop,
                date: bookingState.date,
                vehicle: bookingState.vehicle,
                rate: bookingState.rate
            };
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBooking(payload, { submitBtn, bookingForm, inlineNotify });
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const details = {
                name: $('book-name') ? $('book-name').value.trim() : '',
                phone: $('book-phone') ? $('book-phone').value.trim() : '',
                pickup: bookingState.pickup,
                drop: bookingState.drop,
                date: bookingState.date,
                vehicle: bookingState.vehicle
            };

            if (!details.name || !details.phone) {
                showToast('Please enter your name and phone first.', 'error');
                return;
            }

            openWhatsApp(details);
        });
    }

    // Enquiry Form
    const enquiryForm = $('enquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const payload = {
                name: $('enq-name') ? $('enq-name').value.trim() : '',
                email: $('enq-email') ? $('enq-email').value.trim() : '',
                phone: $('enq-phone') ? $('enq-phone').value.trim() : '',
                subject: $('enq-subject') ? $('enq-subject').value.trim() : '',
                message: $('enq-message') ? $('enq-message').value.trim() : ''
            };
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitEnquiry(payload, { submitBtn, enquiryForm, enqInlineNotify });
        });
    }

    // Initialize dates
    const dateInputs = ['ride-date'];
    dateInputs.forEach(id => {
        const el = $(id);
        if (el) el.valueAsDate = new Date();
    });
});
