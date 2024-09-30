import { store } from '../utils/state.js';

export class Statistics extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    store.subscribe(this.update.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        .stat-card {
          background-color: var(--secondary-color, #333);
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        h3 {
          font-size: 1rem;
          color: var(--text-color, #f5f5f5);
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--primary-color, #c24d2c);
        }
        .chart-container {
          position: relative;
          width: 100%;
          padding-bottom: 100%; /* 1:1 aspect ratio */
        }
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .chart-labels {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          font-size: 1.2rem;
          color: var(--text-color, #f5f5f5);
        }
        .chart-labels span {
          display: block;
        }
        .chart-labels .percentage {
          font-size: 2rem;
          font-weight: bold;
        }
        @media (max-width: 480px) {
          .stat-value {
            font-size: 1.5rem;
          }
          .chart-labels {
            font-size: 1rem;
          }
          .chart-labels .percentage {
            font-size: 1.5rem;
          }
        }
      </style>
      <div class="stat-card">
        <h3>Life Expectancy</h3>
        <div class="stat-value" id="life-expectancy">-</div>
      </div>
      <div class="stat-card">
        <h3>Years Lived</h3>
        <div class="chart-container">
          <canvas class="stat-chart" id="years-lived-chart"></canvas>
          <div class="chart-labels">
            <span class="percentage" id="years-lived-percentage">0%</span>
            <span>of life lived</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <h3>Years Remaining</h3>
        <div class="chart-container">
          <canvas class="stat-chart" id="years-remaining-chart"></canvas>
          <div class="chart-labels">
            <span class="percentage" id="years-remaining-percentage">0%</span>
            <span>of life remaining</span>
          </div>
        </div>
      </div>
    `;
  }

  handleResize() {
    this.update(store.getState());
  }

  update(state) {
    if (!state.lifeExpectancy || !state.birthdate) return;
    
    const { lifeExpectancy, birthdate } = state;
    const today = new Date();
    const yearsLived = today.getFullYear() - birthdate.getFullYear();
    const totalYears = lifeExpectancy;
    
    this.shadowRoot.getElementById('life-expectancy').textContent = `${lifeExpectancy.toFixed(1)} years`;

    const yearsLivedPercentage = (yearsLived / totalYears) * 100;
    const yearsRemainingPercentage = 100 - yearsLivedPercentage;

    this.shadowRoot.getElementById('years-lived-percentage').textContent = `${yearsLivedPercentage.toFixed(1)}%`;
    this.shadowRoot.getElementById('years-remaining-percentage').textContent = `${yearsRemainingPercentage.toFixed(1)}%`;

    this.drawYearsLivedChart(yearsLived, totalYears);
    this.drawYearsRemainingChart(yearsLived, totalYears);
  }

  drawYearsLivedChart(yearsLived, totalYears) {
    const canvas = this.shadowRoot.getElementById('years-lived-chart');
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    ctx.clearRect(0, 0, size, size);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    const percentLived = yearsLived / totalYears;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + percentLived * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = size * 0.1;
    ctx.strokeStyle = 'var(--accent-color, #4d7c8a)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, endAngle, startAngle + 2 * Math.PI);
    ctx.lineWidth = size * 0.1;
    ctx.strokeStyle = 'var(--secondary-color, #333)';
    ctx.stroke();
  }

  drawYearsRemainingChart(yearsLived, totalYears) {
    const canvas = this.shadowRoot.getElementById('years-remaining-chart');
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    ctx.clearRect(0, 0, size, size);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    const percentRemaining = (totalYears - yearsLived) / totalYears;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + percentRemaining * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = size * 0.1;
    ctx.strokeStyle = 'var(--primary-color, #c24d2c)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, endAngle, startAngle + 2 * Math.PI);
    ctx.lineWidth = size * 0.1;
    ctx.strokeStyle = 'var(--secondary-color, #333)';
    ctx.stroke();
  }
}