const gradeDeCartas = document.getElementById('memory-grid');

async function mostrarCartas() {
  const resposta = await fetch('./data/cards.json');
  const cartas = await resposta.json();

  cartas.forEach((carta) => {
    gradeDeCartas.innerHTML += `
      <div class="card">
        <img src="${carta.imagem}" alt="${carta.nome}">
        <p>${carta.nome}</p>
      </div>
    `;
  });
}

mostrarCartas();
