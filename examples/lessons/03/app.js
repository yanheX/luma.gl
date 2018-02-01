/* eslint-disable array-bracket-spacing, no-multi-spaces */
import {
  GL, AnimationLoop, Program, Model, Geometry, Matrix4,
  setParameters, Buffer
} from 'luma.gl';

const FRAGMENT_SHADER = `\
#ifdef GL_ES
precision highp float;
#endif

varying vec4 vColor;

void main(void) {
  gl_FragColor = vColor;
}
`;

const VERTEX_SHADER = `\
attribute vec3 positions;
attribute vec4 colors;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(positions, 1.0);
  vColor = colors;
}
`;

const triangleGeometry = new Geometry({
  attributes: {
    positions: {size: 3, value: new Float32Array([0, 1, 0,  -1, -1, 0,  1, -1, 0])},
    colors: {size: 4, value: new Float32Array([1, 0, 0, 1,  0, 1, 0, 1,  0, 0, 1, 1])}
  }
});

const squareGeometry = new Geometry({
  drawMode: GL.TRIANGLE_STRIP,
  attributes: {
    positions: new Float32Array([1, 1, 0,  -1, 1, 0,  1, -1, 0,  -1, -1, 0]),
    colors: {
      size: 4,
      value: new Float32Array([
        0.5, 0.5, 1, 1,  0.5, 0.5, 1, 1,  0.5, 0.5, 1, 1,  0.5, 0.5, 1, 1
      ])
    }
  }
});

const animationLoop = new AnimationLoop({
  onInitialize({gl}) {

    setParameters(gl, {
      clearColor: [0, 0, 0, 1],
      clearDepth: [1],
      depthTest: true,
      depthFunc: gl.LEQUAL
    });

    const positionsBuffer = new Buffer(gl, {size: 3, data: new Float32Array([0, 1, 0,  -1, -1, 0,  1, -1, 0])});
    const colorsBuffer = new Buffer(gl, {size: 4, data: new Float32Array([1, 0, 0, 1,  0, 1, 0, 1,  0, 0, 1, 1])});
    const colorsBuffer2 = new Buffer(gl, {
      target: GL.ARRAY_BUFFER
    });

    colorsBuffer2
    .setData({data: new Float32Array([1, 0, 0, 1,  0, 1, 0, 1,  0, 0, 1, 1])})
    .setDataLayout({size: 4});

    const program = new Program(gl, {vs: VERTEX_SHADER, fs: FRAGMENT_SHADER});
    const triangle = new Model(gl, {
      // geometry: triangleGeometry, program
      attributes: {
        // positions: {size: 3, value: new Float32Array([0, 1, 0,  -1, -1, 0,  1, -1, 0])},
        positions: positionsBuffer,
        colors: colorsBuffer // colorsBuffer
      },
      vs: VERTEX_SHADER,
      fs: FRAGMENT_SHADER,
      drawMode: GL.TRIANGLE_STRIP,
      vertexCount: 3
    });
    const square = new Model(gl, {geometry: squareGeometry, program});

    return {triangle, square};
  },
  onRender(context) {
    const {gl, tick, aspect, triangle, square} = context;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projection = new Matrix4().perspective({aspect});

    // Draw triangle
    triangle
      .setPosition([-1.5, 0, -7])
      .setRotation([0, tick * 0.01, 0])
      .updateMatrix()
      .render({
        uMVMatrix: triangle.matrix,
        uPMatrix: projection
      });

    // Draw Square
    square
      .setPosition([1.5, 0, -7])
      .setRotation([tick * 0.1, 0, 0])
      .updateMatrix()
      .render({
        uMVMatrix: square.matrix,
        uPMatrix: projection
      });
  }
});

animationLoop.getInfo = () => {
  return `
  <p>
    <a href="http://learningwebgl.com/blog/?p=239" target="_blank">
      A Bit of Movement
    </a>
  <p>
    The classic WebGL Lessons in luma.gl
    `;
};

export default animationLoop;

// expose on Window for standalone example
window.animationLoop = animationLoop; // eslint-disable-lie
