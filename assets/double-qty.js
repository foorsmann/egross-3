// double-qty.js - Doar funcționalitate, fără injectare buton
// Autor: Saga Media / Egross
// Asigură funcționalitatea butonului care adaugă cantitatea minimă (pasul minim) pe orice element cu clasa .double-qty-btn existent în pagină

(function(){
  // Funcție comună pentru validare și highlight roșu la atingerea stocului
  function snapDown(val, step, min){
    if(val < min) return min;
    return Math.floor((val - min) / step) * step + min;
  }

  function clampAndSnap(val, step, min, max, wasAtMax){
    var original = val;
    val = Math.min(val, max);
    if(val < min) val = min;
    if(val !== max){
      if(wasAtMax && original === max - step && (max % step !== 0)){
        val = snapDown(max, step, min);
      }else{
        val = snapDown(val, step, min);
      }
    }
    return val;
  }

  function validateAndHighlightQty(input){
    var step = parseInt(input.getAttribute('data-min-qty'), 10) || parseInt(input.step,10) || 1;
    var min = parseInt(input.min, 10) || step;
    var max = input.max ? parseInt(input.max, 10) : Infinity;
    var val = parseInt(input.value, 10);
    var wasAtMax = input.dataset.atMax === '1';
    val = isNaN(val) ? min : val;
    val = clampAndSnap(val, step, min, max, wasAtMax);
    input.value = val;
    if(val >= max){
      input.classList.add('text-red-600');
      input.style.color = '#e3342f';
      input.dataset.atMax = '1';
    }else{
      input.classList.remove('text-red-600');
      input.style.color = '';
      input.dataset.atMax = '';
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
    var selectors = '.quantity-input__element, .scd-item__qty_input, input[data-quantity-input]';
    document.querySelectorAll(selectors).forEach(function(input){
      if(input.dataset.qtyListener) return;
      input.dataset.qtyListener = '1';
      ['input','change','blur'].forEach(function(ev){
        input.addEventListener(ev, function(){ validateAndHighlightQty(input); });
      });
      input.addEventListener('keypress', function(e){
        if(e.key === 'Enter'){ validateAndHighlightQty(input); }
      });
      validateAndHighlightQty(input);
    });
  }

  // Asigură highlight corect când se folosesc butoanele +/- existente în temă
  var qtyBtnListenerAdded = false;
  function attachQtyButtonListeners(){
    if(qtyBtnListenerAdded) return;
    qtyBtnListenerAdded = true;
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-quantity-selector],[data-qty-change]');
      if(!btn) return;
      if(btn.closest('.scd-item') || btn.closest('[data-cart-item]')) return;
      var input = findQtyInput(btn);
      if(!input) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      var delta = (btn.dataset.quantitySelector === 'increase' || btn.dataset.qtyChange === 'inc') ? 1 : -1;
      adjustQuantity(input, delta);
    }, true);
  }

  function adjustQuantity(input, delta){
    var step = parseInt(input.getAttribute('data-min-qty'), 10) || 1;
    var min = parseInt(input.min, 10) || step;
    var max = input.max ? parseInt(input.max, 10) : Infinity;
    var val = parseInt(input.value, 10) || min;

    if(delta < 0){
      if(val > max){
        val = snapDown(max, step, min);
      }else if(val % step !== 0){
        val = snapDown(val, step, min);
      }else{
        val -= step;
      }
      if(val < min) val = min;
    }else{
      if(val % step !== 0){
        val = snapDown(val, step, min);
      }
      val += step;
      if(val > max) val = max;
    }

    var wasAtMax = input.dataset.atMax === '1';
    var newVal = clampAndSnap(val, step, min, max, wasAtMax);
    input.value = newVal;
    // Colorare roșie la maxim
    if(newVal >= max){
      input.classList.add('text-red-600');
      input.style.color = '#e3342f';
      input.dataset.atMax = '1';
    }else{
      input.classList.remove('text-red-600');
      input.style.color = '';
      input.dataset.atMax = '';
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






