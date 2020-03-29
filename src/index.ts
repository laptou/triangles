import './index.scss';
import frag from './triangle.frag';
import vert from './triangle.vert';
import * as convert from 'color-convert';

const container = document.getElementById('app') as HTMLElement;
const canvas = document.createElement('canvas');
container.appendChild(canvas);

let { height, width } = canvas.getBoundingClientRect();

height *= window.devicePixelRatio;
width *= window.devicePixelRatio;

canvas.height = height;
canvas.width = width;

const gl = canvas.getContext('webgl2', { alpha: false, antialias: true, preserveDrawingBuffer: true  })!;

// create program
const program = gl.createProgram();
if (!program) { throw new Error("couldn't create program"); }

// load & compile shaders
const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
if (!fragShader) { throw new Error("couldn't create frag shader"); }

gl.shaderSource(fragShader, frag);
gl.compileShader(fragShader);
if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS))
  throw new Error(`couldn't compile frag shader: \n${gl.getShaderInfoLog(fragShader)}`);

const vertShader = gl.createShader(gl.VERTEX_SHADER);
if (!vertShader) { throw new Error("couldn't create vert shader"); }

gl.shaderSource(vertShader, vert);
gl.compileShader(vertShader);
if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS))
  throw new Error(`couldn't compile vert shader: \n${gl.getShaderInfoLog(vertShader)}`);

// link shaders & program
gl.attachShader(program, fragShader);
gl.attachShader(program, vertShader);
gl.deleteShader(fragShader);
gl.deleteShader(vertShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  const log = gl.getProgramInfoLog(program);
  throw new Error(`couldn't link program: \n${log}`);
}

gl.useProgram(program);

// set up uniforms
const uTransform = gl.getUniformLocation(program, 'transform');
const uColor = gl.getUniformLocation(program, 'color');
gl.uniform2f(gl.getUniformLocation(program, 'resolution'), width, height);
gl.uniform4f(uColor, 1, 0, 0, 1);
gl.uniformMatrix3x2fv(uTransform, false, [1, 0, 0, 1, 0, 0]);

// set up vertices
const vao = gl.createVertexArray();
if (!vao) throw new Error(`failed to create vao: 0x${gl.getError().toString(16)}`);
gl.bindVertexArray(vao);

const vbo = gl.createBuffer();
if (!vbo) throw new Error(`failed to create vbo: 0x${gl.getError().toString(16)}`);
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -100, -50, 
  100, -50,
  0, 100,

  -300, -25, 
  -150, -25,
  -225, 50,

  225, 50,
  300, -25, 
  150, -25
]), gl.STATIC_DRAW);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(0);

// set background colour
gl.clearColor(0, 0, 0, 1);

let rotation = 0;
let hue = 0;
let frame = performance.now();
let clear = true;

window.addEventListener('keypress', ev => {
  if (ev.keyCode === 32) clear = !clear;
});

// render
function render(time: DOMHighResTimeStamp) {
  const { sin, cos } = Math;
  const delta = time - frame;
  frame = time;

  rotation = (rotation + delta / 500) % (Math.PI * 2);
  hue = (hue + delta / 500) % (Math.PI * 2);
  const scale = 1 + 0.5 * sin((frame / 837) % (Math.PI * 2));

  const [red, green, blue] = convert.hsl.rgb([hue * 180 / Math.PI, 100, 50]);
  gl.uniform4fv(uColor, [red / 255, green / 255, blue / 255, 1]);

  gl.uniformMatrix3x2fv(uTransform, false, 
    [
      scale * cos(rotation), scale * -sin(rotation), 
      scale * sin(rotation), scale * cos(rotation), 
      width / 2, height / 2]
  );

  if (clear)
    gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 9);
  
  requestAnimationFrame(render);
}

requestAnimationFrame(render);