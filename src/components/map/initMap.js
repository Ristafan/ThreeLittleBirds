import * as d3 from "d3";

import { createBaseLayer, createPointsLayers, attachClusterClickHandler, updatePointsLayers, createMigrationLayer, createBirdSpeciesLayer } from './layers.js';
import { clusterSource_from_data, migration_source_from_data } from './dataLoader.js';
import { fromLonLat } from "ol/proj";
import Map from 'ol/Map';
import View from 'ol/View';
import Attribution from 'ol/control/Attribution';

export function init_map(data, migration_data, targetId = "primary-vis", layers = [createBaseLayer()], viewConfig = { center: fromLonLat([-55, 33]), zoom: 3 }) {
  const mapContainer = document.getElementById(targetId);

  if (!mapContainer) {
      console.error(`Map container not found: #${targetId}`);
      return;
  }

  const map = new Map({
      target: mapContainer,
      layers: layers,
      view: new View(viewConfig),
      controls: [new Attribution({ 
        collapsible: true,
        collapsed: true 
      })] // add attribution control, set to collapsible to save space
  });

  // Load data and add points layer
  async function initializeDataLayer() {
      const clusterSource = await clusterSource_from_data(data);
      createPointsLayers(map);
      attachClusterClickHandler(map);
      updatePointsLayers(map, clusterSource);

  }

  async function initializeMigrationLayer() {
    const vectorSource = await migration_source_from_data(migration_data);
    createMigrationLayer(map, vectorSource);
    createBirdSpeciesLayer(map, vectorSource);
    }

    initializeDataLayer();
    initializeMigrationLayer();

    return {
        update: async (filteredData) => {
            const transformed = filteredData.map(d => ({
                id: +d.INDEX_NR,
                lon: +d.LONGITUDE,
                lat: +d.LATITUDE,
                size: +d.SIZE
            }));
            const clusterSource = await clusterSource_from_data(transformed);
            updatePointsLayers(map, clusterSource);
            map.render();
        },
        getLayers: () => map.getLayers(),
    };
}