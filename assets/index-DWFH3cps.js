var x=Object.defineProperty;var k=(p,t,s)=>t in p?x(p,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):p[t]=s;var r=(p,t,s)=>k(p,typeof t!="symbol"?t+"":t,s);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))e(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&e(c)}).observe(document,{childList:!0,subtree:!0});function s(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function e(i){if(i.ep)return;i.ep=!0;const n=s(i);fetch(i.href,n)}})();class b{constructor(t,s,e){r(this,"x");r(this,"y");r(this,"z");r(this,"edges");this.x=t,this.y=s,this.z=e,this.edges=new Set}}class S{constructor(t,s){r(this,"interface");r(this,"canvas");r(this,"ctx");r(this,"centerX");r(this,"centerY");r(this,"mouseIsDown");r(this,"isInterfaceOpen");r(this,"isLoading");r(this,"frame");r(this,"options");r(this,"sphereRadius");r(this,"nodes");r(this,"n");r(this,"iterations");r(this,"start",t=>{this.nodes=[],this.generateRandomNodes(),t?this.gravitate(1e3,1e4):this.frame=window.requestAnimationFrame(()=>this.init(1e3,1e5,this.iterations))});r(this,"init",(t,s,e)=>{if(this.adjustForGravity(t,s),this.calcEdges(),this.render(this.iterations,e),e<0){window.cancelAnimationFrame(this.frame);return}e--,this.frame=window.requestAnimationFrame(()=>this.init(t,s,e--))});r(this,"gravitate",(t,s)=>{for(let e=0;e<this.iterations;e++)this.adjustForGravity(t,s);this.calcEdges(),this.render()});r(this,"calcEdges",()=>{const t=new Map,s=new Set;let e=1/0;for(let n=0;n<this.n;n++)for(let c=0;c<this.n;c++){if(n===c)continue;const a=[n,c].sort((l,u)=>l-u).join("-");if(s.has(a))continue;const o=this.nodes[n],d=this.nodes[c],h=+this.distanceFormula(o.x,o.y,o.z,d.x,d.y,d.z).toFixed(5);e=Math.min(e,h),h<e*Math.sqrt(1.9)&&t.set(a,h),s.add(a)}const i=e*Math.sqrt(1.9);for(const n of t.keys()){const[c,a]=n.split("-");t.get(n)<i?(this.nodes[+c].edges.add(n),this.nodes[+a].edges.add(n)):(this.nodes[+c].edges.delete(n),this.nodes[+a].edges.delete(n))}});r(this,"generateRandomNodes",()=>{this.nodes=[];for(let t=0;t<this.n;t++)this.nodes.push(this.generateRandomNode())});r(this,"generateRandomNode",()=>{const t=Math.random()-.5,s=Math.random()-.5,e=Math.random()-.5,{x:i,y:n,z:c}=this.projectNodeToSphere(t,s,e);return new b(i,n,c)});r(this,"adjustForGravity",(t,s)=>{for(let e=0;e<this.n;e++){let i=0,n=0,c=0;const a=this.nodes[e];for(let l=0;l<this.n;l++){if(e===l)continue;const u=this.nodes[l],f=a.x-u.x,v=a.y-u.y,m=a.z-u.z,y=Math.sqrt(f**2+v**2+m**2);if(y<s){const g=t*1/y;i+=g*f,n+=g*v,c+=g*m}}const{x:o,y:d,z:h}=this.projectNodeToSphere(a.x+i,a.y+n,a.z+c);a.x=o,a.y=d,a.z=h}});r(this,"render",(t=-1,s=-1)=>{this.clearCanvas(),t>-1&&s>-1&&(this.ctx.font=`Bold ${4*5}px Arial`,this.ctx.fillStyle="#bbbbbb",this.ctx.fillText(t-s+" / "+t,this.centerX*2-(t+""+(t-s)).length*5*2-30,this.centerY*2-10));const e=new Set,i=[],n=[],c=[],a=[];for(let o=0;o<this.nodes.length;o++){const d=this.nodes[o];d.z>0?c.push(d):a.push(d);for(const h of d.edges){if(e.has(h))continue;const[l,u]=h.split("-"),{x:f,y:v,z:m}=this.nodes[+l],{x:y,y:g,z:w}=this.nodes[+u];(m+w)/2>=0?i.push([f,v,m,y,g,w]):n.push([f,v,m,y,g,w]),e.add(h)}}for(const o of a)this.drawNode(o);for(const o of n)this.drawEdge(o[0],o[1],o[2],o[3],o[4],o[5]);for(const o of i)this.drawEdge(o[0],o[1],o[2],o[3],o[4],o[5],!0);for(const o of c)this.drawNode(o,!0)});r(this,"distanceFormula",(t,s,e,i,n,c)=>Math.sqrt((i-t)**2+(n-s)**2+(c-e)**2));r(this,"projectNodeToSphere",(t,s,e)=>{const i=this.distanceFormula(t,s,e,0,0,0);return{x:t/i,y:s/i,z:e/i}});r(this,"d",(t,s,e=!1)=>{const i=this.sphereRadius;return t*(1+s*i/4e3)*i+(e?this.centerX:this.centerY)});r(this,"drawNode",(t,s=!1)=>{this.ctx.beginPath(),this.ctx.arc(this.d(t.x,t.z,!0),this.d(t.y,t.z),this.options.pointSize,0,2*Math.PI),this.ctx.fillStyle=s?this.options.pointColor:this.options.backPointColor,this.ctx.fill()});r(this,"drawEdge",(t,s,e,i,n,c,a=!1)=>{const o=this.d(t,e,!0),d=this.d(s,e),h=this.d(i,c,!0),l=this.d(n,c);this.ctx.beginPath(),this.ctx.moveTo(o,d),this.ctx.lineTo(h,l),this.ctx.lineWidth=this.options.edgeWidth,this.ctx.strokeStyle=a?this.options.edgeColor:this.options.edgeBackColor,this.ctx.stroke()});r(this,"clearCanvas",()=>{this.ctx.fillStyle=this.options.clear,this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)});r(this,"calculateRotatedCoordinates",(t,s,e,i,n,c,a)=>{const o=Math.sin(a*i),d=Math.cos(a*i),h=-Math.sin(a*n),l=Math.cos(a*n),u=Math.sin(a*c),f=Math.cos(a*c),v=t*f*d+s*f*o*h-s*u*l+e*f*o*l+e*u*h,m=t*u*d+s*u*o*h+s*f*l+e*u*o*l-e*f*h,y=-t*o+s*d*h+e*d*l;return{x:v,y:m,z:y}});r(this,"generateEventListeners",()=>{document.addEventListener("mouseup",()=>{this.mouseIsDown=!1}),this.canvas.addEventListener("mousedown",()=>{this.mouseIsDown=!0}),this.canvas.addEventListener("mousemove",t=>{this.mouseIsDown&&this.rotate(t.movementX,t.movementY)}),this.interface.addEventListener("click",t=>{t.stopPropagation()}),this.interface.getElementsByClassName("point-pack-toggle-user-interface")[0].addEventListener("click",()=>{this.isInterfaceOpen=!this.isInterfaceOpen,this.interface.querySelectorAll(".pkui-display")[0].style.display=this.isInterfaceOpen?"block":"none"}),this.interface.querySelectorAll(".pkui-submit")[0].addEventListener("click",t=>{t.preventDefault(),window.cancelAnimationFrame(this.frame);const s=this.interface.querySelectorAll(".pkui-vertices")[0].value,e=this.interface.querySelectorAll(".pkui-iterations")[0].value;Number.isNaN(+s)||Number.isNaN(+e)||(this.interface.querySelectorAll(".pkui-submit")[0].disabled=!0,this.n=+s,this.iterations=+e,setTimeout(()=>{this.start(!this.interface.querySelectorAll(".pkui-render-steps")[0].checked),this.interface.querySelectorAll(".pkui-submit")[0].disabled=!1},10))})});r(this,"rotate",(t,s)=>{this.nodes.forEach(e=>{const{x:i,y:n,z:c}=this.calculateRotatedCoordinates(e.x,e.y,e.z,t,s,0,.002);e.x=i,e.y=n,e.z=c}),this.render()});if(s.length<5)throw new Error("id must be at least five characters");this.n=111,this.iterations=1e4,t.innerHTML=t.innerHTML+`
      <div class="point-pack-container" id="${s}">
        <canvas class="point-pack-canvas" id="${s}-canvas"></canvas>
        <div class="point-pack-user-interface-container" id="${s}-interface">
          <button class="point-pack-toggle-user-interface">Show/Hide</button>
          <form class="pkui-display">
            <div>
              <p>Vertices:</p>
              <input class="pkui-input pkui-vertices" type="text" placeholder="Vertex count..." value="${this.n}"></input>
            </div>
            <div>
              <p>Steps:</p>
              <input class="pkui-input pkui-iterations" type="text" placeholder="Step count..." value="${this.iterations}"></input>
            </div>
            <div>
              <input class="pkui-render-steps" checked type="checkbox"></input>
              <p>Render Steps (slow)</p>
            </div>
            <div>
              <input class="pkui-submit" type="submit" value="Start"></input>
            </div>
          </form>
        </div>
      </div>
    `,this.canvas=document.querySelector("#"+s+"-canvas"),this.interface=document.querySelector("#"+s+"-interface");const e=t.clientWidth,i=t.clientHeight;this.centerX=e/2,this.centerY=i/2,this.sphereRadius=.95*(Math.min(e,i,1e3)/2),this.canvas.width=e,this.canvas.height=i,this.frame=0,window.addEventListener("resize",()=>{const n=t.clientWidth,c=t.clientHeight;this.centerX=n/2,this.centerY=c/2,this.canvas.width=n,this.canvas.height=c,this.sphereRadius=.95*(Math.min(n,c,1e3)/2),this.render()}),this.ctx=this.canvas.getContext("2d"),this.mouseIsDown=!1,this.isInterfaceOpen=!0,this.isLoading=!1,this.options={clear:"black",pointColor:"#d90000",backPointColor:"#590000",edgeColor:"#dddddd",edgeBackColor:"#555555",edgeWidth:4,pointSize:8},this.nodes=[],this.generateEventListeners(),this.start(!1)}}new S(document.querySelector("#app"),"point-pack-1");