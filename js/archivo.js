document.addEventListener("DOMContentLoaded", function () {
    cargarCarpetas();
});

function cargarCarpetas() {
    fetch("http://localhost:8080/api/carpeta")
        .then(response => {
            if (!response.ok) throw new Error("Error al obtener carpetas");
            return response.json();
        })
        .then(data => {
            let contenedor = document.getElementById("carpetas");
            contenedor.innerHTML = "";

            data.forEach(carpeta => {
                let div = document.createElement("div");
                div.className = "col-md-3 col-sm-6 mb-3";
                div.innerHTML = `
                    <div class="card text-dark shadow-sm rounded-3"
                         style="background-color: ${carpeta.carColor}; cursor: pointer;"
                         onclick="mostrarCarpeta(${carpeta.carId})">
                        <div class="card-body text-center">
                            <h5 class="card-title fw-bold"><i class="bi bi-folder"></i> ${carpeta.carNombre}</h5>
                        </div>
                    </div>
                `;
                contenedor.appendChild(div);
            });
        })
        .catch(error => console.error("Error al cargar carpetas:", error));
}

function previsualizarPdf(id) {
    const url = `http://localhost:8080/api/dato/preview/${encodeURIComponent(id)}`;
    window.open(url, '_blank');
}


function mostrarCarpeta(cod) {
  fetch(`http://localhost:8080/api/carpeta/${cod}`)
      .then(response => {
          if (!response.ok) throw new Error("Error al obtener detalles de la carpeta");
          return response.json();
      })
      .then(data => {
          const nombreCarpeta = document.getElementById("nombreCarpeta");
          nombreCarpeta.textContent = `📂 ${data.carNombre}`;
          nombreCarpeta.setAttribute("data-carId", cod);

          let tbody = document.getElementById("tablaDatos");
          tbody.innerHTML = "";

          // Guardar los datos en la variable global
          datosCarpetaActual = data.datos ?? [];

          datosCarpetaActual.forEach(dato => {
              let fila = document.createElement("tr");
              let pdfPreview = dato.datId
                    ? `<button class="btn btn-info btn-sm" onclick="previsualizarPdf(${dato.datId})">
                          <i class="bi bi-eye"></i>
                       </button>`
                    : "No disponible";
              let pdfLink = dato.datId
                  ? `<a href="http://localhost:8080/api/carpeta/pdf/${cod}/${dato.datId}" class="btn btn-primary btn-sm" download>Descargar PDF</a>`
                  : "No disponible";            
              fila.innerHTML = `
                  <td>${dato.datId}</td>
                  <td>${dato.datNombre}</td>
                  <td>${dato.datDireccion}</td>
                  <td>${dato.datEmail}</td>
                  <td>${dato.datTelefono}</td>
                  <td>${dato.datProfesion}</td>
                  <td>${pdfPreview} ${pdfLink}</td>
                  <td>
                      <button class="btn btn-warning btn-edit" data-id="${dato.datId}">Editar</button>
                  </td>
                  <td>
                      <button class="btn btn-danger btn-delete" data-id="${dato.datId}">Eliminar</button>
                  </td>
              `;
              tbody.appendChild(fila);
          });

          document.querySelectorAll('.btn-edit').forEach(button => {
              button.addEventListener('click', (event) => {
                  const id = event.target.getAttribute('data-id');
                  editarDato(id);
              });
          });

          document.querySelectorAll('.btn-delete').forEach(button => {
              button.addEventListener('click', (event) => {
                  const id = event.target.getAttribute('data-id');
                  eliminarDato(id);
              });
          });

          document.getElementById("carpetas").style.display = "none";
          document.getElementById("detallesCarpeta").style.display = "block";
      })
      .catch(error => console.error("Error al obtener detalles de la carpeta:", error));
}


// 🔙 Función para volver a la lista de carpetas
function volverALista() {
    document.getElementById("detallesCarpeta").style.display = "none";
    document.getElementById("carpetas").style.display = "flex";
}



