document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    const vehicleTableBody = document.getElementById('vehicleTableBody');
    const vehicleModal = document.getElementById('vehicleModal');
    const vehicleForm = document.getElementById('vehicleForm');
    const reviewsTableBody = document.getElementById('reviewsTableBody');
    const reviewModal = document.getElementById('reviewModal');
    const reviewEditForm = document.getElementById('reviewEditForm');

    // Check Auth initially
    checkAuth();

    // Login Form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success && data.token) {
                // Store JWT token in localStorage
                localStorage.setItem('adminToken', data.token);
                showDashboard();
            } else {
                errorEl.textContent = data.message || 'Login failed';
                errorEl.style.display = 'block';
            }
        } catch (err) {
            console.error('Login error:', err);
            errorEl.textContent = 'Server error. Try again.';
            errorEl.style.display = 'block';
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        showLogin();
    });

    // Helper functions
    function checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (token) {
            showDashboard();
        } else {
            showLogin();
        }
    }

    function showDashboard() {
        loginSection.classList.remove('active');
        dashboardSection.classList.add('active');
        loadVehicles();
        loadReviews();
    }

    function showLogin() {
        dashboardSection.classList.remove('active');
        loginSection.classList.add('active');
    }

    // Dashboard Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            // Update buttons
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update sections
            document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Toggle "Add Vehicle" button visibility
            document.getElementById('addVehicleBtn').style.display = (targetId === 'fleet-section') ? 'inline-flex' : 'none';
        });
    });

    async function loadVehicles() {
        vehicleTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading fleet...</td></tr>';
        const token = localStorage.getItem('adminToken');

        if (!token) {
            showLogin();
            return;
        }

        try {
            const res = await fetch('/api/admin/vehicles', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('adminToken');
                    showLogin();
                    return;
                }
                throw new Error('Failed to load vehicles');
            }

            const vehicles = await res.json();

            if (!Array.isArray(vehicles)) {
                throw new Error('Invalid response format');
            }

            vehicleTableBody.innerHTML = '';

            if (vehicles.length === 0) {
                vehicleTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No vehicles found. Add your first vehicle!</td></tr>';
                return;
            }

            vehicles.forEach(veh => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-size: 1.5rem;">${veh.icon}</td>
                    <td style="font-weight: 600;">${veh.name}</td>
                    <td>${veh.seats} Seater</td>
                    <td style="color: var(--color-electric); font-weight: 700;">₹${veh.rate}</td>
                    <td><span class="status-badge ${veh.active ? 'status-active' : 'status-inactive'}">${veh.active ? 'Active' : 'Hidden'}</span></td>
                    <td>
                        <button class="btn btn-primary" onclick="editVehicle(${JSON.stringify(veh).replace(/"/g, '&quot;')})" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
                        <button class="btn btn-danger" onclick="deleteVehicle(${veh.id})" style="padding: 5px 10px; font-size: 0.8rem;">Delete</button>
                    </td>
                `;
                vehicleTableBody.appendChild(tr);
            });
        } catch (err) {
            console.error('Error loading vehicles:', err);
            vehicleTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #ef4444;">Error loading vehicles. Please refresh the page.</td></tr>';
        }
    }

    async function loadReviews() {
        if (!reviewsTableBody) return;
        reviewsTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading stories...</td></tr>';
        const token = localStorage.getItem('adminToken');

        try {
            const res = await fetch('/api/admin/reviews', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to load reviews');
            const reviews = await res.json();

            reviewsTableBody.innerHTML = '';
            if (reviews.length === 0) {
                reviewsTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No stories found.</td></tr>';
                return;
            }

            reviews.forEach(rev => {
                const tr = document.createElement('tr');
                const date = new Date(rev.created_at).toLocaleDateString();
                const image = rev.image_path ? `<img src="${rev.image_path}" style="height: 40px; border-radius: 4px;">` : '-';

                tr.innerHTML = `
                    <td style="font-size: 0.8rem; color: var(--text-dim);">${date}</td>
                    <td style="font-weight: 600;">${rev.author_name}</td>
                    <td><span style="color: #fbbf24;"><i class="ri-star-fill"></i> ${rev.rating}</span></td>
                    <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.85rem;">${rev.text}</td>
                    <td>${image}</td>
                    <td><span class="status-badge ${rev.approved ? 'status-active' : 'status-inactive'}">${rev.approved ? 'Approved' : 'Pending'}</span></td>
                    <td>
                        <button class="btn btn-primary" onclick="editReview(${JSON.stringify(rev).replace(/"/g, '&quot;')})" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
                        <button class="btn btn-danger" onclick="deleteReview(${rev.id})" style="padding: 5px 10px; font-size: 0.8rem;">Delete</button>
                    </td>
                `;
                reviewsTableBody.appendChild(tr);
            });
        } catch (err) {
            console.error('Error loading reviews:', err);
            reviewsTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: #ef4444;">Error loading stories.</td></tr>';
        }
    }

    // Modal Control
    document.getElementById('addVehicleBtn').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add New Vehicle';
        vehicleForm.reset();
        document.getElementById('vehicleId').value = '';
        vehicleModal.classList.add('active');
    });

    document.getElementById('closeVehicleModal').addEventListener('click', () => {
        vehicleModal.classList.remove('active');
    });


    // Password Modal Logic
    const passwordModal = document.getElementById('passwordModal');
    const passwordForm = document.getElementById('passwordForm');

    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        passwordForm.reset();
        passwordModal.classList.add('active');
    });

    document.getElementById('closePasswordModal').addEventListener('click', () => {
        passwordModal.classList.remove('active');
    });

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (data.success) {
                alert('Password updated successfully!');
                passwordModal.classList.remove('active');
            } else {
                alert(data.message || 'Failed to update password');
            }
        } catch (err) {
            console.error('Password update error:', err);
            alert('Server error. Please try again.');
        }
    });

    window.editVehicle = (veh) => {
        document.getElementById('modalTitle').textContent = 'Modify Vehicle';
        document.getElementById('vehicleId').value = veh.id;
        document.getElementById('vehName').value = veh.name;
        document.getElementById('vehSeats').value = veh.seats;
        document.getElementById('vehRate').value = veh.rate;
        document.getElementById('vehIcon').value = veh.icon;
        document.getElementById('vehActive').checked = !!veh.active;
        vehicleModal.classList.add('active');
    };

    window.deleteVehicle = async (id) => {
        if (!confirm('Are you sure you want to remove this vehicle from the fleet?')) return;
        const token = localStorage.getItem('adminToken');
        await fetch(`/api/admin/vehicles/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        loadVehicles();
    };

    window.editReview = (rev) => {
        document.getElementById('reviewId').value = rev.id;
        document.getElementById('revAuthor').value = rev.author_name;
        document.getElementById('revRating').value = rev.rating;
        document.getElementById('revText').value = rev.text;
        document.getElementById('revApproved').checked = !!rev.approved;
        reviewModal.classList.add('active');
    };

    document.getElementById('closeReviewModal').addEventListener('click', () => {
        reviewModal.classList.remove('active');
    });

    window.deleteReview = async (id) => {
        if (!confirm('Permanently delete this guest story?')) return;
        const token = localStorage.getItem('adminToken');
        await fetch(`/api/admin/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadReviews();
    };

    reviewEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        const id = document.getElementById('reviewId').value;
        const payload = {
            author_name: document.getElementById('revAuthor').value,
            rating: parseInt(document.getElementById('revRating').value),
            text: document.getElementById('revText').value,
            approved: document.getElementById('revApproved').checked ? 1 : 0
        };

        await fetch(`/api/admin/reviews/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        reviewModal.classList.remove('active');
        loadReviews();
    });

    vehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        const id = document.getElementById('vehicleId').value;
        const payload = {
            name: document.getElementById('vehName').value,
            seats: parseInt(document.getElementById('vehSeats').value),
            rate: parseInt(document.getElementById('vehRate').value),
            icon: document.getElementById('vehIcon').value,
            active: document.getElementById('vehActive').checked ? 1 : 0
        };

        const url = id ? `/api/admin/vehicles/${id}` : '/api/admin/vehicles';
        const method = id ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        vehicleModal.classList.remove('active');
        loadVehicles();
    });
});
