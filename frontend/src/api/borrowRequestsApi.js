// src/api/borrowRequestsApi.js
// NOTE: small API wrapper to fetch the current user's borrow requests and cancel a request.
// It uses your existing axios instance defined in src/utils/api (imported here as api).
import api from '../utils/api';

/**
 * Fetch all borrow requests for the currently authenticated user.
 * GET /borrow-requests/my
 */
export async function fetchMyRequests() {
    const res = await api.get('/borrow-requests/my');
    // returned body is { success, message, data } in your ApiResponse wrapper
    return res.data?.data || [];
}

/**
 * Cancel a pending request owned by the user.
 * DELETE /borrow-requests/{id}
 */
export async function cancelRequest(requestId) {
    const res = await api.delete(`/borrow-requests/${requestId}`);
    return res.data;
}

export async function completeRequest(requestId) {
    const res = await api.put(`/borrow-requests/${requestId}/complete`);
    return res.data;
}
