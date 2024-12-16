class Point {
  x: number;
  y: number;
  z: number;
  edges: Set<string>;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.edges = new Set<string>();
  }
}

class PointPack {
  interface: HTMLDivElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  centerX: number;
  centerY: number;

  mouseIsDown: boolean;
  isInterfaceOpen: boolean;
  isLoading: boolean;

  frame: number;

  options: {
    clear: string;
    pointColor: string;
    backPointColor: string;

    edgeColor: string;
    edgeBackColor: string;

    edgeWidth: number;
    pointSize: number;
  }

  sphereRadius: number;
  nodes: Point[];
  n: number;
  iterations: number;
  constructor(parentElement: HTMLElement, pointPackId: string) {
    if (pointPackId.length < 5) throw new Error('id must be at least five characters');

    
    this.n = 111;
    this.iterations = 10000;

    parentElement.innerHTML = parentElement.innerHTML + `
      <div class="point-pack-container" id="${pointPackId}">
        <canvas class="point-pack-canvas" id="${pointPackId}-canvas"></canvas>
        <div class="point-pack-user-interface-container" id="${pointPackId}-interface">
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
    `;
    this.canvas = document.querySelector<HTMLCanvasElement>('#' + pointPackId + '-canvas')!;
    this.interface = document.querySelector<HTMLDivElement>('#' + pointPackId + '-interface')!;
    const nw = parentElement.clientWidth;
    const nh = parentElement.clientHeight;
    this.centerX = nw/2;
    this.centerY = nh/2;
    this.sphereRadius = .95 * (Math.min(nw, nh, 1000)/2);
    this.canvas.width = nw;
    this.canvas.height = nh;

    this.frame = 0;

    window.addEventListener('resize', () => {
      const nw = parentElement.clientWidth;
      const nh = parentElement.clientHeight;
      this.centerX = nw/2;
      this.centerY = nh/2;
      this.canvas.width = nw;
      this.canvas.height = nh;
      this.sphereRadius = .95 * (Math.min(nw, nh, 1000)/2);
      this.render();
    });

    this.ctx = this.canvas.getContext('2d')!;
    this.mouseIsDown = false;
    this.isInterfaceOpen = true;
    this.isLoading = false;

    this.options = {
      clear: 'black',
      pointColor: '#d90000',
      backPointColor: '#590000',

      edgeColor: '#dddddd',
      edgeBackColor: '#555555',

      edgeWidth: 4,
      pointSize: 8
    }

    this.nodes = [];

    this.generateEventListeners();

    this.start(false);
  }

  start = (renderSteps: boolean) => {
    this.nodes = [];
    this.generateRandomNodes();
    if (renderSteps) {this.gravitate(1000, 10000)}
    else {this.frame = window.requestAnimationFrame(() => this.init(1000, 100000, this.iterations))}
  }

  init = (g: number, f: number, step: number) => {
    this.adjustForGravity(g, f);
    this.calcEdges();
    this.render(this.iterations, step);
    if (step < 0) {
      window.cancelAnimationFrame(this.frame);
      return;
    };
    step--;
    this.frame = window.requestAnimationFrame(() => this.init(g, f, step--));
  }

  gravitate = (g: number, f: number) => {
    for (let l = 0; l < this.iterations; l++) {
      this.adjustForGravity(g, f);
    }
    this.calcEdges();
    this.render();
  }

  private calcEdges = () => {
    const dists = new Map<string, number>();
    const visited = new Set<string>();
    let minDist = Infinity;
    for (let i = 0; i < this.n; i++) {

      for (let j = 0; j < this.n; j++) {
        if (i === j) continue;
        const key = [i, j].sort((a, b) => a - b).join('-');
        if (visited.has(key)) continue;

        const p1 = this.nodes[i];
        const p2 = this.nodes[j];

        const dist = +this.distanceFormula(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z).toFixed(5);
        minDist = Math.min(minDist, dist);
        
        dists.set(key, dist);

        visited.add(key);
      }

    }

    // add edges to be drawn
    const tolerance = minDist*Math.sqrt(1.9);
    for (const key of dists.keys()) {
      const [i, j] = key.split('-');
      if (dists.get(key)! < tolerance) {
        this.nodes[+i].edges.add(key);
        this.nodes[+j].edges.add(key);
      } else {
        this.nodes[+i].edges.delete(key);
        this.nodes[+j].edges.delete(key);
      }
    }
  }

