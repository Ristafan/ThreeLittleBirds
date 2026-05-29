import { createHeatmap } from "./createHeatmap";
import { initTabs } from "./initTabs";

const heatmapConfigs = {
  "Airplane": {
    svgPath: "/data/images/airplane.svg",
    acClass: ["A"],
    parts: ['STR_RAD', 'DAM_RAD', 'STR_WINDSHLD', 'DAM_WINDSHLD', 'STR_NOSE', 'DAM_NOSE', 'STR_ENG1', 'DAM_ENG1', 'STR_ENG2', 'DAM_ENG2', 'STR_ENG3', 'DAM_ENG3', 'STR_ENG4', 'DAM_ENG4', 'STR_PROP', 'DAM_PROP', 'STR_WING_ROT', 'DAM_WING_ROT', 'STR_FUSE', 'DAM_FUSE', 'STR_LG', 'DAM_LG', 'STR_TAIL', 'DAM_TAIL', 'STR_LGHTS', 'DAM_LGHTS'],
    legendOffset: { x: 20, y: 22 }
  },
  "Helicopter": {
    svgPath: "/data/images/helicopter.svg",
    acClass: ["B"],
    parts: ['STR_RAD', 'DAM_RAD', 'STR_WINDSHLD', 'DAM_WINDSHLD', 'STR_NOSE', 'DAM_NOSE', 'STR_ENG1', 'DAM_ENG1', 'STR_ENG2', 'DAM_ENG2', 'STR_ENG3', 'DAM_ENG3', 'STR_ENG4', 'DAM_ENG4', 'STR_PROP', 'DAM_PROP', 'STR_WING_ROT', 'DAM_WING_ROT', 'STR_FUSE', 'DAM_FUSE', 'STR_LG', 'DAM_LG', 'STR_TAIL', 'DAM_TAIL', 'STR_LGHTS', 'DAM_LGHTS'],
    legendOffset: { x: 20, y: 22 }
  },
  "Other": {
    svgPath: "/data/images/other.svg",
    acClass: ["C", "D", "F", "I", "J", "Y", "Z"],
    parts: ['STR_RAD', 'DAM_RAD', 'STR_WINDSHLD', 'DAM_WINDSHLD', 'STR_NOSE', 'DAM_NOSE', 'STR_ENG1', 'DAM_ENG1', 'STR_ENG2', 'DAM_ENG2', 'STR_ENG3', 'DAM_ENG3', 'STR_ENG4', 'DAM_ENG4', 'STR_PROP', 'DAM_PROP', 'STR_WING_ROT', 'DAM_WING_ROT', 'STR_FUSE', 'DAM_FUSE', 'STR_LG', 'DAM_LG', 'STR_TAIL', 'DAM_TAIL', 'STR_LGHTS', 'DAM_LGHTS'],
    legendOffset: { x: 20, y: 60 }
  }
};

const initializedHeatmaps = new Set();

export function init_heatmaps(data) {
  let currentData = data;
  initTabs();

    function renderHeatmapForTab(tabId) {
      const config = heatmapConfigs[tabId];
      if (!config) return;

      createHeatmap({
        containerId: `#${tabId}`,
        svgPath: config.svgPath,
        acClass: config.acClass,
        parts: config.parts,
        data: currentData,
        legendOffset: config.legendOffset ?? { x: 20, y: 22 }
      });
        
        // Mark as initialized
        initializedHeatmaps.add(tabId);
        console.log(`Heatmap initialized for: ${tabId}`);
      }

    const radioInputs = document.querySelectorAll('input[name="aircraft-tab"]');
    
    radioInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const targetTabId = e.target.getAttribute('data-target');
        renderHeatmapForTab(targetTabId);
      });
    });

    const checkedRadio = document.querySelector('input[name="aircraft-tab"]:checked');
    if (checkedRadio) {
      renderHeatmapForTab(checkedRadio.getAttribute('data-target'));
    }
  return {
    update: (filteredData) => {
      currentData = filteredData;
      const activeTab = document.querySelector('input[name="aircraft-tab"]:checked');
      if (activeTab) {
        renderHeatmapForTab(activeTab.getAttribute('data-target'), currentData);
      }
    }
  };
}
