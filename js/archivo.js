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
            document.getElementById("nombreCarpeta").textContent = `📂 ${data.carNombre}`;
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
                `;
                tbody.appendChild(fila);
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
