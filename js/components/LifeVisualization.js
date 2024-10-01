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
          font-family: 'Arial', sans-serif;
          color: #f5f5f5;
          background-color: #111;
          padding: 5% 5% 0;
          box-sizing: border-box;
        }
        .content {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .weeks-info {
          font-size: 1.2rem;
          text-align: center;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        .chart-container {
          width: 100%;
          max-width: 300px;
          margin-bottom: 1rem;
          aspect-ratio: 1 / 1;
        }
        #chart {
          width: 100%;
          height: 100%;
        }
        .journey-info {
          font-size: 1.2rem;
          text-align: center;
        }
        .highlight {
          color: #c24d2c;
          font-weight: bold;
        }
        @media (min-width: 400px) {
          .weeks-info, .journey-info {
            font-size: 1.4rem;
          }
          .chart-container {
            max-width: 350px;
          }
        }
        @media (min-width: 768px) {
          .weeks-info, .journey-info {
            font-size: 1.6rem;
          }
          .chart-container {
            max-width: 400px;
          }
        }
      </style>
      <div class="content">
        <div class="weeks-info"></div>
        <div class="chart-container">
          <div id="chart"></div>
        </div>
        <div class="journey-info"></div>
      </div>
    `;

    this.weeksInfoElement = this.shadowRoot.querySelector('.weeks-info');
    this.chartElement = this.shadowRoot.querySelector('#chart');
    this.journeyInfoElement = this.shadowRoot.querySelector('.journey-info');
  }

  handleResize() {
    this.update(store.getState());
  }

  update(state) {
    if (!state.lifeExpectancy || !state.birthdate) return;

    const { lifeExpectancy, birthdate } = state;
    const today = new Date();
    
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }

    const usedPercentage = Math.round((age / lifeExpectancy) * 100);
    const remainingPercentage = 100 - usedPercentage;

    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksLived = Math.floor((today - birthdate) / millisecondsPerWeek);
    const totalWeeks = Math.floor(lifeExpectancy * 52.1429);
    const weeksRemaining = totalWeeks - weeksLived;

    this.weeksInfoElement.innerHTML = `You've lived <span class="highlight">${weeksLived} weeks</span>. You have approximately <span class="highlight">${weeksRemaining} weeks</span> remaining.`;

    if (this.chartElement.clientWidth > 0) {
      this.drawPieChart(usedPercentage, remainingPercentage);
    } else {
      requestAnimationFrame(() => this.update(state));
    }

    this.journeyInfoElement.innerHTML = `You've experienced <span class="highlight">${usedPercentage}%</span> of your estimated life journey.`;
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
      .range(['#c24d2c', '#4a4a4a']);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.6)
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

    // Create a group for the text elements
    const textGroup = svg.append('g')
      .attr('text-anchor', 'middle');

    // Add the percentage text
    const percentageText = textGroup.append('text')
      .attr('fill', '#f5f5f5')
      .style('font-size', `${width / 8}px`)
      .style('font-weight', 'bold')
      .text(`${usedPercentage}%`)
      .attr('dy', '-0.2em');

    // Add the 'of life lived' text
    const subText = textGroup.append('text')
      .attr('fill', '#f5f5f5')
      .style('font-size', `${width / 16}px`)
      .text('of life lived')
      .attr('dy', '1.5em');

    // Ensure the text group is centered
    const textBox = textGroup.node().getBBox();
    const textHeight = textBox.height;
    textGroup.attr('transform', `translate(0, ${-textHeight / 8})`);

    // Fine-tune positioning
    percentageText.attr('y', radius * -0.05);
    subText.attr('y', radius * 0.15);
  }
}