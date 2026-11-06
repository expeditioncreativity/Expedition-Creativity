(() => {
  const version = '20261105.2';
  const help = document.getElementById('ec-help');
  document.getElementById('ec-help-toggle').addEventListener('click', event => {
    help.hidden = !help.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!help.hidden));
  });
  document.getElementById('ec-reload').addEventListener('click', () => {
    if (confirm('Heb je je wijzigingen als concept opgeslagen? Niet-opgeslagen wijzigingen kunnen verloren gaan.')) location.reload();
  });
  const status = document.getElementById('ec-editor-status');
  window.CMS.registerEventListener({ name: 'postSave', handler: () => {
    status.textContent = 'Opgeslagen als concept. Gebruik Publiceren wanneer je wijziging live mag.';
  }});
  window.CMS.registerEventListener({ name: 'postPublish', handler: () => {
    status.textContent = 'Publicatie aangevraagd. De website wordt bijgewerkt na een geslaagde build; dit kan enkele minuten duren. Herlaad daarna de livepagina.';
  }});
  async function checkVersion() {
    try {
      const response = await fetch('/admin/version.json', { cache: 'no-store' });
      if (!response.ok) return;
      const latest = await response.json();
      if (latest.version !== version) document.getElementById('ec-update-notice').hidden = false;
    } catch { /* An offline check must never interrupt editing. */ }
  }
  window.addEventListener('focus', checkVersion);
  setInterval(checkVersion, 60000);
  checkVersion();
  // Count visible editor text only; never rewrite or serialize Decap's content.
  let frame;
  function counts() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      document.querySelectorAll('[contenteditable="true"]').forEach(editor => {
        const field = editor.closest('[class*="ControlContainer"]');
        if (!field) return;
        let counter = field.querySelector('.ec-word-count');
        if (!counter) { counter = document.createElement('div'); counter.className = 'ec-word-count'; field.append(counter); }
        const text = editor.textContent.trim();
        const words = text ? text.split(/\s+/u).length : 0;
        const label = `${words} woorden · ${text.length} tekens`;
        if (counter.textContent !== label) counter.textContent = label;
      });
    });
  }
  const observer = new MutationObserver(counts);
  observer.observe(document.getElementById('nc-root') || document.body, { childList: true, subtree: true, characterData: true });
  counts();
})();
