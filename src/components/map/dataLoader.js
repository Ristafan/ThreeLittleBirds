import * as d3 from 'd3';

import {fromLonLat} from "ol/proj";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import {LineString} from 'ol/geom';

export async function clusterSource_from_data(data) {
  const validData = data.filter(d =>
    Number.isFinite(d.lon) &&
    Number.isFinite(d.lat) &&
    !(d.lon === 0 && d.lat === 0)
  );
  const features = validData.map(d => {
    return new Feature({
      id: d.id,
      geometry: new Point(fromLonLat([+d.lon, +d.lat])),
      ...d
    });
  });

  return new Cluster({
    distance: 30,
    source: new VectorSource({features}),
    createCluster: function (point, features) {
      return new Feature({
        geometry: point,
        features: features,
        size: features.length,
        idx: features.map(f => f.get('id'))
      });
    }
  });
}

export function migration_source_from_data(data) {

  const excludedRoutes = new Set(["NA", "1418.0"]);
  const excludedIds = new Set(["NA", "775.0", "42766.0", "42660.0" , "42686.0"]);

  const filtered = data.filter(d =>
    !excludedRoutes.has(d["Migratory route codes"]) &&
    !excludedIds.has(d["ID"])
  );

  const grouped = {};
  filtered.forEach(d => {
    const key = `${d["English Name"]}_${d["Migratory route codes"]}`;
    
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  const speciesColors = {};
  let colorIndex = 0;
  Object.keys(grouped).forEach(key => {
    const species = key.split('_')[0];
    if (!speciesColors[species]) {
      const color = d3.schemeCategory10[colorIndex % 10];
      const rgb = d3.color(color).rgb();

      speciesColors[species] = [rgb.r, rgb.g, rgb.b, 0.2];
      colorIndex++;
    }
  });


  const features = Object.values(grouped).map(points => {
    
    points.sort((a,b) => a.ID - b.ID);

    let previous_lon = null;

    const coords = points.map(d => {

      let lon = +d.GPS_xx;
      let lat = +d.GPS_yy;

      if (previous_lon !== null) {
        let delta = lon-previous_lon;
        if (delta > 180) {
          lon -= 360;
        } else if (delta < -180) {
          lon += 360;
        }
      }

      previous_lon = lon;
      
      return fromLonLat([lon, lat]);
    });

    return new Feature({
      geometry: new LineString(coords),
      migration_route: points[0].migration_route,
      Migratory_route_code: points[0].Migratory_route_code,
      Bird_species: points[0]["English Name"],
      color: speciesColors[points[0]["English Name"]],
      width: 2,
      selected: false
    });
  });

  return new VectorSource({ features });
}
