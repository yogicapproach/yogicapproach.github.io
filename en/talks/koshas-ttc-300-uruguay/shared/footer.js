/* ============================================================================
   Shared footer: YogicApproach credit (head 🧠 · heart ❤️ · hands 🙏) + a
   Feedback button that opens a "coming soon" modal. Bilingual via .en-only /
   .es-only spans toggled by <html lang> (set by the page renderer), so no JS
   coordination with the locale state is needed. Loaded on every page.
   ============================================================================ */
(function () {
  var credit =
    '<div class="ya-credit">' +
      '<span class="en-only">Made with <span class="ya-hands">🧠❤️🙏</span> by ' +
        '<a href="https://yogicapproach.com" target="_blank" rel="noopener">YogicApproach</a></span>' +
      '<span class="es-only">Hecho con <span class="ya-hands">🧠❤️🙏</span> por ' +
        '<a href="https://yogicapproach.com" target="_blank" rel="noopener">YogicApproach</a></span>' +
      ' · ' +
      '<button type="button" class="ya-feedback" id="yaFeedback">' +
        '<span class="en-only">Feedback</span><span class="es-only">Comentarios</span></button>' +
    '</div>';

  var footers = document.querySelectorAll('footer.footer');
  footers.forEach(function (f) { f.insertAdjacentHTML('beforeend', credit); });

  var modal = document.createElement('div');
  modal.className = 'ya-modal-overlay';
  modal.id = 'yaModal';
  modal.innerHTML =
    '<div class="ya-modal" role="dialog" aria-modal="true" aria-labelledby="yaModalTitle">' +
      '<button class="ya-modal-close" id="yaModalClose" aria-label="Close">×</button>' +
      '<div class="en-only">' +
        '<h3 id="yaModalTitle">Feedback — coming soon</h3>' +
        '<p>The feedback form is still being put together. For now, please send your thoughts on ' +
        'the class directly to your class organizer — all feedback is warmly welcomed, ' +
        'positive or critical. It closes the loop across the distance. 🙏</p>' +
      '</div>' +
      '<div class="es-only">' +
        '<h3>Comentarios — próximamente</h3>' +
        '<p>El formulario de comentarios todavía se está preparando. Por ahora, por favor enviá tus ' +
        'impresiones sobre la clase directamente a quien organiza el grupo — todos los comentarios ' +
        'son muy bienvenidos, positivos o críticos. Eso cierra el círculo a la distancia. 🙏</p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  function open() { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { modal.classList.remove('open'); document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    if (e.target.closest('#yaFeedback')) open();
    else if (e.target === modal || e.target.closest('#yaModalClose')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
