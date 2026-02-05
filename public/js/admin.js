document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    const vehicleTableBody = document.getElementById('vehicleTableBody');
    const vehicleModal = document.getElementById('vehicleModal');
    const vehicleForm = document.getElementById('vehicleForm');

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
    }

    function showLogin() {
        dashboardSection.classList.remove('active');
        loginSection.classList.add('active');
    }

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
