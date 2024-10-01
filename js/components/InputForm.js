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
        }
        input[type="date"] {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f5f5f5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.5rem;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
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
    const dateInput = this.shadowRoot.querySelector('#birthDate');
    
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    } else {
      console.error('Form element not found');
    }

    if (dateInput) {
      dateInput.addEventListener('change', this.formatDate.bind(this));
      this.setMaxDate(dateInput);
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