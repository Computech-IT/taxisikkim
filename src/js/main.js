// ================================
// IMPORTS
// ================================
import { $, safeValue, showToast, openWhatsApp } from './utils.js';
import { vehicleData, bookingState, fetchVehicles } from './data.js';
import { submitBooking, submitEnquiry, fetchReviews, submitReview } from './api.js';

// ================================
// DOM READY
// ================================
document.addEventListener('DOMContentLoaded', () => {

    // ================================
    // MOBILE NAVIGATION
    // ================================
    const navToggle = $('navToggle');
    const navLinks = $('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'ri-close-line';
                document.body.style.overflow = 'hidden';
            } else {
                icon.className = 'ri-menu-3-line';
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.className = 'ri-menu-3-line';
                document.body.style.overflow = '';
            });
        });
    }

    // ================================
    // MODAL FLOW MANAGEMENT (Robust)
    // ================================
    const bookingModal = $('bookingModal');
    const reviewModal = $('reviewModal');

    // Unified Modal Toggle function
    const toggleModal = (modalEl, show = true) => {
        if (!modalEl) return;
        console.log(`Toggling Modal ${modalEl.id}: ${show}`);
        if (show) {
            modalEl.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        } else {
            modalEl.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // Review Modal Open
    const openReviewBtn = $('openReviewModal');
    const starRatingInput = document.querySelector('.star-rating-input');
    const ratingInput = $('rev-rating');
    const imageInput = $('rev-image');
    const imagePreview = $('image-preview');
    const reviewForm = $('reviewForm');

    if (openReviewBtn) {
        openReviewBtn.addEventListener('click', (e) => {
            console.log('Review Button Clicked');
            e.preventDefault();
            toggleModal(reviewModal, true);
        });
    }

    const stepSelection = $('modal-step-selection');
    const stepConfirmation = $('modal-step-confirmation');
    const stepSuccess = $('modal-step-success');
    const vehicleListContainer = $('vehicle-selection-list');
    const backBtn = $('backToSelection');
    const whatsappBtn = $('whatsapp-booking-btn');
    const inlineNotify = $('form-inline-notification');
    const enqInlineNotify = $('enq-inline-notification');

    const showStep = (step) => {
        [stepSelection, stepConfirmation, stepSuccess].forEach(el => el && el.classList.remove('active'));
        if (step === 1) stepSelection && stepSelection.classList.add('active');
        if (step === 2) stepConfirmation && stepConfirmation.classList.add('active');
        if (step === 3) stepSuccess && stepSuccess.classList.add('active');
    };

    // Close buttons for both modals
    document.querySelectorAll('.btn-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-close') || e.target.classList.contains('modal-overlay')) {
                const targetModal = e.target.closest('.modal-overlay');
                toggleModal(targetModal, false);
            }
        });
    });

    // Booking Modal Open Buttons (all .book-btn)
    document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Booking Button Clicked');
            bookingState.pickup = '';
            bookingState.drop = '';
            bookingState.date = '';
            toggleModal(bookingModal, true);
            populateVehicles();
            showStep(1);
        });
    });


    const populateVehicles = async () => {
        if (!vehicleListContainer) return;
        vehicleListContainer.innerHTML = `
            <div style="text-align:center; padding: 40px; color: var(--color-text-muted);">
                <i class="ri-loader-4-line ri-spin" style="font-size: 2rem;"></i>
                <p>Finding available rides...</p>
            </div>
        `;

        const data = await fetchVehicles();
        vehicleListContainer.innerHTML = '';

        if (data.length === 0) {
            vehicleListContainer.innerHTML = '<p style="text-align:center; padding:20px;">No vehicles available at the moment.</p>';
            return;
        }

        data.forEach(veh => {
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

    const closeSuccessBtn = $('closeSuccessModal');
    if (backBtn) backBtn.addEventListener('click', () => showStep(1));
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', () => toggleModal(bookingModal, false));


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

            toggleModal(bookingModal, true);
            populateVehicles();
            showStep(1);
        });
    }

    const modalClose = $('closeModal');
    if (modalClose) modalClose.addEventListener('click', () => toggleModal(bookingModal, false));

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleModal(bookingModal, false);
            toggleModal(reviewModal, false);
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

    // ================================
    // REVIEW POPULATION
    // ================================
    const testimonialsRow = document.querySelector('.testimonials-row');

    const populateReviews = async () => {
        if (!testimonialsRow) return;

        const data = await fetchReviews();
        if (!data.success || !data.reviews) return;

        // If no reviews in DB, keep the static ones (don't clear)
        if (data.reviews.length === 0) return;

        // Clear existing reviews
        testimonialsRow.innerHTML = '';

        data.reviews.forEach(review => {
            const card = document.createElement('div');
            card.className = 'testimonial-card-white';
            card.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px); display: flex; flex-direction: column; justify-content: space-between;';

            // Star rating HTML
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += `<i class="${i <= review.rating ? 'ri-star-fill' : 'ri-star-line'}"></i>`;
            }

            const imageHtml = review.image_path
                ? `<img src="${review.image_path}" class="review-card-image" alt="Review photo">`
                : '';

            card.innerHTML = `
                <div>
                    <div style="color: #fbbf24; margin-bottom: 20px; font-size: 0.95rem;">
                        ${stars}
                    </div>
                    ${imageHtml}
                    <p style="margin-bottom: 30px; font-style: italic; color: rgba(255,255,255,0.95); font-size: 1.05rem; line-height: 1.7;">
                        "${review.text}"
                    </p>
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px;">
                    <div style="font-weight: 700; color: white; font-size: 1.1rem; margin-bottom: 4px;">${review.author_name}</div>
                    <div style="font-size: 0.85rem; color: var(--color-electric); font-weight: 600; display: flex; align-items: center; gap: 6px;">
                        <i class="ri-checkbox-circle-fill"></i> Verified Customer
                    </div>
                </div>
            `;
            testimonialsRow.appendChild(card);
        });
    };

    populateReviews();



    // Star Rating Logic
    if (starRatingInput) {
        const stars = starRatingInput.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.value);
                stars.forEach((s, idx) => {
                    s.className = (idx < val) ? 'ri-star-fill' : 'ri-star-line';
                });
            });

            star.addEventListener('click', () => {
                const val = star.dataset.value;
                ratingInput.value = val;
                stars.forEach((s, idx) => {
                    s.className = (idx < val) ? 'ri-star-fill' : 'ri-star-line';
                });
            });
        });

        starRatingInput.addEventListener('mouseleave', () => {
            const val = parseInt(ratingInput.value);
            stars.forEach((s, idx) => {
                s.className = (idx < val) ? 'ri-star-fill' : 'ri-star-line';
            });
        });
    }

    // Image Preview
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (prev) => {
                    imagePreview.querySelector('img').src = prev.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
            }
        });
    }

    // Submit Review
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(reviewForm);
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const inlineNotify = $('rev-inline-notification');

            const success = await submitReview(formData, { submitBtn, reviewForm, inlineNotify });
            if (success) {
                setTimeout(() => {
                    toggleModal(reviewModal, false);
                    populateReviews(); // Refresh list
                }, 2000);
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
