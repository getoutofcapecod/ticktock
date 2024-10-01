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
        select, input[type="text"] {
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
          box-sizing: border-box;
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23f5f5f5' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
        }
        input[type="text"] {
          padding-right: 0.75rem;
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
        .error {
          color: #ff4444;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
        @media (max-width: 480px) {
          select, input[type="text"], button {
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
        <div>
          <input type="text" id="birthDate" name="birthDate" placeholder="Enter birth date (MM/DD/YYYY)" required>
          <div class="error" id="dateError" style="display:none;"></div>
        </div>
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
      dateInput.addEventListener('blur', this.validateDate.bind(this));
    }
  }

  validateDate(event) {
    const input = event.target;
    const dateError = this.shadowRoot.querySelector('#dateError');
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    
    if (!dateRegex.test(input.value)) {
      dateError.textContent = 'Please enter a valid date in MM/DD/YYYY format.';
      dateError.style.display = 'block';
      return false;
    }

    const [month, day, year] = input.value.split('/');
    const date = new Date(year, month - 1, day);
    const today = new Date();

    if (date > today) {
      dateError.textContent = 'Birth date cannot be in the future.';
      dateError.style.display = 'block';
      return false;
    }

    if (date.getMonth() !== month - 1 || date.getDate() !== parseInt(day, 10)) {
      dateError.textContent = 'Please enter a valid date.';
      dateError.style.display = 'block';
      return false;
    }

    dateError.style.display = 'none';
    return true;
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (!this.validateDate({ target: this.shadowRoot.querySelector('#birthDate') })) {
      return;
    }

    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());
    
    if (!userData.gender || !userData.birthDate || !userData.country) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const lifeExpectancy = await fetchLifeExpectancy(userData.country, userData.gender);
      const [month, day, year] = userData.birthDate.split('/');
      store.setState({
        lifeExpectancy,
        birthdate: new Date(year, month - 1, day),
      });
      this.style.display = 'none';
      document.getElementById('results').style.display = 'block';
    } catch (error) {
      console.error('Error processing life data:', error);
      alert('Unable to process data. Please try again.');
    }
  }
}