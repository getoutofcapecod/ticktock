import { InputForm } from './js/components/InputForm.js';
import { LifeVisualization } from './js/components/LifeVisualization.js';
import { store } from './js/utils/state.js';

// Define custom elements only if they haven't been defined yet
if (!customElements.get('input-form')) {
  customElements.define('input-form', InputForm);
}
if (!customElements.get('life-visualization')) {
  customElements.define('life-visualization', LifeVisualization);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Application initialized');
  
  // Log initial state
  console.log('Initial state:', store.getState());
  // Subscribe to state changes
  store.subscribe((state) => {
    console.log('State updated:', state);
  });
});