for (const archive of document.querySelectorAll('.publication-archive')) {
  const controls = archive.querySelector('.paper-filters');
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const selected = event.target.closest('[data-filter]');
    if (!selected) return;
    const choice = selected.dataset.filter;
    for (const control of controls.querySelectorAll('button')) {
      control.setAttribute('aria-pressed', String(control === selected));
    }
    let visible = 0;
    for (const group of archive.querySelectorAll('.year-group')) {
      for (const paper of group.querySelectorAll('.paper-record')) {
        const match = choice === 'all' || choice === paper.dataset.year ||
          (choice === 'selected' && paper.dataset.selected === 'true');
        paper.hidden = !match;
        if (match) visible++;
      }
      group.hidden = !group.querySelector('.paper-record:not([hidden])');
    }
    archive.querySelector('.filter-empty').hidden = visible !== 0;
  });
}

if (navigator.clipboard?.writeText) {
  const chinese = document.documentElement.lang.startsWith('zh');
  for (const citation of document.querySelectorAll('.paper-citation')) {
    const button = citation.querySelector('button');
    const feedback = citation.querySelector('.copy-feedback');
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(citation.querySelector('code').textContent);
        feedback.textContent = chinese ? '已复制' : 'Copied';
      } catch {
        feedback.textContent = chinese ? '请手动复制上方引文。' : 'Please copy the citation above.';
      }
    });
    citation.addEventListener('toggle', () => { feedback.textContent = ''; });
  }
}
