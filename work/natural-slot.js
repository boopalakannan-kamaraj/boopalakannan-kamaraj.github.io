/* Once an image-slot gets filled, snap its aspect-ratio to the image's
   natural ratio so nothing is cropped. Empty slots keep their CSS ratio
   so the placeholder still looks intentional. */
(function () {
  function applyNatural(slot) {
    if (!slot.shadowRoot) return;
    const img = slot.shadowRoot.querySelector('img');
    if (!img) return;
    const apply = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) return;
      slot.style.aspectRatio = w + ' / ' + h;
      slot.style.height = 'auto';
    };
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener('load', apply, { once: true });
  }
  function clearNatural(slot) {
    slot.style.aspectRatio = '';
    slot.style.height = '';
  }
  function check(slot) {
    if (slot.hasAttribute('data-filled')) applyNatural(slot);
    else clearNatural(slot);
  }
  function wire(slot) {
    if (slot._naturalWired) return;
    slot._naturalWired = true;
    // Wait a tick for shadow root + img to exist
    requestAnimationFrame(() => check(slot));
    new MutationObserver(() => check(slot)).observe(slot, { attributes: true, attributeFilter: ['data-filled'] });
  }
  function init() {
    document.querySelectorAll('image-slot').forEach(wire);
    // Watch for slots added later
    new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) {
        if (n.nodeType === 1 && n.tagName === 'IMAGE-SLOT') wire(n);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
