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

function mostrarCarpeta(cod) {
  fetch(`http://localhost:8080/api/carpeta/${cod}`)
      .then(response => {
          if (!response.ok) throw new Error("Error al obtener detalles de la carpeta");
          return response.json();
      })
      .then(data => {
          const nombreCarpeta = document.getElementById("nombreCarpeta");
          nombreCarpeta.textContent = `📂 ${data.carNombre}`;
          
          // Guardar el ID de la carpeta en data-carId
          nombreCarpeta.setAttribute("data-carId", cod);

          let tbody = document.getElementById("tablaDatos");
          tbody.innerHTML = "";

          (data.datos ?? []).forEach(dato => {
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
              tbody.appendChild(fila);
          });

          document.querySelectorAll('.btn-edit').forEach(button => {
              button.addEventListener('click', (event) => {
                  const id = event.target.getAttribute('data-id');
                  editarDato(id);
              });
          });

          // Agregar evento a los botones de eliminar
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
  const confirmacion = confirm('¿Estás seguro de que deseas eliminar este dato?');
  if (confirmacion) {
    try {
      const response = await fetch(`http://localhost:8080/api/datoE/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Dato eliminado correctamente');
        // Obtener el ID de la carpeta actual antes de recargar los datos
        const cod = document.getElementById("nombreCarpeta").getAttribute("data-carId");
        mostrarCarpeta(cod); 
      } else {
        console.error('Error al eliminar el dato:', await response.text());
        alert('Error al eliminar el dato.');
      }
    } catch (error) {
      console.error('Error en la conexión al eliminar:', error);
      alert('Error al eliminar el dato.');
    }
  }
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
          alert('Dato actualizado correctamente');
          let editModal = bootstrap.Modal.getInstance(document.getElementById('editDatModal'));
          editModal.hide();

          // Obtener ID de la carpeta actual
          const cod = document.getElementById("nombreCarpeta").getAttribute("data-carId");
          mostrarCarpeta(cod);
      } else {
          console.error('Error al actualizar el dato:', await response.text());
          alert('Error al actualizar el dato.');
      }
  } catch (error) {
      console.error('Error en la conexión al actualizar:', error);
      alert('Error al actualizar el dato.');
  }
});
