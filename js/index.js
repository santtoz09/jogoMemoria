const gradeDeCartas = document.getElementById('memory-grid');

async function mostrarCartas() {
  const resposta = await fetch('./data/cards.json');
  const cartas = await resposta.json();

  cartas.forEach((carta) => {
    gradeDeCartas.innerHTML += `<img src="${carta.imagem}" alt="${carta.nome}">`;
  });
}

mostrarCartas();
