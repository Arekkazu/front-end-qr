// Cambia esta URL por la IP pública del backend cuando esté desplegado
const API_BASE = window.API_BASE || "http://localhost:5000";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw { status: res.status, message: data.error || "Error desconocido" };
  return data;
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}

function requireAuth(role) {
  const user = getUser();
  const token = localStorage.getItem("token");
  console.log("[requireAuth] user=", user, "token=", token, "required role=", role);
  if (!user || !token) {
    console.log("[requireAuth] no user/token → logout");
    window.location.href = "/index.html";
    return false;
  }
  if (role && user.role !== role) {
    console.log("[requireAuth] role mismatch:", user.role, "!=", role);
    window.location.href = user.role === "Admin" ? "/admin/dashboard.html" : "/user/dashboard.html";
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/index.html";
}
