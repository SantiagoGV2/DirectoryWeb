document.addEventListener("DOMContentLoaded", async () => {
    const fetchPersonal = async () => {
        try {
            // Realizamos una petición GET a la API que devuelve todos los administradores
            const response = await fetch("http://localhost:8080/api/archivo");
            if (response.ok) {
                const personal = await response.json();

                const perTableBody = document.getElementById("perTableBody");
                perTableBody.innerHTML = ""; // Limpiamos cualquier dato previo

                personal.forEach((per) => {
                    const row = document.createElement("tr");

                    // Crear las columnas con los datos del administrador
                    row.innerHTML = `
                        <td>${per.arcId}</td>
                        <td>
                            <a href="http://localhost:8080/api/archivo/${per.arcId}" target="_blank" class="btn btn-primary">
                                Descargar PDF
                            </a>
                        </td>
                    `;

                    perTableBody.appendChild(row);
                });

            } else {
                console.error("Error al obtener los archivos:", response.status);
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
        }
    };

    // Llamamos a la función para obtener los datos cuando cargue la página
    fetchPersonal();
});
