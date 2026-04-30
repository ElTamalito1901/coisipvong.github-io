        const VALID_EMAIL = "coisipv.equipo@gmail.com";
        const VALID_PASSWORD = "coisipvadmin";

        function loadPage(pageName) {
            const contentArea = document.getElementById('content-area');

            contentArea.innerHTML = `
            <div class="loading">Cargando ${pageName.replace('.html', '')}...</div>
        `;

            document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));

            const buttonId = 'btn-' + pageName.replace('.html', '');
            const activeButton = document.getElementById(buttonId);
            if (activeButton) activeButton.classList.add('active');

            setTimeout(() => {
                contentArea.innerHTML = `
                <iframe 
                    src="contenido/${pageName}" 
                    style="
                        width: 100%;
                        height: 100%;
                        border: none;
                        border-radius: 0;
                        background: transparent;
                        display: block;
                    "
                    onload="this.style.opacity=1">
                </iframe>
            `;
            }, 300);
        }

        function openLoginModal() {
            document.getElementById('loginModal').classList.add('active');
            document.getElementById('emailInput').focus();
            document.getElementById('errorMessage').classList.remove('show');
        }

        function closeLoginModal() {
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('loginForm').reset();
            document.getElementById('errorMessage').classList.remove('show');
        }

        function handleLogin(event) {
            event.preventDefault();

            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;

            if (email === VALID_EMAIL && password === VALID_PASSWORD) {
                closeLoginModal();

                // Cargar panel de administración
                const contentArea = document.getElementById('content-area');
                contentArea.innerHTML = `
                <div class="loading">Accediendo al panel de administración...</div>
            `;

                // Remover active de todos los botones del menú
                document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));

                setTimeout(() => {
                    contentArea.innerHTML = `
                    <iframe 
                        src="contenido/paneladmin.html" 
                        style="
                            width: 100%;
                            height: 100%;
                            borsder: none;
                            border-radius: 0;
                            background: transparent;
                            display: block;
                        "
                        onload="this.style.opacity=1">
                    </iframe>
                `;
                }, 500);
            } else {
                document.getElementById('errorMessage').classList.add('show');
                document.getElementById('passwordInput').value = '';
                document.getElementById('passwordInput').focus();
            }
        }

        // Cerrar modal al hacer click fuera
        document.getElementById('loginModal').addEventListener('click', function (e) {
            if (e.target === this) {
                closeLoginModal();
            }
        });

        // Cerrar modal con tecla ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeLoginModal();
            }
        });

        window.addEventListener('DOMContentLoaded', () => {
                loadPage('inicio.html');
            });