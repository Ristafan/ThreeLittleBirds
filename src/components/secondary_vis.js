// createHeatmap.js
import * as d3 from 'd3';

// ─── 1. MAPPINGS & FIELD DEFINITIONS ─────────────────────────────────────────

const PART_LABELS = {
  STR_RAD:      "Radome",
  STR_WINDSHLD: "Windshield",
  STR_ENG1:     "Engine 1",
  STR_ENG2:     "Engine 2",
  STR_ENG3:     "Engine 3",
  STR_ENG4:     "Engine 4",
  STR_PROP:     "Propeller",
  STR_WING_ROT: "Wing / Rotor",
  STR_FUSE:     "Fuselage",
  STR_LG:       "Landing Gear",
  STR_TAIL:     "Tail",
  STR_LGHTS:    "Lights",
  STR_NOSE:     "Nose",
  STR_OTHER:    "Other",
};

/** Maps any DAM_* or ING_* key back to its SVG element (STR_* key). */
function toSvgKey(partKey) {
  return partKey.replace(/^(DAM|ING)_/, "STR_");
}

/** Returns true if a key represents a strike event. */
const isStrike  = key => key.startsWith("STR_");
/** Returns true if a key represents a damage event. */
const isDamage  = key => key.startsWith("DAM_");

const COST_FIELDS = [
  { key: "COST_OTHER_INFL_ADJ", label: "Total costs (inflation-adj.)", format: "currency" },
  { key: "NR_INJURIES",         label: "Injuries",                     format: "number"   },
  { key: "NR_FATALITIES",       label: "Fatalities",                   format: "number"   },
];

// ─── 2. DATA SETUP ────────────────────────────────────────────────────────────

/**
 * Filters the dataset by aircraft class and aggregates per SVG-part statistics.
 * Groups DAM_* and ING_* counts back onto their STR_* svg key.
 * Returns a plain object keyed by SVG part ID (STR_*).
 */
function setupData(data, acClass, parts) {
  const filteredData = data.filter(d => acClass.includes(d.AC_CLASS));

  const sumField = (rows, field) =>
    d3.sum(rows, d => (+d[field] || 0));

  const countRows = (field) =>
    filteredData.filter(d => {
      const val = String(d[field]).trim().toUpperCase();
      return val === "TRUE" || val === "1";
    }).length;

  // Derive the unique SVG keys (STR_*) from the parts list
  const svgKeys = [...new Set(parts.map(toSvgKey))];

  const partStats = {};
  svgKeys.forEach(svgKey => {
    // Find which parts in the config map to this svg element
    const relatedParts = parts.filter(p => toSvgKey(p) === svgKey);
    const strikeParts  = relatedParts.filter(isStrike);
    const damageParts  = relatedParts.filter(isDamage);

    const strikes = strikeParts.reduce((sum, p) => sum + countRows(p), 0);
    const damages = damageParts.reduce((sum, p) => sum + countRows(p), 0);

    // Cost/casualty fields are aggregated over the strike rows (primary event)
    const strikeRows = strikeParts.flatMap(p =>
      filteredData.filter(d => {
        const val = String(d[p]).trim().toUpperCase();
        return val === "TRUE" || val === "1";
      })
    );

    const stats = { strikes, damages, total: strikes + damages };
    COST_FIELDS.forEach(({ key }) => {
      stats[key] = sumField(strikeRows, key);
    });

    partStats[svgKey] = stats;
  });

  return partStats;
}

// ─── 3. HEATMAP ───────────────────────────────────────────────────────────────

