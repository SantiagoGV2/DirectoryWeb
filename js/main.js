document.addEventListener("DOMContentLoaded", async () => {
    // Función para obtener y mostrar los datos de la base de datos
    const fetchPersonal = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/dato");
        if (response.ok) {
          const personal = await response.json();
    
          const perTableBody = document.getElementById("perTableBody2");
          perTableBody.innerHTML = "";
    
          personal.forEach((per) => {
            const row = document.createElement("tr");
    
            // Verificar si hay un PDF disponible
            let pdfLink = per.datId
            ? `<a href="http://localhost:8080/api/dato/pdf/${per.datId}" class="btn btn-primary btn-sm" download>Descargar PDF</a>`
            : "No disponible";

    
            row.innerHTML = `
                <td>${per.datId}</td>
                <td>${per.datNombre}</td>
                <td>${per.datProfesion}</td>
                <td>${per.datEmail}</td>
                <td>${per.datTelefono}</td>
                <td>${per.datDireccion}</td>
                <td>${pdfLink}</td>
                <td>
                  <button class="btn btn-danger btn-delete" data-id="${per.datId}">Eliminar</button>
                </td>
              `;
    
            perTableBody.appendChild(row);
          });
    
          // Agregar evento a los botones de eliminar
          document.querySelectorAll(".btn-delete").forEach((button) => {
            button.addEventListener("click", (event) => {
              const id = event.target.getAttribute("data-id");
              eliminarPersonal(id);
            });
          });
        } else {
          console.error("Error al obtener los datos:", response.status);
        }
      } catch (error) {
        console.error("Error en la conexión:", error);
      }
    };
    // Llamamos a la función para obtener los datos cuando cargue la página
    fetchPersonal();
  });

const eliminarPersonal = async (id) => {
    const confirmacion = confirm(
        "¿Estás seguro de que deseas eliminar esta persona?"
    );
    if (confirmacion) {
        try {
            const response = await fetch(
                `http://localhost:8080/api/datoE/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                alert("Persona eliminada correctamente");
                // Recargar la tabla después de eliminar
                fetchPersonal();
            } else {
                console.error("Error al eliminar la persona:", await response.text());
                alert("Error al eliminar la persona.");
            }
        } catch (error) {
            console.error("Error en la conexión al eliminar:", error);
            alert("Error al eliminar la persona.");
        }
    }
};