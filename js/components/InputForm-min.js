import{store as e}from"../utils/state-min.js";import{fetchLifeExpectancy as t}from"../utils/dataFetcher-min.js";import{resetViewport as o}from"../utils/utils-min.js";export class InputForm extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.render(),this.attachEventListeners(),this.handleInputFocus=this.handleInputFocus.bind(this),this.handleInputBlur=this.handleInputBlur.bind(this),requestAnimationFrame(()=>{let e=this.shadowRoot.querySelectorAll("input, select");e.forEach(e=>{e.addEventListener("focus",this.handleInputFocus),e.addEventListener("blur",this.handleInputBlur)})})}disconnectedCallback(){let e=this.shadowRoot.querySelectorAll("input, select");e.forEach(e=>{e.removeEventListener("focus",this.handleInputFocus),e.removeEventListener("blur",this.handleInputBlur)})}handleInputFocus(e){e.preventDefault(),e.target.scrollIntoView({behavior:"smooth",block:"center"})}handleInputBlur(){document.documentElement.style.zoom?document.documentElement.style.zoom=1:document.documentElement.style.transform="scale(1)",window.scrollTo(0,0)}render(){this.shadowRoot.innerHTML=`
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
          background-color: #0c2b36;
          color: #e8e9ea;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          box-sizing: border-box;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2345e6d6' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
        }
        input[type="text"] {
          padding-right: 0.75rem;
        }
        button {
          width: 100%;
          background-color: #45e6d6;
          color: #041a21;
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.1s, box-shadow 0.3s;
        }
        button:hover {
          background-color: #3bcdc0;
          box-shadow: 0 4px 8px rgba(64, 224, 208, 0.3);
          transform: translateY(-2px);
        }
        button:active {
          transform: scale(0.98);
        }
        .error {
          color: #ff4757;
          font-size: 0.9rem;
          margin-top: 0.25rem;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        .error.visible {
          opacity: 1;
        }
        .loading-spinner {
          display: none;
          justify-content: center;
          align-items: center;
          height: 50px;
        }
        .spinner {
          border: 3px solid rgba(64, 224, 208, 0.3);
          border-radius: 50%;
          border-top: 3px solid #45e6d6;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          <div class="error" id="dateError"></div>
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
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
      </form>
    `}attachEventListeners(){let e=this.shadowRoot.querySelector("form"),t=this.shadowRoot.querySelector("#birthDate");e?e.addEventListener("submit",this.handleSubmit.bind(this)):console.error("Form element not found"),t&&t.addEventListener("blur",this.validateDate.bind(this))}validateDate(e){let t=e.target,o=this.shadowRoot.querySelector("#dateError");if(!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(t.value))return o.textContent="Please enter a valid date in MM/DD/YYYY format.",o.classList.add("visible"),!1;let[i,r,n]=t.value.split("/"),a=new Date(n,i-1,r),s=new Date;return a>s?(o.textContent="Birth date cannot be in the future.",o.classList.add("visible"),!1):a.getMonth()!==i-1||a.getDate()!==parseInt(r,10)?(o.textContent="Please enter a valid date.",o.classList.add("visible"),!1):(o.classList.remove("visible"),!0)}async handleSubmit(i){if(i.preventDefault(),!this.validateDate({target:this.shadowRoot.querySelector("#birthDate")}))return;let r=new FormData(i.target),n=Object.fromEntries(r.entries());if(!n.gender||!n.birthDate||!n.country){alert("Please fill in all fields.");return}let a=this.shadowRoot.querySelector(".loading-spinner");a.style.display="flex";try{let s=await t(n.country,n.gender),[l,d,c]=n.birthDate.split("/");e.setState({lifeExpectancy:s,birthdate:new Date(c,l-1,d)}),this.classList.add("fade-transition"),setTimeout(()=>{this.style.display="none",this.classList.remove("fade-transition"),o();let e=document.getElementById("results");e.classList.add("fade-transition"),e.style.display="block",setTimeout(()=>e.classList.add("active"),50)},300)}catch(u){console.error("Error processing life data:",u),alert("Unable to process data. Please try again.")}finally{a.style.display="none"}}}