  /**
   * randomly spreads a number of nodes around a spherical plane
   */
  generateRandomNodes = () => {
    // reset nodes array
    this.nodes = [];
    for (let i = 0; i < this.n; i++) {
      this.nodes.push(this.generateRandomNode());
    }
  }

  private generateRandomNode = () => {
    const randX = (Math.random() - .5);
    const randY = (Math.random() - .5);
    const randZ = (Math.random() - .5);
    const {x, y, z} = this.projectNodeToSphere(randX, randY, randZ);
    return new Point(x, y, z);
  }

  private adjustForGravity = (g: number, f: number) => {
    for (let i = 0; i < this.n; i++) {
      let fX = 0;
      let fY = 0;
      let fZ = 0;
      const p1 = this.nodes[i];
      for (let j = 0; j < this.n; j++) {
        if (i === j) continue;
        const p2 = this.nodes[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const dist = Math.sqrt(dx**2 + dy**2 + dz**2);
        if (dist < f) {
          const F = g * 1/dist;
          fX += F*dx;
          fY += F*dy;
          fZ += F*dz;
        }
      }
      const {x, y, z} = this.projectNodeToSphere(p1.x + fX,p1.y + fY, p1.z + fZ);
      p1.x = x;
      p1.y = y;
      p1.z = z;
    }
  }

  private render = (its: number = -1, st: number = -1) => {
    this.clearCanvas();
    if (its > -1 && st > -1) {
      const s = 5;
      this.ctx.font = `Bold ${4*s}px Arial`;
      this.ctx.fillStyle = "#bbbbbb";
      this.ctx.fillText((its-st) + ' / ' + its, this.centerX*2 - ((its + '' + (its - st)).length * s*2) - (s*6), s*4);
    }
    const visitedEdges = new Set<string>();
    const drawFrontEdges: number[][] = [];
    const drawBackEdges: number[][] = [];
    const drawFrontPoints: Point[] = [];
    const drawBackPoints: Point[] = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.z > 0) {
        drawFrontPoints.push(node);
      } else {
        drawBackPoints.push(node);
      }

      // draw edges
      for (const edge of node.edges) {
        if (visitedEdges.has(edge)) continue; // already drawn
        const [i, j] = edge.split('-');
        const {x, y, z} = this.nodes[+i];
        const {x: dx, y: dy, z: dz} = this.nodes[+j];

        if ((z + dz)/2 >= 0) {
          drawFrontEdges.push([x, y, z, dx, dy, dz]);
        } else {
          drawBackEdges.push([x, y, z, dx, dy, dz]);
        }
        visitedEdges.add(edge);
      }
    }
    for (const node of drawBackPoints) {
      this.drawNode(node);
    }
    for (const node of drawBackEdges) {
      this.drawEdge(node[0], node[1], node[2], node[3], node[4], node[5]);
    }
    for (const node of drawFrontEdges) {
      this.drawEdge(node[0], node[1], node[2], node[3], node[4], node[5], true);
    }
    for (const node of drawFrontPoints) {
      this.drawNode(node, true);
    }
  }

  private distanceFormula = (x: number, y: number, z: number, dx: number, dy: number, dz: number): number => {
    return Math.sqrt((dx - x)**2 + (dy - y)**2 + (dz - z)**2);
  }

  private projectNodeToSphere = (x: number, y: number, z: number) => {
    const dist = this.distanceFormula(x, y, z, 0, 0, 0);
    return {x: x/dist, y: y/dist, z: z/dist};
  }

  private d = (n: number, z: number, isXAxis: boolean = false): number => {
    const sr = this.sphereRadius;
    return n*(1+z*sr/4000)*sr + (isXAxis ? this.centerX : this.centerY);
  }

  private drawNode = (point: Point, front: boolean = false) => {
    this.ctx.beginPath();
    this.ctx.arc(this.d(point.x, point.z, true), this.d(point.y, point.z) , this.options.pointSize, 0, 2*Math.PI);
    this.ctx.fillStyle = front ? this.options.pointColor : this.options.backPointColor;
    this.ctx.fill()
  }

  private drawEdge = (x: number, y: number, z: number, dx: number, dy: number, dz: number, front: boolean = false) => {
    const nx = this.d(x, z, true);
    const ny = this.d(y, z);
    const ndx = this.d(dx, dz, true);
    const ndy = this.d(dy, dz);
    this.ctx.beginPath();
    this.ctx.moveTo(nx, ny);
    this.ctx.lineTo(ndx, ndy);
    this.ctx.lineWidth = this.options.edgeWidth;
    this.ctx.strokeStyle = front ? this.options.edgeColor : this.options.edgeBackColor;
    this.ctx.stroke();
  }

  private clearCanvas = () => {
    this.ctx.fillStyle = this.options.clear;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  calculateRotatedCoordinates = (
    x: number,
    y: number,
    z: number,
    multiX: number,
    multiY: number,
    multiZ: number,
    deg: number
  ) => {
    // values are mislabeled to compensate for misaligned axes
    const sY = Math.sin(deg*multiX);
    const cY = Math.cos(deg*multiX);
    const sZ = -Math.sin(deg*multiY);
    const cZ = Math.cos(deg*multiY);
    const sX = Math.sin(deg*multiZ);
    const cX = Math.cos(deg*multiZ);
    const nX = x*cX*cY + y*cX*sY*sZ - y*sX*cZ + z*cX*sY*cZ + z*sX*sZ;
    const nY = x*sX*cY + y*sX*sY*sZ + y*cX*cZ + z*sX*sY*cZ - z*cX*sZ;
    const nZ = -x*sY + y*cY*sZ + z*cY*cZ;
    return {x: nX, y: nY, z: nZ}
  }

  private generateEventListeners = () => {
    document.addEventListener('mouseup', () => {
      this.mouseIsDown = false;
    });
    this.canvas.addEventListener('mousedown', () => {
      this.mouseIsDown = true;
    });
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.mouseIsDown) return;
      this.rotate(e.movementX, e.movementY);
    });

    this.interface.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    this.interface.getElementsByClassName('point-pack-toggle-user-interface')[0].addEventListener('click', () => {
      this.isInterfaceOpen = !this.isInterfaceOpen;
      this.interface.querySelectorAll<HTMLElement>('.pkui-display')[0].style.display = this.isInterfaceOpen ? 'block' : 'none';
    });

    this.interface.querySelectorAll<HTMLInputElement>('.pkui-submit')[0].addEventListener('click', (e) => {
      e.preventDefault();
      window.cancelAnimationFrame(this.frame);
      const vertexCount = this.interface.querySelectorAll<HTMLInputElement>('.pkui-vertices')[0].value;
      const iterations = this.interface.querySelectorAll<HTMLInputElement>('.pkui-iterations')[0].value;
      if (Number.isNaN(+vertexCount) || Number.isNaN(+iterations)) return;
      this.interface.querySelectorAll<HTMLInputElement>('.pkui-submit')[0].disabled = true;
      this.n = +vertexCount;
      this.iterations = +iterations;
      setTimeout(() => {
        this.start(!this.interface.querySelectorAll<HTMLInputElement>('.pkui-render-steps')[0].checked);
        this.interface.querySelectorAll<HTMLInputElement>('.pkui-submit')[0].disabled = false;
      }, 10);
    });
  }

  private rotate = (x: number, y: number) => {
    this.nodes.forEach((node) => {
      const { x: newX, y: newY, z: newZ } = this.calculateRotatedCoordinates(node.x, node.y, node.z, x, y, 0, 0.002);
      node.x = newX;
      node.y = newY;
      node.z = newZ;
    });
    this.render();
  }

}

export default PointPack;