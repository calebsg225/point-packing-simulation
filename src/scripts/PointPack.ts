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
    this.n = 12;

    this.generateRandomNodes();
    window.requestAnimationFrame(() => this.init(800, 8000));
    //this.gravitate(1000, 800, 8000);
  }

  private init = (g: number, f: number) => {
    this.adjustForGravity(g, f);
    this.render();
    window.requestAnimationFrame(() => this.init(g, f));
  }

  gravitate = (loopCount: number, g: number, f: number) => {
    for (let l = 0; l < loopCount; l++) {
      this.adjustForGravity(g, f);
    }
    this.render();
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
    const randX = (Math.random() - .5) * this.sphereDiameter;
    const randY = (Math.random() - .5) * this.sphereDiameter;
    const randZ = (Math.random() - .5) * this.sphereDiameter;
    const {x, y, z} = this.projectNodeToSphere(randX, randY, randZ);
    return new Point(x*this.sphereDiameter, y*this.sphereDiameter, z*this.sphereDiameter);
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
      p1.x = x*this.sphereDiameter;
      p1.y = y*this.sphereDiameter;
      p1.z = z*this.sphereDiameter;
    }
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

}

export default PointPack;