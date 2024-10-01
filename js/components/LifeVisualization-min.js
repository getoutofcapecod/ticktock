import{store as t}from"../utils/state-min.js";export class LifeVisualization extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.textAlternateInterval=null}connectedCallback(){this.render(),this.unsubscribe=t.subscribe(this.update.bind(this)),window.addEventListener("resize",this.handleResize.bind(this)),setTimeout(()=>this.update(t.getState()),0)}disconnectedCallback(){window.removeEventListener("resize",this.handleResize.bind(this)),this.unsubscribe&&this.unsubscribe(),this.textAlternateInterval&&clearInterval(this.textAlternateInterval)}render(){this.shadowRoot.innerHTML=`
      <style>
        :host {
          display: block;
          width: 100%;
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
        .highlight-expired {
          color: #ff3947;
          font-weight: bold;
        }
        .highlight-remaining {
          color: #40E0D0;
          font-weight: bold;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .pulse {
          animation: pulse 2s infinite;
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
    `,this.weeksInfoElement=this.shadowRoot.querySelector(".weeks-info"),this.chartElement=this.shadowRoot.querySelector("#chart"),this.journeyInfoElement=this.shadowRoot.querySelector(".journey-info")}handleResize(){this.update(t.getState())}update(t){if(!t.lifeExpectancy||!t.birthdate)return;let{lifeExpectancy:e,birthdate:i}=t,a=new Date,n=a.getFullYear()-i.getFullYear(),r=a.getMonth()-i.getMonth();(r<0||0===r&&a.getDate()<i.getDate())&&n--;let s=Math.round(n/e*100),l=100-s,o=Math.floor((a-i)/6048e5);this.weeksInfoElement.innerHTML=`You've lived <span class="highlight-expired">${o} weeks</span>. You have approx. <span class="highlight-remaining">${Math.floor(52.1429*e)-o} weeks</span> left.`,this.chartElement.clientWidth>0?this.drawPieChart(s,l):requestAnimationFrame(()=>this.update(t)),this.journeyInfoElement.innerHTML=`Make your last <span class="highlight-remaining">${l}%</span> count.`}drawPieChart(t,e){let i=this.chartElement.clientWidth,a=i,n=Math.min(i,a)/2*.8;this.chartElement.innerHTML="";let r=d3.select(this.chartElement).append("svg").attr("width",i).attr("height",a).attr("viewBox",`0 0 ${i} ${a}`).append("g").attr("transform",`translate(${i/2}, ${a/2})`),s=d3.scaleOrdinal().domain(["used","remaining"]).range(["#ff3947","#40E0D0"]),l=d3.pie().value(t=>t.value).sort(null),o=d3.arc().innerRadius(.65*n).outerRadius(n).cornerRadius(4),d=r.append("defs").append("linearGradient").attr("id","gradient").attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","100%");d.append("stop").attr("offset","0%").attr("stop-color","#45e6d6"),d.append("stop").attr("offset","100%").attr("stop-color","#40E0D0");let h=r.selectAll("path").data(l([{name:"used",value:t},{name:"remaining",value:e}])).enter().append("path").attr("fill",t=>"remaining"===t.data.name?"url(#gradient)":s(t.data.name)).attr("stroke","#041a21").attr("stroke-width",2).attr("d",o),c=r.append("g").attr("text-anchor","middle").attr("dominant-baseline","middle"),$=c.append("text").attr("fill","#e8e9ea").style("font-size",`${i/8}px`).style("font-weight","bold").text(`${t}%`),p=c.append("text").attr("fill","#e8e9ea").style("font-size",`${i/16}px`).attr("dy",`${i/10}px`).text("of life lived"),f=c.node().getBBox(),m=f.height;c.attr("transform",`translate(0, ${-m/8})`),this.startTextAlternation(h,$,p,t,e)}startTextAlternation(t,e,i,a,n){let r=!0,s=()=>{r?(e.text(`${a}%`),i.text("of life lived"),t.classed("pulse",(t,e)=>0===e)):(e.text(`${n}%`),i.text("of life left"),t.classed("pulse",(t,e)=>1===e)),r=!r};s(),this.textAlternateInterval&&clearInterval(this.textAlternateInterval),this.textAlternateInterval=setInterval(()=>{e.style("opacity",0),i.style("opacity",0),setTimeout(()=>{s(),e.style("opacity",1),i.style("opacity",1)},300)},6e3)}}