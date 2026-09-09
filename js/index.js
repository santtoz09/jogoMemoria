// Primeiro pegamos os elementos do HTML que vamos mudar.
const tela = {
  pergunta: document.getElementById('quiz-question'),
  alternativas: document.getElementById('quiz-choices'),
  mensagem: document.getElementById('quiz-feedback'),
  placar: document.getElementById('quiz-score'),
  proxima: document.getElementById('quiz-next'),
  reiniciar: document.getElementById('quiz-restart'),
  jogo: document.getElementById('memory-game'),
  cartas: document.getElementById('memory-grid'),
  status: document.getElementById('memory-status'),
};

let perguntas = [];
let herois = [];
let numeroDaPergunta = 0;
let acertos = 0;
let primeiraCarta = null;
let paresEncontrados = 0;
let podeVirarCarta = true;
let jogoIniciado = false;

// O "await" espera os dois arquivos JSON serem carregados antes de começar.
async function iniciar() {
  [perguntas, herois] = await Promise.all([
    buscarDados('./data/perguntas.json'),
    buscarDados('./data/cards.json'),
  ]);

  mostrarPergunta();
}

async function buscarDados(caminho) {
  const resposta = await fetch(caminho);
  return resposta.json();
}

function mostrarPergunta() {
  const perguntaAtual = perguntas[numeroDaPergunta];

  // Se não existir outra pergunta, o quiz acabou.
  if (!perguntaAtual) {
    tela.pergunta.textContent = 'Quiz finalizado!';
    tela.placar.textContent = `Você acertou ${acertos} perguntas.`;
    tela.reiniciar.hidden = false;
    return;
  }

  tela.alternativas.innerHTML = '';
  tela.mensagem.textContent = '';
  tela.proxima.hidden = true;
  tela.pergunta.textContent = perguntaAtual.pergunta;
  tela.placar.textContent = `Pergunta ${numeroDaPergunta + 1} de ${perguntas.length}`;

  perguntaAtual.alternativas.forEach((alternativa) => {
    const botao = document.createElement('button');
    botao.className = 'quiz-choice';
    botao.textContent = alternativa;
    botao.onclick = () => responder(alternativa);
    tela.alternativas.appendChild(botao);
  });
}

function responder(alternativa) {
  const perguntaAtual = perguntas[numeroDaPergunta];

  // Depois da escolha, os botões ficam desativados.
  for (const botao of tela.alternativas.children) {
    botao.disabled = true;
  }

  if (alternativa === perguntaAtual.resposta) {
    acertos += 1;
    tela.mensagem.textContent = 'Correto! O jogo da memória foi desbloqueado.';
    tela.mensagem.className = 'quiz-feedback is-correct';
    desbloquearJogo();
  } else {
    tela.mensagem.textContent = `A resposta correta é: ${perguntaAtual.resposta}.`;
    tela.mensagem.className = 'quiz-feedback is-incorrect';
  }

  tela.proxima.hidden = false;
}

function desbloquearJogo() {
  tela.jogo.classList.remove('is-locked');
  tela.jogo.removeAttribute('aria-disabled');

  if (!jogoIniciado) {
    criarJogoDaMemoria();
  }
}

function criarJogoDaMemoria() {
  // Escolhemos 5 heróis, duplicamos as cartas e as misturamos.
  const cincoHerois = herois.slice(0, 5);
  const baralho = [...cincoHerois, ...cincoHerois];
  baralho.sort(() => Math.random() - 0.5);

  tela.cartas.innerHTML = '';
  primeiraCarta = null;
  paresEncontrados = 0;
  podeVirarCarta = true;
  jogoIniciado = true;

  baralho.forEach((heroi) => {
    const carta = document.createElement('button');
    const imagem = document.createElement('img');

    carta.className = 'memoria-card';
    carta.dataset.id = heroi.id;
    carta.onclick = () => virarCarta(carta);
    imagem.src = heroi.imagem.replace('../', '');
    imagem.alt = heroi.nome;

    carta.appendChild(imagem);
    tela.cartas.appendChild(carta);
  });

  tela.status.textContent = 'Encontre os 5 pares de heróis.';
}

function virarCarta(carta) {
  // Não vira carta enquanto duas cartas erradas estão aparecendo.
  if (!podeVirarCarta || carta === primeiraCarta || carta.classList.contains('is-matched')) return;

  carta.classList.add('is-flipped');

  // A primeira carta apenas fica guardada para comparar com a próxima.
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
    paresEncontrados += 1;

    if (paresEncontrados === 5) {
      tela.status.textContent = 'Parabéns! Você encontrou todos os pares.';
    }
    return;
  }

  // Se forem diferentes, esperamos um pouco e escondemos as duas.
  podeVirarCarta = false;
  const segundaCarta = carta;

  setTimeout(() => {
    primeiraCarta.classList.remove('is-flipped');
    segundaCarta.classList.remove('is-flipped');
    primeiraCarta = null;
    podeVirarCarta = true;
  }, 800);
}

tela.proxima.onclick = () => {
  numeroDaPergunta += 1;
  mostrarPergunta();
};

tela.reiniciar.onclick = () => {
  numeroDaPergunta = 0;
  acertos = 0;
  jogoIniciado = false;
  tela.cartas.innerHTML = '';
  tela.jogo.classList.add('is-locked');
  tela.jogo.setAttribute('aria-disabled', 'true');
  tela.status.textContent = 'Jogo da memória bloqueado: acerte uma pergunta para jogar.';
  tela.reiniciar.hidden = true;
  mostrarPergunta();
};

iniciar();
