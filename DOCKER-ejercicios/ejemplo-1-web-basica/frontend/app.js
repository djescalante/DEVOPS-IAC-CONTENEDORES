const API_URL = 'http://localhost:3000/api';

// Cargar estadísticas
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('totalUsers').textContent = data.data.totalUsers;
            document.getElementById('recentUsers').textContent = data.data.recentUsers;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Cargar usuarios
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();

        const usersList = document.getElementById('usersList');

        if (data.success && data.data.length > 0) {
            usersList.innerHTML = data.data.map(user => `
                <div class="user-card">
                    <div class="user-name">${escapeHtml(user.name)}</div>
                    <div class="user-email">${escapeHtml(user.email)}</div>
                    <div class="user-date">Creado: ${new Date(user.created_at).toLocaleDateString('es-ES')}</div>
                </div>
            `).join('');
        } else {
            usersList.innerHTML = '<div class="loading">No hay usuarios</div>';
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        document.getElementById('usersList').innerHTML =
            '<div class="loading">Error al cargar usuarios</div>';
    }
}

// Agregar usuario
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        });

        const data = await response.json();

        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = '✅ Usuario agregado exitosamente';
            document.getElementById('addUserForm').reset();

            // Recargar datos
            loadUsers();
            loadStats();

            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '❌ Error: ' + error.message;
    }
});

// Función para escapar HTML (prevenir XSS)
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Cargar datos al iniciar
loadStats();
loadUsers();

// Actualizar estadísticas cada 30 segundos
setInterval(loadStats, 30000);
