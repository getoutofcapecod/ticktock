import { store } from '../utils/state.js';

const messages = [
  "Make every moment count.",
  "Your time is limited, don't waste it living someone else's life.",
  "The purpose of life is to live it.",
  "Life is what happens when you're busy making other plans.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Every moment is a fresh beginning.",
  "Life is either a daring adventure or nothing at all.",
  "To live is the rarest thing in the world. Most people exist, that is all.",
  "The journey of a thousand miles begins with one step.",
  "The purpose of our lives is to be happy."
];

export class InspirationalMessage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    store.subscribe(this.update.bind(this));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          text-align: center;
        }
        .message {
          font-size: 1.2rem;
          font-style: italic;
          margin-bottom: 1rem;
          color: var(--text-color, #f5f5f5);
        }
        .author {
          font-size: 1rem;
          color: var(--accent-color, #4d7c8a);
        }
        button {
          background-color: var(--secondary-color, #333);
          color: var(--text-color, #f5f5f5);
          border: 2px solid var(--primary-color, #c24d2c);
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s, color 0.3s, transform 0.1s;
          margin-top: 1rem;
        }
        button:hover {
          background-color: var(--primary-color, #c24d2c);
        }
        button:active {
          transform: scale(0.98);
        }
        @media (max-width: 480px) {
          .message {
            font-size: 1rem;
          }
          .author {
            font-size: 0.9rem;
          }
          button {
            font-size: 0.9rem;
            padding: 0.4rem 0.8rem;
          }
        }
      </style>
      <div class="message" id="message"></div>
      <div class="author" id="author"></div>
      <button id="new-message">New Message</button>
    `;
    this.shadowRoot.getElementById('new-message').addEventListener('click', this.newMessage.bind(this));
    this.newMessage();
  }

  update(state) {
    if (state.lifeExpectancy && state.birthdate) {
      this.newMessage();
    }
  }

  newMessage() {
    const randomIndex = Math.floor(Math.random() * messages.length);
    const messageElement = this.shadowRoot.getElementById('message');
    const authorElement = this.shadowRoot.getElementById('author');
    messageElement.textContent = messages[randomIndex];
    authorElement.textContent = "- Unknown";
  }
}