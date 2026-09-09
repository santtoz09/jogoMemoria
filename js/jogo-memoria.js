const jogoMemoria = document.getElementById('memory-game');
const gradeMemoria = document.getElementById('memory-grid');
const statusMemoria = document.getElementById('memory-status');

let cartas = [];
let primeiraCarta = null;
let pares = 0;
let travado = false;
let jogoLiberado = false;

fetch('./data/cards.json')
  .then((resposta) => resposta.json())
  .then((dados) => {
    cartas = dados;

    if (jogoLiberado) criarCartas();
  });

function iniciarJogoMemoria() {
  jogoLiberado = true;
  jogoMemoria.classList.remove('is-locked');
  jogoMemoria.removeAttribute('aria-disabled');

  if (cartas.length > 0 && gradeMemoria.innerHTML === '') {
    criarCartas();
  }
}

function criarCartas() {
  const cincoCartas = cartas.slice(0, 5);
  const cartasDoJogo = cincoCartas.concat(cincoCartas);

  cartasDoJogo.sort(() => Math.random() - 0.5);
  gradeMemoria.innerHTML = '';
  primeiraCarta = null;
  pares = 0;
  travado = false;

  cartasDoJogo.forEach((carta) => {
    const botao = document.createElement('button');
    botao.className = 'memoria-card';
    botao.dataset.id = carta.id;
    botao.innerHTML = `<img src="${carta.imagem.replace('../', '')}" alt="${carta.nome}">`;
    botao.onclick = () => virarCarta(botao);
    gradeMemoria.appendChild(botao);
  });

  statusMemoria.textContent = 'Encontre os 5 pares de heróis.';
}

function virarCarta(carta) {
  if (travado || carta === primeiraCarta || carta.classList.contains('is-matched')) return;

  carta.classList.add('is-flipped');

  if (!primeiraCarta) {
    primeiraCarta = carta;
    return;
  }

  if (primeiraCarta.dataset.id === carta.dataset.id) {
    primeiraCarta.classList.add('is-matched');
    carta.classList.add('is-matched');
    primeiraCarta.disabled = true;
    carta.disabled = true;
    primeiraCarta = null;
    pares += 1;

    if (pares === 5) {
      statusMemoria.textContent = 'Parabéns! Você encontrou todos os pares.';
    }
    return;
  }

  travado = true;
  const segundaCarta = carta;

  setTimeout(() => {
    primeiraCarta.classList.remove('is-flipped');
    segundaCarta.classList.remove('is-flipped');
    primeiraCarta = null;
    travado = false;
  }, 800);
}

function bloquearJogoMemoria() {
  jogoLiberado = false;
  gradeMemoria.innerHTML = '';
  jogoMemoria.classList.add('is-locked');
  jogoMemoria.setAttribute('aria-disabled', 'true');
  statusMemoria.textContent = 'Jogo da memória bloqueado: acerte uma pergunta para jogar.';
}
