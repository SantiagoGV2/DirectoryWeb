// Mueve la declaración de fetchPersonal fuera de DOMContentLoaded para que sea accesible globalmente
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

// Llamar a la función para obtener los datos cuando cargue la página
document.addEventListener("DOMContentLoaded", async () => {
  fetchPersonal();
});

// Función para eliminar datos
const eliminarPersonal = async (id) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/datoE/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          Swal.fire(
            'Eliminado',
            'Persona eliminada correctamente.',
            'success'
          );
          setTimeout(() => fetchPersonal(), 500);
        } else {
          const errorText = await response.text();
          console.error("Error al eliminar la persona:", errorText);
          Swal.fire(
            'Error',
            'Error al eliminar la persona.',
            'error'
          );
        }
      } catch (error) {
        console.error("Error en la conexión al eliminar:", error);
        Swal.fire(
          'Error',
          'Error al eliminar la persona.',
          'error'
        );
      }
    }
  });
};
