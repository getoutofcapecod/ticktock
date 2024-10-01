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
          cursor: pointer;
        }
        select, input[type="date"], input[type="text"] {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23f5f5f5' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          cursor: pointer;
        }
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-clear-button {
          display: none;
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
          select, input[type="date"], input[type="text"], button {
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
    const dateInput = this.shadowRoot.querySelector('#birthDate');
    
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    } else {
      console.error('Form element not found');
    }

    if (dateInput) {
      dateInput.addEventListener('change', this.formatDate.bind(this));
      dateInput.addEventListener('focus', (e) => {
        if (!e.target.value) {
          e.target.type = 'date';
        }
      });
      dateInput.addEventListener('blur', (e) => {
        if (!e.target.value) {
          e.target.type = 'text';
        }
      });
      this.setMaxDate(dateInput);
      // Set initial type to text for placeholder
      dateInput.type = 'text';
      dateInput.placeholder = 'Select birth date';
    }
  }

  formatDate(event) {
    const input = event.target;
    const date = new Date(input.value);
    if (!isNaN(date.getTime())) {
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      input.type = 'text';
      input.value = formattedDate;
    }
  }

  setMaxDate(input) {
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    input.setAttribute('max', maxDate);
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