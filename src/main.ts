import vertexSrc from "./shader/vertex.glsl";
import fragmentSrc from "./shader/fragment.glsl";

window.onload = main;

type ProgramInfo = {
  program: WebGLProgram;
  attribLocations: Record<string, number>;
  uniformLocations: Record<string, WebGLUniformLocation | null>;
};

function main() {
  const canvas: HTMLCanvasElement | null = document.querySelector("#canvas");
  if (!canvas) throw new Error("canvas is null");

  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("webgl not supported");

  const shaderProgram = initShaderProgram(gl, vertexSrc, fragmentSrc);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(shaderProgram);

  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "a_position"),
    },
    uniformLocations: {},
  };

  const buffers = initBuffers(gl);

  draw(gl, programInfo, buffers);
}

function initBuffers(gl: WebGL2RenderingContext) {
  const positionBuffer = initPositionBuffer(gl);

  return {
    position: positionBuffer,
  };
}

function initPositionBuffer(gl: WebGL2RenderingContext) {
  const positionBuffer = gl.createBuffer();
  if (positionBuffer === null) {
    throw new Error("position buffer is null");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // prettier-ignore
  const positions = [
    -0.5, -0.5, 0, 
    0.5, -0.5, 0, 
    0.0, 0.5, 0.8 
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

function draw(
  gl: WebGL2RenderingContext,
  programInfo: ProgramInfo,
  buffers: Record<string, WebGLBuffer>
) {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  setPositionAttrib(gl, programInfo, buffers);
  gl.useProgram(programInfo.program);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
}

function setPositionAttrib(
  gl: WebGL2RenderingContext,
  programInfo: ProgramInfo,
  buffers: Record<string, WebGLBuffer>
) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function initShaderProgram(
  gl: WebGL2RenderingContext,
  vertexSrc: string,
  fragmentSrc: string
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSrc);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

  const shaderProgram = gl.createProgram();
  if (shaderProgram === null) throw new Error("shader program is null");
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error("unable to init shader program");
  }

  return shaderProgram;
}

function loadShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (shader === null)
    throw new Error(`shader is null type: ${type} source: ${source}`);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error("shader compilation error");
  }

  return shader;
}
