import WebGLVectorLayer from 'ol/layer/WebGLVector.js';
import VectorLayer from 'ol/layer/Vector.js';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import Text from 'ol/style/Text.js';
import { extend } from 'ol/extent';

import { update_visualizations } from '../init_and_update.js';
import { getSliderFilter, sliderState } from '../sliders.js';

export function createBaseLayer() {
  return new TileLayer({
    source: new OSM(),
  });
}

// update points layer, see https://openlayers.org/en/latest/examples/webgl-points-layer.html for reference

const POINTS_LAYER_ID = 'pointsLayer';
export const MIGRATION_LAYER_ID = 'migrationLayer';

export function createMigrationLayer(map, vectorSource) {
  let existingLayer = null;

  map.getLayers().forEach(layer => {
    if (layer.get('id') === MIGRATION_LAYER_ID) {
      existingLayer = layer;
    }
  });

  if (existingLayer) {
    existingLayer.setSource(vectorSource);
    existingLayer.changed(); // ensures re-render if needed
    return;
  }
  const migrationLayer = new WebGLVectorLayer({
    source: vectorSource,
    style: {
    'stroke-color': ['get', 'color'], 
    'stroke-width': ['get', 'width']
    }
  });

  migrationLayer.set('id', MIGRATION_LAYER_ID);
  migrationLayer.setVisible(false);

  migrationLayer.setZIndex(30);
  map.addLayer(migrationLayer);

  // add click interaction to highlight selected migration route
  const selectedFeatures = new Set();

  map.on('click', event => {

    let clickedAnyFeature = false;

    map.forEachFeatureAtPixel(event.pixel, feature => {
      clickedAnyFeature = true;

        // already selected -> deselect
        if (selectedFeatures.has(feature)) {
          const color = feature.get('color') || [0, 0, 0, 0.2]; // default to semi-transparent black if no color set, avoids issues if color property is missing for some reason
          const baseColor = color.slice(0, 3);
          feature.set('color', [...baseColor, 0.2]);
          feature.set('width', 1.5);
          feature.set('selected', false);

          selectedFeatures.delete(feature);

        } else {
          // newly selected -> highlight
          const color = feature.get('color') || [0, 0, 0, 0.2];
          const baseColor = color.slice(0, 3);
          feature.set('color', [...baseColor, 1.0]);
          feature.set('width', 4);
          feature.set('selected', true);

          selectedFeatures.add(feature);
        }

        return true;
      });

      migrationLayer.changed();

      if (!clickedAnyFeature) {
      // Clear selection if click on empty space
      selectedFeatures.forEach(feature => {
        feature.set('opacity', 0.15);
        feature.set('width', 1.5);
        feature.set('selected', false);
      });
    }
  });
}

export function createBirdSpeciesLayer(map, vectorSource) {
  const labelLayer = new VectorLayer({
    source: vectorSource,
    style: feature => {

      if (!feature.get('selected')) {
        return null; // only label selected feature
      }

      return new Style({
        text: new Text({
          text: feature.get('Bird_species'),

          font: '14px sans-serif',

          fill: new Fill({
            color: '#fff'
          }),

          stroke: new Stroke({
            color: '#000',
            width: 3
          }),

          overflow: true,
          placement: 'line'
        })
      });
    }
  });

  labelLayer.setZIndex(40);

  map.addLayer(labelLayer);
}

export function createPointsLayers(map) {
  // prevent duplicates
  if (map.get('pointsLayers')) return map.get('pointsLayers');

  const pointsLayer = new WebGLVectorLayer({
    source: null, // set later
    style: {
      'circle-radius': [
        'interpolate',
        ['exponential', 1.75],
        ['get', 'size'],
        1, 4,
        10, 6,
        50, 9,
        100, 12,
        150, 14,
        200, 16,
        250, 17,
        400, 20,
        500, 23,
        700, 26
      ],

      'circle-fill-color': [
        'interpolate',
        ['exponential', 1.75],
        ['get', 'size'],

        1,   'rgba(235, 170, 60, 0.82)',
        10,  'rgba(232, 156, 58, 0.82)',
        50,  'rgba(228, 142, 56, 0.84)',
        100, 'rgba(224, 128, 54, 0.85)',
        150, 'rgba(220, 114, 52, 0.86)',
        200, 'rgba(216, 100, 50, 0.87)',
        250, 'rgba(212, 86, 48, 0.88)',
        400, 'rgba(206, 72, 52, 0.89)',
        500, 'rgba(196, 60, 56, 0.90)',
        700, 'rgba(183, 45, 45, 0.92)'
      ],

      'circle-stroke-color': 'rgba(255,255,255,0.7)',
      'circle-stroke-width': 0.8,
    }
  });

  const labelLayer = new VectorLayer({
    source: null,
    style: (feature) => {
      const size = feature.get('size');
      if (size <= 1) return null;

      return new Style({
        text: new Text({
          text: String(size),
          font: '600 11px sans-serif',
          fill: new Fill({ color: 'rgba(255,255,255,0.9)' }),
          stroke: new Stroke({
            color: 'rgba(0,0,0,0.22)',
            width: 1.5,
          }),
        }),
      });
    },
  });

  pointsLayer.set('id', POINTS_LAYER_ID);
  labelLayer.set('id', `${POINTS_LAYER_ID}_labels`);

  pointsLayer.setZIndex(10);
  labelLayer.setZIndex(20);

  map.addLayer(pointsLayer);
  map.addLayer(labelLayer);

  map.set('pointsLayers', {
    pointsLayer,
    labelLayer,
    clickHandlerAdded: false
  });

  return map.get('pointsLayers');
}

