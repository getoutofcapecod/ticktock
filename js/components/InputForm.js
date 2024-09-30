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
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }
        select, input[type="date"] {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          background-color: var(--secondary-color, #333);
          color: var(--text-color, #f5f5f5);
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          margin: 0;  /* Remove default margin */
          box-sizing: border-box;  /* Include padding in width calculation */
        }
        input[type="date"] {
          /* Force date input to respect width */
          min-width: 0;
          max-width: 100%;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        input[type="date"]::-webkit-inner-spin-button {
          display: none;
        }
        input[type="date"]::-webkit-clear-button {
          display: none;
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23f5f5f5' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
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
          select, input[type="date"], button {
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
        <input type="date" id="birthDate" name="birthDate" required>
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
    if (!userData.gender || !userData.birthDate || !userData.country) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const lifeExpectancy = await fetchLifeExpectancy(userData.country, userData.gender);
      store.setState({
        lifeExpectancy,
        birthdate: new Date(userData.birthDate),
      });
      this.style.display = 'none';
      document.getElementById('results').style.display = 'block';
    } catch (error) {
      console.error('Error processing life data:', error);
      alert('Unable to process data. Please try again.');
    }
  }
}