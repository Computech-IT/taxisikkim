// ================================
// DOM READY
// ================================
document.addEventListener('DOMContentLoaded', () => {

    // ================================
    // HELPERS & DATA
    // ================================
    const $ = (id) => document.getElementById(id);

    const safeValue = (id, value = '') => {
        const el = $(id);
        if (el && value !== undefined) el.value = value;
    };

    const showToast = (message, type = 'success') => {
        const container = $('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="${type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };


    const openWhatsApp = (details) => {
        const phone = "919339727733"; // Updated business number
        const text = `Hello Sikkim Taxi Service! %0A%0A` +
            `I would like to book a ride:%0A` +
            `*From:* ${details.pickup}%0A` +
            `*To:* ${details.drop}%0A` +
            `*Date:* ${details.date}%0A` +
            `*Vehicle:* ${details.vehicle}%0A` +
            `*Customer:* ${details.name}%0A` +
            `*Phone:* ${details.phone}%0A%0A` +
            `Please confirm my booking.`;
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    };

    const vehicleData = [
        { id: 'WagonR', name: 'WagonR', seats: 4, rate: 2500, icon: '🚗' },
        { id: 'Innova', name: 'Innova', seats: 7, rate: 4500, icon: '🚐' },
        { id: 'Crysta', name: 'Innova Crysta', seats: 7, rate: 5500, icon: '✨' },
        { id: 'Scorpio', name: 'Scorpio', seats: 7, rate: 4000, icon: '🚜' }
    ];

    let bookingState = {
        pickup: '',
        drop: '',
        date: '',
        vehicle: null,
        rate: 0
    };

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
        [stepSelection, stepConfirmation, stepSuccess].forEach(el => el?.classList.remove('active'));
        if (step === 1) stepSelection?.classList.add('active');
        if (step === 2) stepConfirmation?.classList.add('active');
        if (step === 3) stepSuccess?.classList.add('active');
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
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', () => modal?.classList.remove('active'));

    // ================================
    // EVENT LISTENERS
    // ================================
    document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            bookingState.pickup = '';
            bookingState.drop = '';
            bookingState.date = '';
            modal?.classList.add('active');
            populateVehicles();
            showStep(1);
        });
    });

    const rideFinderForm = $('mainBookingForm');
    if (rideFinderForm) {
        rideFinderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            bookingState.pickup = $('ride-from')?.value.trim();
            bookingState.drop = $('ride-to')?.value.trim();
            bookingState.date = $('ride-date')?.value;

            safeValue('book-pickup', bookingState.pickup);
            safeValue('book-drop', bookingState.drop);
            safeValue('book-date', bookingState.date);

            modal?.classList.add('active');
            populateVehicles();
            showStep(1);
        });
    }

    if (modalClose) modalClose.addEventListener('click', () => modal?.classList.remove('active'));

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
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: $('book-name')?.value.trim(),
                phone: $('book-phone')?.value.trim(),
                email: $('book-email')?.value.trim(),
                pickup: bookingState.pickup,
                drop: bookingState.drop,
                date: bookingState.date,
                vehicle: bookingState.vehicle,
                rate: bookingState.rate
            };

            // Basic validation
            if (!payload.name || !payload.phone || !payload.email || !payload.pickup || !payload.drop || !payload.date || !payload.vehicle || !payload.rate) {
                showToast('Please fill all required booking fields.', 'error');
                return;
            }

            try {
                // Show loading spinner
                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.classList.add('btn-loading');

                const res = await fetch('/api/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // Remove loading spinner
                if (submitBtn) submitBtn.classList.remove('btn-loading');
                if (res.ok) {
                    // Show inline notification below the button
                    if (inlineNotify) {
                        inlineNotify.textContent = 'Success! Your ride has been requested. Redirecting you home...';
                        inlineNotify.className = 'inline-notification success';
                    }

                    showToast('Success! Your ride has been requested.');
                    bookingForm.reset();

                    // Wait 3 seconds then redirect
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 3000);
                } else {
                    let errorMsg = 'Failed to book';
                    try {
                        const errorData = await res.json();
                        errorMsg = errorData.debug || errorData.message || errorMsg;
                    } catch (e) {
                        const text = await res.text();
                        errorMsg = text || errorMsg;
                    }
                    throw new Error(errorMsg);
                }
            } catch (err) {
                console.error('FRONTEND_ERROR:', err);
                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.classList.remove('btn-loading');

                if (inlineNotify) {
                    inlineNotify.textContent = `Error: ${err.message}`;
                    inlineNotify.className = 'inline-notification error';
                }
                showToast(err.message, 'error');
            }
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const details = {
                name: $('book-name')?.value.trim(),
                phone: $('book-phone')?.value.trim(),
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
        enquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                name: $('enq-name')?.value.trim(),
                email: $('enq-email')?.value.trim(),
                phone: $('enq-phone')?.value.trim(),
                subject: $('enq-subject')?.value.trim(),
                message: $('enq-message')?.value.trim()
            };

            for (const key in payload) {
                if (!payload[key]) {
                    showToast('Please fill all enquiry fields', 'error');
                    return;
                }
            }

            try {
                // Show loading spinner
                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.classList.add('btn-loading');

                const res = await fetch('/api/enquiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // Remove loading spinner
                if (submitBtn) submitBtn.classList.remove('btn-loading');

                if (res.ok) {
                    if (enqInlineNotify) {
                        enqInlineNotify.textContent = 'Success! Your enquiry has been sent. We will contact you soon.';
                        enqInlineNotify.className = 'inline-notification success';
                    }
                    showToast('Enquiry sent successfully!');
                    enquiryForm.reset();

                    // Optional: hide message after 5 seconds
                    setTimeout(() => {
                        if (enqInlineNotify) enqInlineNotify.style.display = 'none';
                    }, 5000);
                } else {
                    let errorMsg = 'Failed to send enquiry';
                    try {
                        const errorData = await res.json();
                        errorMsg = errorData.debug || errorData.message || errorMsg;
                    } catch (e) {
                        const text = await res.text();
                        errorMsg = text || errorMsg;
                    }
                    throw new Error(errorMsg);
                }
            } catch (err) {
                console.error('FRONTEND_ERROR:', err);
                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.classList.remove('btn-loading');

                if (enqInlineNotify) {
                    enqInlineNotify.textContent = `Error: ${err.message}`;
                    enqInlineNotify.className = 'inline-notification error';
                }
                showToast(err.message, 'error');
            }
        });
    }

    // Initialize dates
    const dateInputs = ['ride-date'];
    dateInputs.forEach(id => {
        const el = $(id);
        if (el) el.valueAsDate = new Date();
    });
});
