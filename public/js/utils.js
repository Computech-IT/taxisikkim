export const $ = (id) => document.getElementById(id);

export const safeValue = (id, value = '') => {
    const el = $(id);
    if (el && value !== undefined) el.value = value;
};

export const showToast = (message, type = 'success') => {
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

export const openWhatsApp = (details) => {
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
