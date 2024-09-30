import { store } from '../utils/state.js';
import { fetchLifeExpectancy } from '../utils/dataFetcher.js';

export class InputForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        form {
          display: grid;
          gap: 1rem;
        }
        select {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          background-color: var(--secondary-color, #333);
          color: var(--text-color, #f5f5f5);
        }
        button {
          width: 100%;
          background-color: var(--primary-color, #c24d2c);
          color: var(--text-color, #f5f5f5);
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.1s;
        }
        button:hover {
          background-color: #a04028;
        }
        button:active {
          transform: scale(0.98);
        }
        @media (max-width: 480px) {
          select, button {
            font-size: 0.9rem;
            padding: 0.6rem;
          }
        }
      </style>
      <form>
        <select id="gender" name="gender" required>
          <option value="" disabled selected>Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select id="birthYear" name="birthYear" required>
          <option value="" disabled selected>Select birth year</option>
          ${this.generateYearOptions()}
        </select>
        <select id="country" name="country" required>
          <option value="" disabled selected>Select country</option>
          <option value="USA">United States</option>
          <option value="GBR">United Kingdom</option>
          <option value="CAN">Canada</option>
          <option value="AUS">Australia</option>
          <option value="JPN">Japan</option>
        </select>
        <button type="submit">Visualize My Life</button>
      </form>
    `;
  }

  generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    let options = '';
    for (let year = currentYear; year >= startYear; year--) {
      options += `<option value="${year}">${year}</option>`;
    }
    return options;
  }

  attachEventListeners() {
    const form = this.shadowRoot.querySelector('form');
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    } else {
      console.error('Form element not found');
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());
    if (!userData.gender || !userData.birthYear || !userData.country) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const lifeExpectancy = await fetchLifeExpectancy(userData.country, userData.gender);
      store.setState({
        lifeExpectancy,
        birthdate: new Date(userData.birthYear, 0, 1),
      });
      this.style.display = 'none';
      document.getElementById('results').style.display = 'block';
    } catch (error) {
      console.error('Error processing life data:', error);
      alert('Unable to process data. Please try again.');
    }
  }
}