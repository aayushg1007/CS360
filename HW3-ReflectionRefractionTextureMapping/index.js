"use strict";

let canvas;
let gl;

let shaderProgram;
let animation;
let aPositionLoc, aNormalLoc, aTexCoordLoc;
let uMMatrixLoc, uVMatrixLoc, uPMatrixLoc, uNMatrixLoc;
let uColorLoc, uLightLoc, uEyePosLoc;
let uTextureLoc, uObjectTypeLoc, uCubeMapTexLoc;
let uLevelsLoc;
let uAlphaThresholdLoc, uAlphaMultiplierLoc;

let radius = 13.1;
let eyePos = [null, null, null];
let COI = [0.0, 0.0, 0.0];
let viewUp = [0.0, 1.0, 0.0];
let lightPos = [70, 65, 100];
let degree0 = -280;
let degree1 = 5;
let rateOfChange = 0.5;
// alpha controls (UI will modify)
// hardcoded alpha controls per request
let alphaThreshold = 0.3; // discard threshold
let alphaMultiplier = 7.0; // multiply sampled alpha

let cube;
let sphere;
let sheet;
let kettle;


let wood_path = "./texture_and_other_files/wood_texture.jpg";
let earth_path = "./texture_and_other_files/earthmap.jpg";
let kettle_path = "./texture_and_other_files/teapot.json";
let fence_path = "./texture_and_other_files/fence_alpha.png";
let wood_texture;
let cubemap_texture;
let sky_textures;
let earth_texture;
let fence_texture;

let vMatrix = mat4.create(); // view matrix
let mMatrix = mat4.create(); // model matrix
let pMatrix = mat4.create(); // projection matrix
let matrixStack = [];
let isAnimation = false;
function drawSkyBox() {
  let color = hexToColorArray("#fa1300");
  const screendist = 800;
  const disp = 399.5;

  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [0, 0, -disp]);
  mat4.scale(mMatrix, [screendist, screendist, 0]);
  sheet.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    sky_textures[5],
    cubemap_texture
  );
  mMatrix = popMatrix(matrixStack);

  // front face
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [0, 0, disp]);
  mat4.scale(mMatrix, [screendist, screendist, 0]);
  mat4.rotate(mMatrix, degToRad(180), [0, 1, 0]);
  sheet.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    sky_textures[4],
    cubemap_texture
  );
  mMatrix = popMatrix(matrixStack);

  // top face
  pushMatrix(matrixStack, mMatrix);
  mat4.rotate(mMatrix, degToRad(180), [0, 1, 0]);
  mat4.translate(mMatrix, [0, disp, 0]);
  mat4.scale(mMatrix, [screendist, 0, screendist]);
  mat4.rotate(mMatrix, degToRad(90), [1, 0, 0]);
  sheet.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    sky_textures[2],
    cubemap_texture
  );
  mMatrix = popMatrix(matrixStack);

  // bottom face
  pushMatrix(matrixStack, mMatrix);
  mat4.rotate(mMatrix, degToRad(180), [0, 1, 0]);
  mat4.translate(mMatrix, [0, -disp, 0]);
  mat4.scale(mMatrix, [screendist, 0, screendist]);
  mat4.rotate(mMatrix, degToRad(-90), [1, 0, 0]);
  sheet.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    sky_textures[3],
    cubemap_texture
  );
  mMatrix = popMatrix(matrixStack);

  // right face
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [disp, 0, 0]);
  mat4.scale(mMatrix, [0, screendist, screendist]);
  mat4.rotate(mMatrix, degToRad(180), [0, 1, 0]);
  mat4.rotate(mMatrix, degToRad(90), [0, 1, 0]);
  sheet.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    sky_textures[0],
    cubemap_texture
  );
  mMatrix = popMatrix(matrixStack);

  // left face
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [-disp, 0, 0]);
  mat4.scale(mMatrix, [0, screendist, screendist]);
  mat4.rotate(mMatrix, degToRad(180), [0, 1, 0]);
  mat4.rotate(mMatrix, degToRad(-90), [0, 1, 0]);
  sheet.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    sky_textures[1],
    cubemap_texture
  );
  mMatrix = popMatrix(matrixStack);
}

