export async function loadImages(manifest) {
  const entries = Object.entries(manifest);

  const results = await Promise.allSettled(
    entries.map(([key, src]) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve([key, img]);
        img.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
        img.src = src;
      });
    })
  );

  const images = {};
  for (const r of results) {
    if (r.status === "fulfilled") {
      const [key, img] = r.value;
      images[key] = img;
    } else {
      console.warn(r.reason?.message || r.reason);
    }
  }

  return images;
}
