import * as d3 from 'd3';

import { init_map } from './map/initMap.js';
import { init_sliders, applyClusterSelection} from './sliders.js';
import { init_heatmaps } from './heatmap/initHeatmaps.js';
import { init_barplot } from './barplot/initBarplot.js';
import { MIGRATION_LAYER_ID } from './map/layers.js';

const state = {
  data: null,
  mapData: null,
  map: null,
  heatmaps: null,
  barplots: null,
  migration_data: null
};

export async function init_visualizations() {
  // ensure initial render completes before heavy lifting
  await new Promise(requestAnimationFrame);

  // fetch data concurrently to reduce loading times
  [state.data, state.migration_data] = await Promise.all([
    d3.csv('data/STRIKE_REPORTS_CLEAN.csv'),
    d3.csv('data/Bird_migration_dataset_renamed_CLEAN.csv')
  ]);


  init_sliders(state.data, (filterFn) => {
    update_visualizations(filterFn);
  });

  const map_worker = new Worker(
    new URL('./workers/map_worker.js', import.meta.url),
    { type: 'module' }
  );

  map_worker.postMessage(state.data);

  map_worker.onmessage = (e) => {
    state.mapData = e.data;

    document.querySelectorAll('.vis-loader').forEach(el => el.remove());

    state.map = init_map(state.mapData, state.migration_data);

    setTimeout(() => {
      state.heatmaps = init_heatmaps(state.data);
      state.barplots = init_barplot(state.data);
    }, 0);
  };

  // toggle layer visibility based on checkbox state
  document.getElementById('toggleMigration').addEventListener('change', (e) => {
    const layer = state.map.getLayers().getArray()
      .find(l => l.get('id') === MIGRATION_LAYER_ID);

    if (layer) {
      layer.setVisible(e.target.checked);
    }
  });

  const music = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');

  toggle.addEventListener('change', () => {
    // play music when the checkbox is checked
    if (toggle.checked) {
      music.play();
    } else {
      music.pause();
    }
  });
}

export function update_visualizations(filterFn) {
  if (!state.data) return;
  const baseFiltered = state.data.filter(filterFn);
  const filtered = applyClusterSelection(baseFiltered);
  console.log('Filtered rows:', filtered.length);

  const filteredIds = new Set(
  filtered.map(d => String(d.INDEX_NR).trim())
  );
  const filteredMapData = state.mapData.filter(d =>
    filteredIds.has(d.id)
  );
  if (state.map?.update) {state.map.update(filteredMapData);}
  if (state.heatmaps?.update) state.heatmaps.update(filtered);
  if (state.barplots?.update) state.barplots.update(filtered);
}