function drawKettle() {
  let color, levels;
  color = hexToColorArray("#525351ff");
  levels = [0.1, 0.0, 0.0];
  pushMatrix(matrixStack, mMatrix);
  mat4.scale(mMatrix, [0.23, 0.23, 0.23]);
  kettle.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    wood_texture,
    cubemap_texture,
    levels
  );
  mMatrix = popMatrix(matrixStack);
}

function drawTable() {
  let color, levels;
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [0.0, -2.0, 0.0]);
  mat4.scale(mMatrix, [7.0, 0.3, 5.0]);
  color = hexToColorArray("#964b00");
  // Make the table non-reflective: 0 reflection (env_refract/env_reflect off), use only texture
  // levels: [phong, texture, refract]
  levels = [0.0, 1.0, 0.0];
  sphere.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    wood_texture,
    cubemap_texture,
    levels
  );
  mMatrix = popMatrix(matrixStack);
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [-3.0, -6.0, -3.0]);
  mat4.scale(mMatrix, [0.5, 8.0, 0.5]);
  cube.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    wood_texture,
    cubemap_texture,
    levels
  );
  mMatrix = popMatrix(matrixStack);
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [-3.0, -6.0, 3.0]);
  mat4.scale(mMatrix, [0.5, 8.0, 0.5]);
  cube.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    wood_texture,
    cubemap_texture,
    levels
  );
  mMatrix = popMatrix(matrixStack);
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [3.0, -6.0, -3.0]);
  mat4.scale(mMatrix, [0.5, 8.0, 0.5]);
  cube.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    wood_texture,
    cubemap_texture,
    levels
  );
  mMatrix = popMatrix(matrixStack);
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [3.0, -6.0, 3.0]);
  mat4.scale(mMatrix, [0.5, 8.0, 0.5]);
  cube.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    wood_texture,
    cubemap_texture,
    levels
  );
  mMatrix = popMatrix(matrixStack);
}

function drawScene() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  const bg = hexToColorArray("#282828");
  gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let color, levels;

  if (!mouseIsDown) {
    degree0 = (degree0 + rateOfChange) % 360;
  }

  let deg0 = degToRad(degree0);
  let deg1 = degToRad(degree1);
  eyePos = [
    radius * Math.cos(-deg1) * Math.cos(deg0),
    radius * Math.sin(deg1),
    radius * Math.cos(-deg1) * Math.sin(deg0),
  ];

  gl.uniform3fv(uEyePosLoc, eyePos);
  gl.uniform3fv(uLightLoc, lightPos);
  // pass alpha controls
  if (uAlphaThresholdLoc) gl.uniform1f(uAlphaThresholdLoc, alphaThreshold);
  if (uAlphaMultiplierLoc) gl.uniform1f(uAlphaMultiplierLoc, alphaMultiplier);

  mat4.identity(mMatrix);
  mat4.identity(pMatrix);
  mat4.identity(vMatrix);
  vMatrix = mat4.lookAt(eyePos, COI, viewUp, vMatrix);
  // Use canvas aspect ratio for correct perspective
  const aspect = canvas.width / canvas.height;
  mat4.perspective(50, aspect, 0.1, 1000, pMatrix);

  pushMatrix(matrixStack, mMatrix);
  drawSkyBox();
  mMatrix = popMatrix(matrixStack);
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [0.0, 0.1, -1.5]);
  drawKettle();
  mMatrix = popMatrix(matrixStack);
  pushMatrix(matrixStack, mMatrix);
  drawTable();
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [3.0, -0.9, 0.0]);
  // Small inner sphere (inside the cage) restored to this position
  mat4.scale(mMatrix, [0.5, 0.5, 0.5]);
  color = hexToColorArray("#1f219eff");
  // strong Phong so it appears lit inside the cage
  levels = [0.5, 0.0, 0.0];
  sphere.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    wood_texture,
    cubemap_texture,
    levels
  );
  mMatrix = popMatrix(matrixStack);
  pushMatrix(matrixStack, mMatrix);
  // Earth (larger) restored to this position
  mat4.translate(mMatrix, [-0.0, -0.75, 2.0]);
  mat4.scale(mMatrix, [1, 1, 1]);
  color = hexToColorArray("#0527e6ff");
  // modest Phong + texture for Earth
  levels = [0.1, 1, 0];
  sphere.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    earth_texture || wood_texture,
    cubemap_texture,
    levels
  );
  mMatrix = popMatrix(matrixStack);
  // Draw a transparent cage around the small sphere at [3.0, -0.9, 0.0]
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [3.0, -0.9, 0.0]);
  // small sphere scaled 0.6, so cage slightly larger
  mat4.scale(mMatrix, [1.3, 1.3, 1.3]);
  // disable depth writes so transparent fragments don't occlude objects behind
  gl.depthMask(false);
  // enable blending for PNG alpha
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  color = hexToColorArray("#ffffff");
  levels = [0.0, 1.0, 0.0];
  if (fence_texture) {
    cube.draw(
      mMatrix,
      vMatrix,
      pMatrix,
      color,
      fence_texture,
      cubemap_texture,
      levels
    );
  }
  gl.disable(gl.BLEND);
  gl.depthMask(true);
  mMatrix = popMatrix(matrixStack);
  // mirrored reflective cube (uses environment reflection)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, [-3.0, -0.4, 1.0]);
  mat4.scale(mMatrix, [1.3, 2.5, 0.3]);
  // use env_refract to model a glass block (refracts background using cubemap)
  levels = [0.0, 0.0, 0.99];
  cube.draw(
    mMatrix,
    vMatrix,
    pMatrix,
    color,
    wood_texture,
    cubemap_texture,
    levels
  );
  mMatrix = popMatrix(matrixStack);
}

