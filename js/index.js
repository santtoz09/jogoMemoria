const gradeDeCartas = document.getElementById('memory-grid');

let primeiraCarta;
let podeVirar = true;

async function mostrarCartas() {
  const resposta = await fetch('./data/cards.json');
  const cartas = await resposta.json();

  // Cria os pares
  const cartasDoJogo = [...cartas, ...cartas];

  // Embaralha as cartas
 cartasDoJogo.sort(() => Math.random() - 0.5)

  // Cria as cartas na tela já embaralhadas
  cartasDoJogo.forEach((carta) => {
    gradeDeCartas.innerHTML += `
      <button class="card" data-id="${carta.id}" onclick="virarCarta(this)">
        <img src="${carta.imagem}">
      </button>
    `;
  });
}

function virarCarta(carta) {
  if (
    !podeVirar ||
    carta === primeiraCarta ||
    carta.classList.contains('virada')
  ) {
    return;
  }

  carta.classList.add('virada');

  if (!primeiraCarta) {
    primeiraCarta = carta;
  } else if (primeiraCarta.dataset.id === carta.dataset.id) {
    primeiraCarta = null;
  } else {
    podeVirar = false;

    setTimeout(() => {
      primeiraCarta.classList.remove('virada');
      carta.classList.remove('virada');

      primeiraCarta = null;
      podeVirar = true;
    }, 800);
  }
}






mostrarCartas();
