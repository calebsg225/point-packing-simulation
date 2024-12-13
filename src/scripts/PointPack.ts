class Point {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class PointPack {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  centerX: number;
  centerY: number;

  options: {
    pointColor: string;
    backPointColor: string;

    pointSize: number;
  }

  sphereDiameter: number;
  nodes: Point[];
  n: number;
  constructor(canvasElement: HTMLElement, canvasId: string) {

    canvasElement.innerHTML = canvasElement.innerHTML + `
      <canvas class="point-pack-canvas" id="${canvasId}"></canvas>
    `;
    this.canvas = document.querySelector<HTMLCanvasElement>('#' + canvasId)!;
    this.width = 1000;
    this.height = 1000;
    this.centerX = this.width/2;
    this.centerY = this.height/2;
    this.sphereDiameter = 470;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d')!;

    this.options = {
      pointColor: 'black',
      backPointColor: '#c6c6c6',

      pointSize: 6
    }

    this.nodes = [];
    this.n = 40;

    this.spreadNodes();
    this.render();
    this.wolfNodes(0);
  }

  /**
   * randomly spreads a number of nodes around a spherical plane
   */
  spreadNodes = () => {
    // reset nodes array
    this.nodes = [];

    for (let i = 0; i < this.n; i++) {
      const randX = (Math.random() - .5) * this.sphereDiameter;
      const randY = (Math.random() - .5) * this.sphereDiameter;
      const randZ = (Math.random() - .5) * this.sphereDiameter;
      const {x, y, z} = this.projectNodeToSphere(randX, randY, randZ);
      this.nodes.push(new Point(x*this.sphereDiameter, y*this.sphereDiameter, z*this.sphereDiameter));
    }

    console.log(this.nodes);
  }

  // wolf all nodes once for every loop
  private wolfNodes = (loops: number) => {
    for (let i = 0; i < loops; i++) {
      for (let j = 0; j < this.n; j++) {
        this.wolfNode(j);
      }
    }
    this.render();
  }

  // move a node on the sphere as far as possible from all the rest
  private wolfNode = (nodeIndex: number) => {
    let totX = 0;
    let totY = 0;
    let totZ = 0;
    for (let i = 0; i < this.n; i++) {
      if (i === nodeIndex) continue;
      totX += this.nodes[i].x;
      totY += this.nodes[i].y;
      totZ += this.nodes[i].z;
    }
    const aX = -totX/(this.n - 1);
    const aY = -totY/(this.n - 1);
    const aZ = -totZ/(this.n - 1);

    const {x, y, z} = this.projectNodeToSphere(aX, aY, aZ);

    this.nodes[nodeIndex].x = x*this.sphereDiameter;
    this.nodes[nodeIndex].y = y*this.sphereDiameter;
    this.nodes[nodeIndex].z = z*this.sphereDiameter;
  }

  private render = () => {
    this.clearCanvas();
    const drawFront: Point[] = [];
    for (const node of this.nodes) {
      if (node.z > 0) {
        drawFront.push(node);
      } else {
        this.drawNode(node);
      }
    }
    for (const node of drawFront) {
      this.drawNode(node, true);
    }
    this.drawIco();
  }

  private distanceFormula = (x: number, y: number, z: number, dx: number, dy: number, dz: number): number => {
    return Math.sqrt((dx - x)**2 + (dy - y)**2 + (dz - z)**2);
  }

  private projectNodeToSphere = (x: number, y: number, z: number) => {
    const dist = this.distanceFormula(x, y, z, 0, 0, 0);
    return {x: x/dist, y: y/dist, z: z/dist};
  }

  private drawNode = (point: Point, front: boolean = false) => {
    this.ctx.beginPath();
    this.ctx.arc(point.x+this.centerX, point.y+this.centerY, this.options.pointSize, 0, 2*Math.PI);
    this.ctx.fillStyle = front ? this.options.pointColor : this.options.backPointColor;
    this.ctx.fill()
  }

  private clearCanvas = () => {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawIco = () => {
    const ico: Point[] = [];
    const g = (1+Math.sqrt(5))/4; // HALF golden ratio
    const n = .5;
    const r = this.distanceFormula(0, .5, g, 0, 0, 0);
    const setNode = (x: number, y: number, z: number) => {
      ico.push(new Point(
        x * this.sphereDiameter, y * this.sphereDiameter, z * this.sphereDiameter
      ));
    }
    // calculate values on x plane
    for (let i = 0; i <= 3; i++) {
      const y = g*(2*Math.floor(i/2) - 1);
      const z = n*(2*(i%2) - 1);
      setNode(0, y/r, z/r);
    }
    // calculate values on z plane
    for (let i = 4; i <= 7; i++) {
      const x = g*(2*Math.floor((i%4)/2) - 1);
      const y = n*(2*(i%2) - 1);
      setNode(x/r, y/r, 0);
    }
    // calculate values on y plane
    for (let i = 8; i <= 11; i++) {
      const x = n*(2*(i%2) - 1);
      const z = g*(2*Math.floor((i%4)/2) - 1);
      setNode(x/r, 0, z/r);
    }
    const drawIcoNode = (point: Point, front: boolean = false) => {
      this.ctx.beginPath();
      this.ctx.arc(point.x+this.centerX, point.y+this.centerY, 10, 0, 2*Math.PI);
      this.ctx.fillStyle = front ? 'red' : 'FF0000aa';
      this.ctx.fill()
    }
    const drawFront: Point[] = [];
    for (const node of ico) {
      if (node.z >= 0) {
        drawFront.push(node);
      } else {
        drawIcoNode(node);
      }
    }
    for (const node of drawFront) {
      drawIcoNode(node, true);
    }
  }

}

export default PointPack;