const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = `<!DOCTYPE html><html><body>
  <div class="quantity-input">
    <button data-quantity-selector="decrease" type="button">-</button>
    <input type="number" value="22" data-min-qty="22" min="22" max="73" step="22" class="quantity-input__element">
    <button data-quantity-selector="increase" type="button">+</button>
  </div>
  <button class="double-qty-btn">double</button>
</body></html>`;

const dom = new JSDOM(html, { runScripts: 'dangerously' });
const { window } = dom;

global.window = window;
global.document = window.document;

const script = fs.readFileSync('./assets/double-qty.js', 'utf8');
window.eval(script);

const { validateAndHighlightQty } = window;
document.dispatchEvent(new window.Event('DOMContentLoaded'));

const input = document.querySelector('input');
const plus = document.querySelector('[data-quantity-selector="increase"]');
const doubleBtn = document.querySelector('.double-qty-btn');

function click(el){
  el.dispatchEvent(new window.Event('click', { bubbles: true }));
}

async function nextTick(){
  return new Promise(r => setTimeout(r, 0));
}

(async () => {
  input.value = '66';
  validateAndHighlightQty(input);
  click(plus);
  await nextTick();
  console.log('After plus from 66:', input.value);

  input.value = '70';
  validateAndHighlightQty(input);
  await nextTick();
  console.log('After manual 70:', input.value);

  const before = input.value;
  click(doubleBtn);
  await nextTick();
  console.log(`After double button from ${before}:`, input.value);
})();
