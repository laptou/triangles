#version 300 es
precision highp float;
precision highp int;

in vec2 position;

uniform vec2 resolution;
uniform mat3x2 transform;
uniform vec4 color;

out vec4 v_color;

void main () {
  // convert screen space coords to clip space coords
  vec2 transformedPosition = transform * vec3(position, 1.);
  vec2 scaledPosition = transformedPosition / (resolution / 2.);
  vec2 originPosition = (scaledPosition - vec2(1.)) * vec2(1., -1.);
  gl_Position = vec4(originPosition, 1., 1.);
  v_color = color;
}