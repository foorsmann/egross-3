// double-qty.js - Doar funcționalitate, fără injectare buton
// Autor: Saga Media / Egross
// Asigură funcționalitatea butonului care adaugă cantitatea minimă (pasul minim) pe orice element cu clasa .double-qty-btn existent în pagină

(function(){
  // Funcție comună pentru validare și highlight roșu la atingerea stocului
  function validateAndHighlightQty(input){
    var step = parseInt(input.getAttribute('data-min-qty'), 10) || parseInt(input.step,10) || 1;
    var min = parseInt(input.min, 10) || step;
    var max = input.max ? parseInt(input.max, 10) : Infinity;
    var val = parseInt(input.value, 10) || min;
    if(val < min) val = min;
    if(val > max) val = max;
    input.value = val;
    if(val >= max){
      input.classList.add('text-red-600');
      input.style.color = '#e3342f';
    }else{
      input.classList.remove('text-red-600');
      input.style.color = '';
    }
    return val;
  }
  window.validateAndHighlightQty = validateAndHighlightQty;
  // Configurări
  var BUTTON_CLASS = 'double-qty-btn';
  var LABEL_PREFIX = 'Adaugă ';
  var LABEL_SUFFIX = ' bucăți';

  // Setează valoarea minimă definită în data-min-qty
  function applyMinQty(){
    document.querySelectorAll('[data-min-qty]').forEach(function(input){
      var min = parseInt(input.getAttribute('data-min-qty'), 10);
      if(min && min > 0){
        input.min = min;
        input.step = min;
        if(parseInt(input.value,10) < min){
          input.value = min;
        }
        validateAndHighlightQty(input);
      }
    });
  }

  // Atașează validarea la toate inputurile relevante
  function attachQtyInputListeners(){
    document.querySelectorAll('input[type="number"][data-min-qty]').forEach(function(input){
      if(input.dataset.qtyListener) return;
      input.dataset.qtyListener = '1';
      ['input','change'].forEach(function(ev){
        input.addEventListener(ev, function(){ validateAndHighlightQty(input); });
      });
    });
  }

  // Asigură highlight corect când se folosesc butoanele +/- existente în temă
  function attachQtyButtonListeners(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-quantity-selector],[data-qty-change]');
      if(!btn) return;
      var container = btn.closest('.quantity-input') || btn.parentNode;
      var input = container.querySelector('input[type="number"]');
      if(input){
        setTimeout(function(){ validateAndHighlightQty(input); }, 0);
      }
    });
  }

  function adjustQuantity(input, delta){
    var step = parseInt(input.getAttribute('data-min-qty'), 10) || 1;
    var min = parseInt(input.min, 10) || step;
    var max = input.max ? parseInt(input.max, 10) : Infinity;
    var val = parseInt(input.value, 10) || min;
    var newVal = val + delta * step;
    if(newVal < min) newVal = min;
    if(newVal > max) newVal = max;
    input.value = newVal;
    // Colorare roșie la maxim
    if(newVal >= max){
      input.classList.add('text-red-600');
      input.style.color = '#e3342f';
    }else{
      input.classList.remove('text-red-600');
      input.style.color = '';
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Helper: Găsește inputul de cantitate din același container cu butonul
  function findQtyInput(btn) {
    let wrapper = btn.previousElementSibling;
    if (wrapper && wrapper.classList && wrapper.classList.contains('quantity-input')) {
      let input = wrapper.querySelector('input[type="number"]');
      if (input) return input;
    }
    if (btn.previousElementSibling && btn.previousElementSibling.tagName === 'INPUT') {
      return btn.previousElementSibling;
    }
    return btn.parentNode.querySelector('input[type="number"]');
  }

  // Aplică funcționalitatea pe toate butoanele existente la pageload + re-render
  function initDoubleQtyButtons() {
    document.querySelectorAll('.' + BUTTON_CLASS).forEach(function(btn){
      // Nu atașa de mai multe ori!
      if (btn.dataset.doubleQtyActive) return;
      btn.dataset.doubleQtyActive = '1';

      var input = findQtyInput(btn);
      if (!input) return;
      var min = parseInt(input.getAttribute('data-min-qty'), 10) || 1;
      var label = LABEL_PREFIX + min + LABEL_SUFFIX;
      btn.setAttribute('aria-label', label);
      btn.textContent = label;

      // Update vizual și stare
      function updateBtnState() {
        var max = input.max ? parseInt(input.max, 10) : 9999;
        var val = parseInt(input.value, 10) || 1;
        btn.disabled = val >= max;
        validateAndHighlightQty(input);
      }
      updateBtnState();
      input.addEventListener('input', updateBtnState);

      // Click: adaugă pasul minim (la fel ca la butonul plus)
      btn.addEventListener('click', function(e){
        e.preventDefault();
        adjustQuantity(input, 1);
        updateBtnState();
      });

      btn.addEventListener('focus', function(){ btn.classList.add('focus'); });
      btn.addEventListener('blur', function(){ btn.classList.remove('focus'); });
    });
  }

  // Rulează la pageload și la re-render (dacă ai AJAX sau Shopify section load)
  // Nu mai atașăm handler-ele proprii pe butoanele +/- deoarece tema deja
  // gestionează aceste evenimente. Astfel evităm dublarea pasului la click.
  function initAll(){
    applyMinQty();
    initDoubleQtyButtons();
    attachQtyInputListeners();
    attachQtyButtonListeners();
  }
  document.addEventListener('DOMContentLoaded', initAll);
  window.addEventListener('shopify:section:load', initAll);
  window.addEventListener('shopify:cart:updated', initAll);
  window.addEventListener('shopify:product:updated', initAll);

  // Expune global pentru debugging manual
  window.doubleQtyInit = initDoubleQtyButtons;
})();






