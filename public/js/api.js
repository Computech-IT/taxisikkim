import { showToast } from './utils.js';

export const submitBooking = async (payload, { submitBtn, bookingForm, inlineNotify }) => {
    // Basic validation
    if (!payload.name || !payload.phone || !payload.email || !payload.pickup || !payload.drop || !payload.date || !payload.vehicle || !payload.rate) {
        showToast('Please fill all required booking fields.', 'error');
        return;
    }

    try {
        if (submitBtn) submitBtn.classList.add('btn-loading');

        const res = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (submitBtn) submitBtn.classList.remove('btn-loading');

        if (res.ok) {
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
        if (submitBtn) submitBtn.classList.remove('btn-loading');

        if (inlineNotify) {
            inlineNotify.textContent = `Error: ${err.message}`;
            inlineNotify.className = 'inline-notification error';
        }
        showToast(err.message, 'error');
    }
};

export const submitEnquiry = async (payload, { submitBtn, enquiryForm, enqInlineNotify }) => {
    for (const key in payload) {
        if (!payload[key]) {
            showToast('Please fill all enquiry fields', 'error');
            return;
        }
    }

    try {
        if (submitBtn) submitBtn.classList.add('btn-loading');

        const res = await fetch('/api/enquiry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

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
        if (submitBtn) submitBtn.classList.remove('btn-loading');

        if (enqInlineNotify) {
            enqInlineNotify.textContent = `Error: ${err.message}`;
            enqInlineNotify.className = 'inline-notification error';
        }
        showToast(err.message, 'error');
    }
};

export const fetchReviews = async () => {
    try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
            return await res.json();
        }
        throw new Error('Failed to fetch reviews');
    } catch (err) {
        console.error('FETCH_REVIEWS_ERROR:', err);
        return { success: false, reviews: [] };
    }
};

export const submitReview = async (formData, { submitBtn, reviewForm, inlineNotify }) => {
    try {
        if (submitBtn) submitBtn.classList.add('btn-loading');

        const res = await fetch('/api/reviews', {
            method: 'POST',
            body: formData // Note: No Content-Type header needed for FormData
        });

        if (submitBtn) submitBtn.classList.remove('btn-loading');

        if (res.ok) {
            if (inlineNotify) {
                inlineNotify.textContent = 'Thank you! Your review has been posted.';
                inlineNotify.className = 'inline-notification success';
            }
            showToast('Review posted successfully!');
            reviewForm.reset();
            return true;
        } else {
            const data = await res.json();
            throw new Error(data.message || 'Failed to submit review');
        }
    } catch (err) {
        console.error('FRONTEND_ERROR [Submit Review]:', err);
        if (submitBtn) submitBtn.classList.remove('btn-loading');
        if (inlineNotify) {
            inlineNotify.textContent = `Error: ${err.message}`;
            inlineNotify.className = 'inline-notification error';
        }
        showToast(err.message, 'error');
        return false;
    }
};
