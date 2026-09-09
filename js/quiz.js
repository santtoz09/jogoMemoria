const textoPergunta = document.getElementById('quiz-question');
const alternativas = document.getElementById('quiz-choices');
const mensagem = document.getElementById('quiz-feedback');
const placar = document.getElementById('quiz-score');
const botaoProxima = document.getElementById('quiz-next');
const botaoReiniciar = document.getElementById('quiz-restart');

let perguntas = [];
let numeroPergunta = 0;
let acertos = 0;

fetch('./data/perguntas.json')
  .then((resposta) => resposta.json())
  .then((dados) => {
    perguntas = dados;
    mostrarPergunta();
  });

function mostrarPergunta() {
  const pergunta = perguntas[numeroPergunta];

  if (!pergunta) {
    textoPergunta.textContent = 'Quiz finalizado!';
    placar.textContent = `Você acertou ${acertos} perguntas.`;
    botaoReiniciar.hidden = false;
    return;
  }

  alternativas.innerHTML = '';
  mensagem.textContent = '';
  botaoProxima.hidden = true;
  textoPergunta.textContent = pergunta.pergunta;
  placar.textContent = `Pergunta ${numeroPergunta + 1} de ${perguntas.length}`;

  pergunta.alternativas.forEach((alternativa) => {
    const botao = document.createElement('button');
    botao.textContent = alternativa;
    botao.className = 'quiz-choice';
    botao.onclick = () => responder(alternativa);
    alternativas.appendChild(botao);
  });
}

function responder(resposta) {
  const pergunta = perguntas[numeroPergunta];
  const botoes = alternativas.getElementsByTagName('button');

  for (let indice = 0; indice < botoes.length; indice += 1) {
    botoes[indice].disabled = true;
  }

  if (resposta === pergunta.resposta) {
    acertos += 1;
    mensagem.textContent = 'Correto! O jogo da memória foi desbloqueado.';
    mensagem.className = 'quiz-feedback is-correct';
    iniciarJogoMemoria();
  } else {
    mensagem.textContent = `A resposta correta é: ${pergunta.resposta}.`;
    mensagem.className = 'quiz-feedback is-incorrect';
  }

  botaoProxima.hidden = false;
}

botaoProxima.onclick = () => {
  numeroPergunta += 1;
  mostrarPergunta();
};

botaoReiniciar.onclick = () => {
  numeroPergunta = 0;
  acertos = 0;
  bloquearJogoMemoria();
  botaoReiniciar.hidden = true;
  mostrarPergunta();
};
