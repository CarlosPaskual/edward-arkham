export function loadImages(manifest) {
  // manifest = { key: "path/to/file.png", ... }
  const entries = Object.entries(manifest);

  const promises = entries.map(([key, src]) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve([key, img]);
      img.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
      img.src = src;
    });
  });

  return Promise.all(promises).then((loaded) => Object.fromEntries(loaded));