const eliminarDato = async (id) => {
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
        const response = await fetch(`http://localhost:8080/api/datoE/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          Swal.fire(
            'Eliminado',
            'Dato eliminado correctamente.',
            'success'
          );
          // Obtener el ID de la carpeta actual antes de recargar los datos
          const cod = document.getElementById("nombreCarpeta").getAttribute("data-carId");
          mostrarCarpeta(cod); 
        } else {
          console.error('Error al eliminar el dato:', await response.text());
          Swal.fire(
            'Error',
            'Error al eliminar el dato.',
            'error'
          );
        }
      } catch (error) {
        console.error('Error en la conexión al eliminar:', error);
        Swal.fire(
          'Error',
          'Error al eliminar el dato.',
          'error'
        );
      }
    }
  });
};


let carpetaActual = null;
const editarDato = async (id) => {
  try {
      const response = await fetch(`http://localhost:8080/api/dato/${id}`);
      if (response.ok) {
          const dat = await response.json();

          document.getElementById('editNomb').value = dat.datNombre;
          document.getElementById('editDirec').value = dat.datDireccion;
          document.getElementById('editEmail').value = dat.datEmail;
          document.getElementById('editTel').value = dat.datTelefono;
          document.getElementById('editPro').value = dat.datProfesion;
          document.getElementById('editDatId').value = id; // Guardar ID oculto

          // Mostrar el modal de edición
          let editModal = new bootstrap.Modal(document.getElementById('editDatModal'));
          editModal.show();
      } else {
          console.error('Error al obtener los datos:', await response.text());
      }
  } catch (error) {
      console.error('Error en la conexión:', error);
  }
};

  
document.getElementById('editDatForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData();
  const id = document.getElementById('editDatId').value;
  formData.append("datId", id);
  formData.append("datNombre", document.getElementById('editNomb').value);
  formData.append("datDireccion", document.getElementById('editDirec').value);
  formData.append("datEmail", document.getElementById('editEmail').value);
  formData.append("datTelefono", document.getElementById('editTel').value);
  formData.append("datProfesion", document.getElementById('editPro').value);

  const pdfFile = document.getElementById('editPdf').files[0];
  if (pdfFile) {
      formData.append("pdfFile", pdfFile);
  }

  try {
      const response = await fetch(`http://localhost:8080/api/datoA`, {
          method: 'POST',
          body: formData
      });

      if (response.ok) {
          Swal.fire(
            'Actualizado',
            'Dato actualizado correctamente.',
            'success'
          );
          let editModal = bootstrap.Modal.getInstance(document.getElementById('editDatModal'));
          editModal.hide();

          // Obtener ID de la carpeta actual
          const cod = document.getElementById("nombreCarpeta").getAttribute("data-carId");
          mostrarCarpeta(cod);
      } else {
          console.error('Error al actualizar el dato:', await response.text());
          Swal.fire(
            'Error',
            'Error al actualizar el dato.',
            'error'
          );
      }
  } catch (error) {
      console.error('Error en la conexión al actualizar:', error);
      Swal.fire(
        'Error',
        'Error al actualizar el dato.',
        'error'
      );
  }
});


// Variable global para guardar los datos de la carpeta actual
let datosCarpetaActual = [];
// Nueva función para renderizar la tabla filtrada
function renderizarTablaFiltrada(datos) {
    let tablaDatos = document.getElementById("tablaDatos");
    tablaDatos.innerHTML = "";
    if (datos.length === 0) {
        tablaDatos.innerHTML = `<tr><td colspan="9" class="text-center">No se encontraron resultados</td></tr>`;
        return;
    }
    const cod = document.getElementById("nombreCarpeta").getAttribute("data-carId");
    datos.forEach(dato => {
        let fila = document.createElement("tr");
        let pdfLink = dato.datId
            ? `<a href="http://localhost:8080/api/carpeta/pdf/${cod}/${dato.datId}" class="btn btn-primary btn-sm" download>Descargar PDF</a>`
            : "No disponible";
        fila.innerHTML = `
            <td>${dato.datId}</td>
            <td>${dato.datNombre}</td>
            <td>${dato.datDireccion}</td>
            <td>${dato.datEmail}</td>
            <td>${dato.datTelefono}</td>
            <td>${dato.datProfesion}</td>
            <td>${pdfLink}</td>
            <td>
                <button class="btn btn-warning btn-edit" data-id="${dato.datId}">Editar</button>
            </td>
            <td>
                <button class="btn btn-danger btn-delete" data-id="${dato.datId}">Eliminar</button>
            </td>
        `;
        tablaDatos.appendChild(fila);
    });
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id');
            editarDato(id);
        });
    });
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id');
            eliminarDato(id);
        });
    });
}

// Modifica la función buscarDatos para filtrar en el frontend
function buscarDatos() {
    let nombre = document.getElementById("buscador").value.trim().toLowerCase();
    let mensajeError = document.getElementById("mensajeError");
    mensajeError.style.display = "none";
    if (nombre === "") {
        renderizarTablaFiltrada(datosCarpetaActual);
        return;
    }
    const filtrados = datosCarpetaActual.filter(dato =>
        dato.datNombre && dato.datNombre.toLowerCase().includes(nombre)
    );
    renderizarTablaFiltrada(filtrados);
    if (filtrados.length === 0) {
        mensajeError.innerHTML = "No se encontraron resultados.";
        mensajeError.style.display = "block";
    }
}