function renderHeatmap(wrapper, svgPath, partStats, acClass, onPartHover) {
  return d3.xml(svgPath).then(xml => {
    const importedNode = document.importNode(xml.documentElement, true);
    const svg = d3.select(importedNode);

    const originalWidth  = svg.attr("width")  || 800;
    const originalHeight = svg.attr("height") || 800;

    if (!svg.attr("viewBox")) {
      svg.attr("viewBox", `0 0 ${originalWidth} ${originalHeight}`);
    }

    svg.attr("width", null)
       .attr("height", null)
       .attr("preserveAspectRatio", "xMidYMid meet")
       .style("width", "100%")
       .style("height", "100%");

    wrapper.node().appendChild(importedNode);

    // Color scale is based on combined strikes + damages
    const maxTotal = d3.max(Object.values(partStats), d => d.total) || 1;
    const colorScale = d3.scaleSequential()
      .domain([0, maxTotal])
      .interpolator(d3.interpolateYlOrRd);

    Object.entries(partStats).forEach(([svgKey, stats]) => {
      const el = svg.select(`#${svgKey}`);
      if (el.empty()) return;

      el.transition()
        .duration(1000)
        .style("fill", stats.total > 0 ? colorScale(stats.total) : "#e0e0e0")
        .style("stroke", "#333")
        .style("stroke-width", "1px");

      el.attr("cursor", "pointer")
        .on("mouseover",  (event) => onPartHover.show(event, svgKey, stats))
        .on("mousemove",  (event) => onPartHover.move(event))
        .on("mouseout",   ()      => onPartHover.hide())
        .on("mouseover.stroke", function() {
          d3.select(this).style("stroke-width", "3px");
        })
        .on("mouseout.stroke", function() {
          d3.select(this).style("stroke-width", "1px");
        });
    });

    // Gradient legend
    const gradientId = `gradient-${Array.isArray(acClass) ? acClass.join("-") : acClass}`;
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient").attr("id", gradientId);

    linearGradient.selectAll("stop")
      .data(d3.range(0, 1.1, 0.1))
      .enter().append("stop")
      .attr("offset", d => `${d * 100}%`)
      .attr("stop-color", d => d3.interpolateYlOrRd(d));

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20, 22)");

    legend.append("rect")
      .attr("width", 150).attr("height", 15)
      .style("fill", `url(#${gradientId})`)
      .style("stroke", "#333");

    legend.append("text").attr("y", 30).style("font-size", "12px").text("0");
    legend.append("text").attr("x", 150).attr("y", 30).attr("text-anchor", "end")
      .style("font-size", "12px").text(`${maxTotal.toLocaleString()}`);
    legend.append("text").attr("y", -10).style("font-weight", "bold")
      .text("Strike/Damage Intensity");

    return svg;
  });
}

// ─── 4. TOOLTIP ───────────────────────────────────────────────────────────────

const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 0
});
const fmtNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2
});

function setupTooltip() {
  let tooltip = d3.select("body").select(".heatmap-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("class", "heatmap-tooltip");
  }

  function buildTooltipHTML(svgKey, stats) {
    const partLabel = PART_LABELS[svgKey] ?? svgKey;

    let html = `<div class="tooltip-title">${partLabel}</div>`;
    html += `<div class="tooltip-strikes">Total strikes: <strong>${stats.strikes.toLocaleString()}</strong></div>`;
    html += `<div class="tooltip-strikes">Total damage: <strong>${stats.damages.toLocaleString()}</strong></div>`;
    html += `<div class="tooltip-section-label">Totals (from strikes)</div>`;

    COST_FIELDS.forEach(({ key, label, format }) => {
      const val = stats[key];
      const formatted = format === "currency"
        ? fmtCurrency.format(val)
        : fmtNumber.format(val);
      html += `<div class="tooltip-row">${label}: <strong>${formatted}</strong></div>`;
    });

    return html;
  }

  return {
    show(event, svgKey, stats) {
      tooltip
        .html(buildTooltipHTML(svgKey, stats))
        .style("visibility", "visible")
        .style("top",  (event.pageY + 15) + "px")
        .style("left", (event.pageX + 15) + "px");
    },
    move(event) {
      tooltip
        .style("top",  (event.pageY + 15) + "px")
        .style("left", (event.pageX + 15) + "px");
    },
    hide() {
      tooltip.style("visibility", "hidden");
    },
  };
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * @param {Object} config
 * @param {string} config.containerId - The ID of the tab (e.g., "#Airplane")
 * @param {string} config.svgPath     - Path to the SVG file
 * @param {string} config.acClass     - The AC_CLASS filter (e.g., "A", "H")
 * @param {Array}  config.parts       - Array of part IDs (STR_*, DAM_*, ING_*)
 * @param {Array}  config.data        - The loaded CSV data
 */
export function createHeatmap(config) {
  const { containerId, svgPath, acClass, parts, data } = config;
  const container = d3.select(containerId);
  container.selectAll("*").remove();

  const layout = container.append("div").attr("class", "heatmap-layout");
  const blueprintWrapper = layout.append("div").attr("class", "blueprint-wrapper");

  const partStats = setupData(data, acClass, parts);
  const tooltipHandlers = setupTooltip();

  renderHeatmap(blueprintWrapper, svgPath, partStats, acClass, tooltipHandlers);
}   