let animate = function () {
  if (animation) {
    window.cancelAnimationFrame(animation);
  }
  drawScene();
  animation = window.requestAnimationFrame(animate);
};

function initLocations() {
  aPositionLoc = gl.getAttribLocation(shaderProgram, "aPosition");
  aNormalLoc = gl.getAttribLocation(shaderProgram, "aNormal");
  aTexCoordLoc = gl.getAttribLocation(shaderProgram, "aTexCoord");
  uMMatrixLoc = gl.getUniformLocation(shaderProgram, "uMMatrix");
  uVMatrixLoc = gl.getUniformLocation(shaderProgram, "uVMatrix");
  uPMatrixLoc = gl.getUniformLocation(shaderProgram, "uPMatrix");
  uNMatrixLoc = gl.getUniformLocation(shaderProgram, "uNMatrix");
  uColorLoc = gl.getUniformLocation(shaderProgram, "uColor");
  uLightLoc = gl.getUniformLocation(shaderProgram, "uLightPos");
  uEyePosLoc = gl.getUniformLocation(shaderProgram, "uEyePos");
  uTextureLoc = gl.getUniformLocation(shaderProgram, "imageTexture");
  uCubeMapTexLoc = gl.getUniformLocation(shaderProgram, "cubeMapTexture");
  uLevelsLoc = gl.getUniformLocation(shaderProgram, "levels");
  uAlphaThresholdLoc = gl.getUniformLocation(shaderProgram, "uAlphaThreshold");
  uAlphaMultiplierLoc = gl.getUniformLocation(shaderProgram, "uAlphaMultiplier");
}

function initShaderBuffers() {
  cube = new Cube();
  sphere = new Sphere();
  sheet = new Sheet();
  kettle = new MeshObject(kettle_path);
  cube.initBuffer();
  sphere.initBuffer();
  sheet.initBuffer();
  kettle.initObject();
}

function webGLStart() {
  canvas =(document.getElementById("canva"));
  canvas.addEventListener(
    "wheel",
    (event) => {
      radius += event.deltaY * 0.005;
      radius = Math.max(0.1, radius);
      radius = Math.min(25.0, radius);
      event.preventDefault();
      animate();
    },
    false
  );

  if (!canvas) alert(`Canvas not found!`);
  gl = initGL(canvas);
  document.addEventListener("mousedown", onMouseDown, false);
  shaderProgram = initShaders(vertexShaderProgram, fragmentShaderProgram);
  initLocations();
  initShaderBuffers();

  gl.enable(gl.DEPTH_TEST);

  wood_texture = initTextures(wood_path);
  earth_texture = initTextures(earth_path);
  fence_texture = initTextures(fence_path);
  cubemap_texture = initCubeMap();
  sky_textures = initSkyTextures();
}
