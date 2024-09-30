import { store } from '../utils/state.js';

export class LifeVisualization extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = store.subscribe(this.update.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
    setTimeout(() => this.update(store.getState()), 0);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize.bind(this));
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }
        .week-info {
          text-align: center;
          margin-bottom: 1rem;
          color: #f5f5f5;
        }
        #chart {
          width: 100%;
          height: auto;
        }
        .text, .question {
          text-align: center;
          margin: 10px 0;
        }
        .text {
          font-size: 1.2rem;
          color: #f5f5f5;
        }
        .question {
          font-size: 1.4rem;
          color: #c24d2c;
        }
      </style>
      <div class="week-info"></div>
      <div id="chart"></div>
      <div class="text"></div>
      <div class="question"></div>
    `;

    this.weekInfoElement = this.shadowRoot.querySelector('.week-info');
    this.chartElement = this.shadowRoot.querySelector('#chart');
    this.textElement = this.shadowRoot.querySelector('.text');
    this.questionElement = this.shadowRoot.querySelector('.question');
  }

  handleResize() {
    this.update(store.getState());
  }

  update(state) {
    if (!state.lifeExpectancy || !state.birthdate) return;

    const { lifeExpectancy, birthdate } = state;
    const today = new Date();
    
    // Calculate age more accurately
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }

    // Calculate used and remaining percentages
    const usedPercentage = Math.round((age / lifeExpectancy) * 100);
    const remainingPercentage = 100 - usedPercentage;

    // Calculate weeks more accurately
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksLived = Math.floor((today - birthdate) / millisecondsPerWeek);
    const totalWeeks = Math.floor(lifeExpectancy * 52.1429);
    const weeksRemaining = totalWeeks - weeksLived;

    this.weekInfoElement.textContent = `${weeksLived} weeks lived | ${weeksRemaining} weeks remaining`;

    if (this.chartElement.clientWidth > 0) {
      this.drawPieChart(usedPercentage, remainingPercentage);
    } else {
      requestAnimationFrame(() => this.update(state));
    }

    this.textElement.textContent = `You've used ${usedPercentage}% of your estimated lifespan.`;
    this.questionElement.textContent = `What will you do with the remaining ${remainingPercentage}%?`;
  }

  drawPieChart(usedPercentage, remainingPercentage) {
    const width = this.chartElement.clientWidth;
    const height = width;
    const radius = Math.min(width, height) / 2 * 0.8;

    this.chartElement.innerHTML = '';

    const svg = d3.select(this.chartElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(['used', 'remaining'])
      .range(['#c24d2c', '#f5f5f5']);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const data = [
      { name: 'used', value: usedPercentage },
      { name: 'remaining', value: remainingPercentage }
    ];

    const arcs = svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('fill', d => color(d.data.name))
      .attr('stroke', '#111')
      .attr('stroke-width', 2)
      .transition()
      .duration(1000)
      .attrTween('d', function(d) {
        const i = d3.interpolate(d.startAngle, d.endAngle);
        return function(t) {
          d.endAngle = i(t);
          return arc(d);
        };
      });

    svg.selectAll('.percentage-label')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('class', 'percentage-label')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#111')
      .text(d => `${d.data.value}%`);
  }
}