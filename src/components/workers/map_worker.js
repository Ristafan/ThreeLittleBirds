self.onmessage = (e) => {
  const data = e.data;

  const result = data.map(d => ({
    id: d.INDEX_NR,
    lon: +d.LONGITUDE,
    lat: +d.LATITUDE,
    size: +d.SIZE
  }));

  postMessage(result);
};