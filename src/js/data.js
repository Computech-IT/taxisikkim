export let vehicleData = [];

export async function fetchVehicles() {
    try {
        const res = await fetch('/api/vehicles');
        vehicleData = await res.json();
        return vehicleData;
    } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        return [];
    }
}

export const bookingState = {
    pickup: '',
    drop: '',
    date: '',
    vehicle: null,
    rate: 0
};
