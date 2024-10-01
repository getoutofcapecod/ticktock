export function resetViewport() {
  // Force reflow
  document.body.style.display = 'none';
  // Trigger reflow
  void document.body.offsetHeight;
  // Restore display
  document.body.style.display = '';

  // Reset viewport
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', viewport.getAttribute('content'));
  }

  // Ensure we're at the top of the page
  window.scrollTo(0, 0);

  // Reset any zoom
  document.documentElement.style.zoom = 1;
  document.body.style.zoom = 1;
}