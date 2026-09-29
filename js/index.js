const gradeDeCartas = document.getElementById('memory-grid');

fetch('./data/cards.json')
  .then((resposta) => resposta.json())
  .then((cartas) => {
    gradeDeCartas.innerHTML = cartas.map((carta) => `
      <img src="${carta.imagem.replace('../', '')}" alt="${carta.nome}">
    `).join('');
  });