export function updatePointsLayers(map, clusterSource) {
  const layers = map.get('pointsLayers');
  if (!layers) throw new Error('Call createPointsLayers(map) first');

  let { pointsLayer, labelLayer } = layers;

  // Find the current z-index before removing
  const zIndex = pointsLayer.getZIndex();

  // Dispose GPU resources before removing
  pointsLayer.dispose();
  map.removeLayer(pointsLayer);

  // Recreate with same style
  pointsLayer = new WebGLVectorLayer({
    source: clusterSource,
    style: {
      'circle-radius': [
        'interpolate',
        ['exponential', 1.75],
        ['get', 'size'],
        1, 4,
        10, 6,
        50, 9,
        100, 12,
        150, 14,
        200, 16,
        250, 17,
        400, 20,
        500, 23,
        700, 26
      ],

      'circle-fill-color': [
        'interpolate',
        ['exponential', 1.75],
        ['get', 'size'],

        1,   'rgba(235, 170, 60, 0.82)',
        10,  'rgba(232, 156, 58, 0.82)',
        50,  'rgba(228, 142, 56, 0.84)',
        100, 'rgba(224, 128, 54, 0.85)',
        150, 'rgba(220, 114, 52, 0.86)',
        200, 'rgba(216, 100, 50, 0.87)',
        250, 'rgba(212, 86, 48, 0.88)',
        400, 'rgba(206, 72, 52, 0.89)',
        500, 'rgba(196, 60, 56, 0.90)',
        700, 'rgba(183, 45, 45, 0.92)'
      ],

      'circle-stroke-color': 'rgba(255,255,255,0.7)',
      'circle-stroke-width': 0.8,
    }
  });

  pointsLayer.set('id', POINTS_LAYER_ID);
  pointsLayer.setZIndex(zIndex); // preserve z-index explicitly

  map.addLayer(pointsLayer);     // addLayer respects zIndex — no insertAt needed

  labelLayer.setSource(clusterSource);

  // Update stored reference
  layers.pointsLayer = pointsLayer;

  map.render();
}

export function attachClusterClickHandler(map) {
  const layers = map.get('pointsLayers');
  if (!layers || layers.clickHandlerAdded) return;

  map.on('singleclick', (event) => {
    const currentLayers = map.get('pointsLayers');

    const feature = map.forEachFeatureAtPixel(
      event.pixel,
      (feature, layer) => {
        if (layer === currentLayers.pointsLayer || layer === currentLayers.labelLayer) {
          return feature;
        }
      }
    );

    if (!feature) {
      if (sliderState.selection?.active) {
        sliderState.selection = {
          active: false,
          type: null,
          ids: []
        };
        update_visualizations(getSliderFilter());
      }
      return;
    }

    const clusteredFeatures = feature.get('features');
    if (!clusteredFeatures?.length) return;

    const extent = clusteredFeatures[0].getGeometry().getExtent().slice();
    for (const f of clusteredFeatures) {
      extend(extent, f.getGeometry().getExtent());
    }

    sliderState.selection = {
      active: true,
      type: 'cluster',
      ids: clusteredFeatures.map(f => f.get('id'))
    };

    update_visualizations(getSliderFilter());

    map.getView().fit(extent, {
      duration: 500,
      padding: [80, 80, 80, 80],
      maxZoom: 10,
    });
  });

  layers.clickHandlerAdded = true;
}