(() => {
  const version = '20261107.2';
  const help = document.getElementById('ec-help');
  document.getElementById('ec-help-toggle').addEventListener('click', event => {
    help.hidden = !help.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!help.hidden));
  });
  document.getElementById('ec-reload').addEventListener('click', () => {
    if (confirm('Heb je je wijzigingen opgeslagen? Niet-opgeslagen wijzigingen kunnen verloren gaan.')) location.reload();
  });
  const liveLink=document.getElementById('ec-live-page');
  function livePage(){
    const match=location.hash.match(/^#\/collections\/(tracks|tracks_en)\/entries\/([a-z0-9-]+)$/);
    liveLink.hidden=!match;
    if(match) liveLink.href='https://expeditioncreativity.com/'+(match[1]==='tracks'?'nl/composities/':'en/tracks/')+match[2]+'/';
  }
  window.addEventListener('hashchange',livePage);livePage();
  const status = document.getElementById('ec-editor-status');
  // Draft isolation is handled by editorial_workflow; published content is visible
  // only after the explicit Publish action merges that saved draft into main.
  window.CMS.registerEventListener({ name: 'preSave', handler: ({entry}) => entry.get('data').set('status', 'published') });
  window.CMS.registerEventListener({ name: 'postSave', handler: () => {
    status.textContent = 'Concept opgeslagen. De livewebsite is niet gewijzigd. Klik op Publiceren wanneer je klaar bent.';
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
  // The editorial workflow toolbar is retained internally for draft storage,
  // but its review-status control is not part of this CMS workflow. Remove it
  // whenever Decap mounts or re-renders the toolbar.
  function hideReviewStatus() {
    document.querySelectorAll('button,[role="button"],a,div,span').forEach(control => {
      const label = (control.textContent || '').replace(/\s+/g, ' ').trim();
      if (!/^(Status\s*:|Status\b|Concept\b|Wordt beoordeeld\b|Klaar\b)/i.test(label)) return;
      const item = control.closest('button,[role="button"],[class*="ToolbarSection"]') || control.parentElement;
      if (item && !item.querySelector('input,textarea,[contenteditable="true"]')) item.style.display = 'none';
    });
  }
  const toolbarObserver = new MutationObserver(hideReviewStatus);
  toolbarObserver.observe(document.getElementById('nc-root') || document.body, {childList:true, subtree:true, characterData:true});
  hideReviewStatus();
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
