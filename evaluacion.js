let datos = [];

fetch("base_emprendimiento.json")
  .then(res => res.json())
  .then(json => {
    datos = json;
    llenarDepartamentos();
  });

function llenarDepartamentos() {
  const departamentos = [...new Set(datos.map(row => row.Departamento).filter(Boolean))];
  const datalist = document.getElementById('lista-departamentos');
  datalist.innerHTML = '';
  departamentos.forEach(dep => {
    const option = document.createElement('option');
    option.value = dep;
    datalist.appendChild(option);
  });

  const departamentoInput = document.getElementById('departamento');
  departamentoInput.addEventListener('input', function () {
    const ciudades = datos
      .filter(row => row.Departamento === departamentoInput.value)
      .map(row => row.Ciudad)
      .filter((v, i, a) => a.indexOf(v) === i && v);

    const ciudadDatalist = document.getElementById('lista-ciudades');
    ciudadDatalist.innerHTML = '';
    ciudades.forEach(ci => {
      const option = document.createElement('option');
      option.value = ci;
      ciudadDatalist.appendChild(option);
    });
  });
}

function analizarImpacto() {
  const ciudad = document.getElementById('ciudad').value;
  const tipo = document.getElementById('tipo').value.trim().toLowerCase();
  const resultado = document.getElementById('resultado');

  if (!ciudad || !tipo || datos.length === 0) {
    alert("Debe seleccionar ciudad, tipo de emprendimiento y esperar a que los datos se carguen.");
    return;
  }

  const coincidencias = datos.filter(row =>
    row.Ciudad === ciudad &&
    row['Tipo de negocio']?.toLowerCase().includes(tipo)
  );

  if (coincidencias.length === 0) {
    resultado.innerHTML = `
      <h3>Resultado del Análisis</h3>
      <p>No se encontraron registros similares en <strong>${ciudad}</strong>.</p>
      <p>Impacto potencial: <strong>ALTO</strong> (sin competencia directa)</p>
    `;
    return;
  }

  const registro = coincidencias[0]; // tomamos el primer match exacto
  const negociosExistentes = registro['Negocios existentes'] || 0;
  const inclusion = registro['Inclusión financiera (%)'] || 0;
  const pib = registro['PIB (millones)'] || 0;
  const startups = registro['Startups por 100k hab.'] || 0;
  const supervivencia = registro['Tasa supervivencia 5 años (%)'] || 0;
  const crecimiento = registro['Crecimiento ingresos (%)'] || 0;

  // Lógica de impacto potencial (simplificada y ajustable)
  let impacto = "MODERADO";
  if (negociosExistentes < 3000) impacto = "ALTO";
  else if (negociosExistentes > 8000) impacto = "BAJO";

  resultado.innerHTML = `
    <h3>Resultado del Análisis</h3>
    <p><strong>Negocios similares existentes:</strong> ${negociosExistentes.toLocaleString()}</p>
    <p><strong>Inclusión financiera:</strong> ${inclusion}%</p>
    <p><strong>PIB regional:</strong> $${pib.toLocaleString()} millones</p>
    <p><strong>Startups por 100k habitantes:</strong> ${startups}</p>
    <p><strong>Tasa de supervivencia a 5 años:</strong> ${supervivencia}%</p>
    <p><strong>Crecimiento promedio de ingresos:</strong> ${crecimiento}%</p>
    <p><strong>Impacto Potencial:</strong> <strong>${impacto}</strong></p>
  `;
}
