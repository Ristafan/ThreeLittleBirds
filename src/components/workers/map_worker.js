self.onmessage = (e) => {
  const data = e.data;

  const result = data
    .map(d => ({
      id: String(d.INDEX_NR).trim(),
      lon: Number(d.LONGITUDE),
      lat: Number(d.LATITUDE),
      size: Number(d.SIZE) || 1
    }))
    .filter(d =>
      Number.isFinite(d.lon) &&
      Number.isFinite(d.lat) &&
      !(d.lon === 0 && d.lat === 0)
    );

  postMessage(result);
};