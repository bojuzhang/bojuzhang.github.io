// Apply the stored preference before CSS loads to avoid a theme flash.
document.documentElement.classList.add('js');
try {
  const theme = localStorage.getItem('academic-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {
  // Browsers with storage disabled still follow the operating system theme.
}
