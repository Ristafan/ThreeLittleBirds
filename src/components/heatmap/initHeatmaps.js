import { createHeatmap } from "../secondary_vis";
import { initTabs } from "./initTabs";

const heatmapConfigs = {
  "Airplane": {
    svgPath: "/data/images/airplane.svg",
    acClass: ["A"],
    parts: ['STR_RAD', 'DAM_RAD', 'STR_WINDSHLD', 'DAM_WINDSHLD', 'STR_NOSE', 'DAM_NOSE', 'STR_ENG1', 'DAM_ENG1', 'STR_ENG2', 'DAM_ENG2', 'STR_ENG3', 'DAM_ENG3', 'STR_ENG4', 'DAM_ENG4', 'STR_PROP', 'DAM_PROP', 'STR_WING_ROT', 'DAM_WING_ROT', 'STR_FUSE', 'DAM_FUSE', 'STR_LG', 'DAM_LG', 'STR_TAIL', 'DAM_TAIL', 'STR_LGHTS', 'DAM_LGHTS']
  },
  "Helicopter": {
    svgPath: "/data/images/helicopter.svg",
    acClass: ["B"],
    parts: ['STR_RAD', 'DAM_RAD', 'STR_WINDSHLD', 'DAM_WINDSHLD', 'STR_NOSE', 'DAM_NOSE', 'STR_ENG1', 'DAM_ENG1', 'STR_ENG2', 'DAM_ENG2', 'STR_ENG3', 'DAM_ENG3', 'STR_ENG4', 'DAM_ENG4', 'STR_PROP', 'DAM_PROP', 'STR_WING_ROT', 'DAM_WING_ROT', 'STR_FUSE', 'DAM_FUSE', 'STR_LG', 'DAM_LG', 'STR_TAIL', 'DAM_TAIL', 'STR_LGHTS', 'DAM_LGHTS']
  },
  "Other": {
    svgPath: "/data/images/other.svg",
    acClass: ["C", "D", "F", "I", "J", "Y", "Z"],
    parts: ['STR_RAD', 'DAM_RAD', 'STR_WINDSHLD', 'DAM_WINDSHLD', 'STR_NOSE', 'DAM_NOSE', 'STR_ENG1', 'DAM_ENG1', 'STR_ENG2', 'DAM_ENG2', 'STR_ENG3', 'DAM_ENG3', 'STR_ENG4', 'DAM_ENG4', 'STR_PROP', 'DAM_PROP', 'STR_WING_ROT', 'DAM_WING_ROT', 'STR_FUSE', 'DAM_FUSE', 'STR_LG', 'DAM_LG', 'STR_TAIL', 'DAM_TAIL', 'STR_LGHTS', 'DAM_LGHTS']
  }
};

// Track which heatmaps have already been initialized to avoid redundant re-renders
const initializedHeatmaps = new Set();

export function init_heatmaps(data) {
  let currentData = data;
  initTabs();

    // Helper to render a specific tab's heatmap
    function renderHeatmapForTab(tabId) {
      const config = heatmapConfigs[tabId];
      if (!config) return;

      // always re-render with new data, remove initialized guard for updates
      createHeatmap({
        containerId: `#${tabId}`,
        svgPath: config.svgPath,
        acClass: config.acClass,
        parts: config.parts,
        data: currentData
      });
        
        // Mark as initialized
        initializedHeatmaps.add(tabId);
        console.log(`Heatmap initialized for: ${tabId}`);
      }

    // Add Event Listeners to radio buttons
    const radioInputs = document.querySelectorAll('input[name="aircraft-tab"]');
    
    radioInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const targetTabId = e.target.getAttribute('data-target');
        renderHeatmapForTab(targetTabId);
      });
    });

    // Initial Check: Render the tab that is checked by default on page load
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