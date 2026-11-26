// Tema do site: guarda a escolha do menu "Tema" e, na página da semana do tema Padrão,
// leva o visitante ao tema que ele escolheu da última vez. Sem JS, o menu funciona como links comuns.
(function () {
  var CHAVE = 'sr-tema';
  var menu = document.querySelector('.temas');
  if (!menu) return;
  var atual = menu.getAttribute('data-atual') || 'padrao';

  [].forEach.call(menu.querySelectorAll('a[data-tema]'), function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem(CHAVE, a.getAttribute('data-tema')); } catch (e) {}
    });
  });

  // Só a página da semana do Padrão redireciona (os temas só têm a página da semana).
  if (atual !== 'padrao' || !document.body.hasAttribute('data-semana')) return;
  var salvo = null;
  try { salvo = localStorage.getItem(CHAVE); } catch (e) {}
  if (!salvo || salvo === 'padrao' || !/^[a-z]+$/.test(salvo)) return;
  var alvo = menu.querySelector('a[data-tema="' + salvo + '"]');
  if (alvo) location.replace(alvo.getAttribute('href'));
})();
