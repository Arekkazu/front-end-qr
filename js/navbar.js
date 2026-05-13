function renderNavbar(activePage) {
  const user = getUser();
  if (!user) return;

  const isAdmin = user.role === "Admin";
  const adminLinks = isAdmin ? `
    <li class="nav-item">
      <a class="nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}" href="/admin/dashboard.html">
        <i class="fas fa-tachometer-alt me-1"></i>Panel Admin
      </a>
    </li>
    <li class="nav-item">
      <a class="nav-link ${activePage === 'scanner' ? 'active' : ''}" href="/admin/scanner.html">
        <i class="fas fa-camera me-1"></i>Registrar Asistencia
      </a>
    </li>` : "";

  const userLink = `
    <li class="nav-item">
      <a class="nav-link ${activePage === 'user-dashboard' ? 'active' : ''}" href="/user/dashboard.html">
        <i class="fas fa-user me-1"></i>Mi Asistencia
      </a>
    </li>`;

  document.getElementById("navbar-placeholder").innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow">
      <div class="container">
        <a class="navbar-brand" href="#"><i class="fas fa-qrcode me-2"></i>Sistema de Asistencias</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            ${adminLinks}
            ${userLink}
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                <i class="fas fa-user-circle me-1"></i>${user.username}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="/user/profile.html"><i class="fas fa-id-card me-2"></i>Mi Perfil</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>`;
}
