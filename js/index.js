document.addEventListener('DOMContentLoaded', () => {
  const qEl = document.querySelector('.quiz-question');
  const choicesEl = document.getElementById('quiz-choices');
  const inputEl = document.getElementById('quiz-answer');
  const submitBtn = document.getElementById('quiz-submit');
  const nextBtn = document.getElementById('quiz-next');
  const restartBtn = document.getElementById('quiz-restart');
  const feedbackEl = document.getElementById('quiz-feedback');

  let questions = [];
  let idx = 0;

  fetch('./data/perguntas.json')
    .then(r => { if (!r.ok) throw new Error('fail'); return r.json(); })
    .then(data => { questions = Array.isArray(data) ? data : []; show(); })
    .catch(() => { qEl.textContent = 'Erro ao carregar perguntas.'; });

  function show() {
    choicesEl.innerHTML = '';
    feedbackEl.textContent = '';
    if (!questions.length) {
      qEl.textContent = 'Nenhuma pergunta.';
      submitBtn.hidden = true;
      return;
    }
    if (idx >= questions.length) {
      qEl.textContent = 'Fim!';
      submitBtn.hidden = true;
      nextBtn.hidden = true;
      restartBtn.hidden = false;
      return;
    }

    const q = questions[idx];
    qEl.textContent = q.question || '';
    nextBtn.hidden = true;
    restartBtn.hidden = true;

    if (q.choices && q.choices.length) {
      inputEl.hidden = true;
      submitBtn.hidden = true;
      q.choices.forEach((c, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = c;
        b.addEventListener('click', () => {
          const correct = q.correct;
          const ok = (typeof correct === 'number') ? i === correct : String(c).toLowerCase() === String(correct).toLowerCase();
          feedbackEl.textContent = ok ? 'Correto!' : 'Errado — resposta: ' + (typeof correct === 'number' ? q.choices[correct] : correct);
          Array.from(choicesEl.querySelectorAll('button')).forEach(x => x.disabled = true);
          nextBtn.hidden = false;
        });
        choicesEl.appendChild(b);
      });
    } else {
      inputEl.hidden = false;
      submitBtn.hidden = false;
      inputEl.value = '';
      inputEl.focus();
    }
  }

  submitBtn.addEventListener('click', () => {
    const q = questions[idx];
    const user = (inputEl.value || '').trim();
    if (!user) return;
    const correct = q.answer || q.correct || '';
    const ok = String(user).toLowerCase() === String(correct).toLowerCase();
    feedbackEl.textContent = ok ? 'Correto!' : 'Errado — resposta: ' + correct;
    submitBtn.hidden = true;
    nextBtn.hidden = false;
  });

  nextBtn.addEventListener('click', () => { idx++; show(); });
  restartBtn.addEventListener('click', () => { idx = 0; show(); });
});
