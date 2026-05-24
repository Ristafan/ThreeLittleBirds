// createHeatmap.js
import * as d3 from 'd3';

// ─── 1. DATA SETUP ────────────────────────────────────────────────────────────

const COST_FIELDS = [
  { key: "COST_OTHER_INFL_ADJ", label: "Costs", format: "currency" },
  { key: "NR_INJURIES",         label: "Injuries",                     format: "number"   },
  { key: "NR_FATALITIES",       label: "Fatalities",                   format: "number"   },
];

/**
 * Filters the dataset by aircraft class and aggregates per-part strike statistics.
 * Computes strike count and averages for cost/casualty fields.
 * Returns a plain object keyed by part ID.
 */
function setupData(data, acClass, parts) {
  const filteredData = data.filter(d => d.AC_CLASS === acClass);

  const sumField = (rows, field) =>
    d3.sum(rows, d => (+d[field] || 0));

  const partStats = {};
  parts.forEach(part => {
    const partData = filteredData.filter(d => {
      const val = String(d[part]).trim().toUpperCase();
      return val === "TRUE" || val === "1";
    });

    const stats = { strikes: partData.length };

    COST_FIELDS.forEach(({ key }) => {
      stats[key] = sumField(partData, key);
    });

    partStats[part] = stats;
  });

  return partStats;
}

// ─── 2. HEATMAP ───────────────────────────────────────────────────────────────

/**
 * Loads the SVG file, colors each part according to strike intensity,
 * appends the gradient legend, and returns the populated SVG selection.
 */
function renderHeatmap(wrapper, svgPath, parts, partStats, acClass, onPartHover) {
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

    const maxStrikes = d3.max(Object.values(partStats), d => d.strikes) || 1;
    const colorScale = d3.scaleSequential()
      .domain([0, maxStrikes])
      .interpolator(d3.interpolateYlOrRd);

    parts.forEach(part => {
      const stats = partStats[part];
      const el = svg.select(`#${part}`);
      if (el.empty()) return;

      el.transition()
        .duration(1000)
        .style("fill", stats.strikes > 0 ? colorScale(stats.strikes) : "#e0e0e0")
        .style("stroke", "#333")
        .style("stroke-width", "1px");

      el.attr("cursor", "pointer")
        .on("mouseover",  (event) => onPartHover.show(event, part, stats))
        .on("mousemove",  (event) => onPartHover.move(event))
        .on("mouseout",   ()      => onPartHover.hide())
        .on("mouseover.stroke", function() {
          d3.select(this).style("stroke-width", "3px");
        })
        .on("mouseout.stroke", function() {
          d3.select(this).style("stroke-width", "1px");
        });
    });

    // gradient legend
    const gradientId = `gradient-${acClass}`;
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient").attr("id", gradientId);

    linearGradient.selectAll("stop")
      .data(d3.range(0, 1.1, 0.1))
      .enter().append("stop")
      .attr("offset", d => `${d * 100}%`)
      .attr("stop-color", d => d3.interpolateYlOrRd(d));

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20, 35)");

    legend.append("rect")
      .attr("width", 150).attr("height", 15)
      .style("fill", `url(#${gradientId})`)
      .style("stroke", "#333");

    legend.append("text").attr("y", 30).style("font-size", "12px").text("0");
    legend.append("text").attr("x", 150).attr("y", 30).attr("text-anchor", "end")
      .style("font-size", "12px").text(`${maxStrikes.toLocaleString()} Strikes`);
    legend.append("text").attr("y", -10).style("font-weight", "bold")
      .text("Strike Intensity");

    return svg;
  });
}

// ─── 3. TOOLTIP ───────────────────────────────────────────────────────────────

const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 0
});
const fmtNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2
});

/**
 * Creates (or reuses) the floating tooltip element and returns
 * the three interaction handlers expected by renderHeatmap.
 */
function setupTooltip() {
  let tooltip = d3.select("body").select(".heatmap-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("class", "heatmap-tooltip");
  }

  function buildTooltipHTML(part, stats) {
    // Human-readable part label: strip the "STR_" prefix and title-case
    const partLabel = part
      .replace(/^STR_/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());

    let html = `<div class="tooltip-title">${partLabel}</div>`;
    html += `<div class="tooltip-strikes">Total Strikes: <strong>${stats.strikes.toLocaleString()}</strong></div>`;
    html += `<div class="tooltip-section-label">Totals</div>`;

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
    show(event, part, stats) {
      tooltip
        .html(buildTooltipHTML(part, stats))
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
 * @param {Array}  config.parts       - Array of SVG element IDs to color
 * @param {Array}  config.data        - The loaded CSV data
 */
export function createHeatmap(config) {
  const { containerId, svgPath, acClass, parts, data } = config;
  const container = d3.select(containerId);
  container.selectAll("*").remove();

  // ── layout shell ──────────────────────────────────────────────────────────
  const layout = container.append("div").attr("class", "heatmap-layout");
  const blueprintWrapper = layout.append("div").attr("class", "blueprint-wrapper");

  // ── data ──────────────────────────────────────────────────────────────────
  const partStats = setupData(data, acClass, parts);

  // ── tooltip ───────────────────────────────────────────────────────────────
  const tooltipHandlers = setupTooltip();

  // ── heatmap ───────────────────────────────────────────────────────────────
  renderHeatmap(blueprintWrapper, svgPath, parts, partStats, acClass, tooltipHandlers);
}