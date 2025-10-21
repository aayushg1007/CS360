const vertexShaderProgram = `#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoord;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uNMatrix;
out vec3 normal; // interpolate normal per fragment
out mat4 Vmatrix;
out vec3 posInEyeSpace;
out vec2 fragTexCoord;
out vec3 v_worldPosition;
out vec3 v_worldNormal;

void main() {
  float alpha = 20.0;
  mat4 projectionModelView = uPMatrix * uVMatrix * uMMatrix;
  gl_Position = projectionModelView * vec4(aPosition, 1.0);
  gl_PointSize = 3.0;
  posInEyeSpace = (uVMatrix * uMMatrix * vec4(aPosition, 1.0)).xyz;
  normal = normalize(mat3(uNMatrix) * aNormal);
  Vmatrix = uVMatrix;
  fragTexCoord = aTexCoord;
  v_worldPosition = (uMMatrix * vec4(aPosition, 1.0)).xyz;
  v_worldNormal = normalize(mat3(uMMatrix) * aNormal);
}`;

const fragmentShaderProgram = `#version 300 es
precision mediump float;
out vec4 fragColor;
in mat4 Vmatrix;
in vec3 posInEyeSpace;
in vec3 normal;
in vec2 fragTexCoord;
in vec3 v_worldPosition;
in vec3 v_worldNormal;
uniform vec4 uColor;
uniform vec3 uEyePos;
uniform vec3 uLightPos;
uniform vec3 levels;
uniform sampler2D imageTexture;
uniform samplerCube cubeMapTexture;
uniform float uAlphaThreshold;
uniform float uAlphaMultiplier;

void main() {
  // Phong shininess/alpha: lower value -> broader, softer highlights
  float alpha = 80.0;
  vec3 lightPosEye = (Vmatrix * vec4(uLightPos, 1.0)).xyz;
  vec3 L = normalize(lightPosEye - posInEyeSpace);
  // vec3 R = normalize(reflect(-L, normal));
  vec3 V = normalize(-posInEyeSpace);

  float nl = max(dot(normalize(normal), L), 0.0);
  float spec = 0.0;
  if(nl > 0.0 && dot(normalize(normal), V) > 0.0) {
    vec3 R = normalize(reflect(-L, normalize(normal)));
    spec = pow(max(dot(V, R), 0.0), alpha);
  }

  // float cos_theta = max(dot(normal, L), 0.0);
  // float cos_phi = max(dot(V, R), 0.0);
  // Tuned lighting multipliers: reduce diffuse/specular intensity slightly for balanced look
  vec3 ldiff = 1.0 * nl * vec3(uColor);
  vec3 lspec = 10.0 * spec * vec3(1.0, 1.0, 1.0);
  vec3 lamb = 0.35 * (vec3(uColor));
  vec4 phong_color = vec4(ldiff + lamb + lspec, 1.0);
  vec4 texture_color = texture(imageTexture, fragTexCoord);

  vec3 worldNormal = normalize(v_worldNormal);
  vec3 eyeToSurfaceDir = normalize(v_worldPosition - uEyePos);
  vec3 reflectEyeToSurfaceDir = reflect(eyeToSurfaceDir, worldNormal);
  // Use a refractive index close to 1.0 for subtle glass refraction
  vec3 refractEyeToSurfaceDir = refract(eyeToSurfaceDir, worldNormal, 0.99);

  vec4 env_reflect_color = texture(cubeMapTexture, reflectEyeToSurfaceDir);
  vec4 env_refract_color = texture(cubeMapTexture, refractEyeToSurfaceDir);

  // Apply alpha multiplier and threshold (controlled from JS)
  float texAlpha = texture_color.a * uAlphaMultiplier;
  if (texAlpha < uAlphaThreshold) {
    discard;
  }

  fragColor = levels[0] * phong_color + levels[1] * texture_color + levels[2] * env_refract_color + (1.0 - levels[0] - levels[1] - levels[2]) * env_reflect_color;
  // Set final alpha to be a mix between opaque and texture alpha based on texture contribution
  float finalAlpha = mix(1.0, texAlpha, levels[1]);
  fragColor.a = finalAlpha;
  // fragColor = texture_color;
}`;
