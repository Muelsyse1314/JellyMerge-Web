/* Godot 4.7.2 Compatibility updates index regions through ARRAY_BUFFER.
 * WebGL forbids rebinding an element buffer there. COPY_WRITE_BUFFER is the
 * legal WebGL 2 upload target, and leaves vertex-array bindings untouched.
 * Scope this workaround to the game's own context; keep all other calls native.
 */
(() => {
  const canvas = document.getElementById('canvas');
  const getContext = canvas.getContext.bind(canvas);
  const prepared = new WeakSet();
  canvas.getContext = function (kind, attributes) {
    const gl = getContext(kind, attributes);
    if (kind !== 'webgl2' || !gl || prepared.has(gl)) return gl;
    prepared.add(gl);
    const indexBuffers = new WeakSet();
    const bindBuffer = gl.bindBuffer.bind(gl);
    const bufferSubData = gl.bufferSubData.bind(gl);
    let indexUpload = false;
    gl.bindBuffer = function (target, buffer) {
      if (target === gl.ELEMENT_ARRAY_BUFFER && buffer) indexBuffers.add(buffer);
      if (target === gl.ARRAY_BUFFER) {
        if (buffer && indexBuffers.has(buffer)) {
          indexUpload = true;
          bindBuffer(gl.COPY_WRITE_BUFFER, buffer);
          return;
        }
        if (indexUpload) bindBuffer(gl.COPY_WRITE_BUFFER, null);
        indexUpload = false;
      }
      bindBuffer(target, buffer);
    };
    gl.bufferSubData = function (target, ...args) {
      bufferSubData(indexUpload && target === gl.ARRAY_BUFFER ? gl.COPY_WRITE_BUFFER : target, ...args);
    };
    return gl;
  };
})();
