(function () {
    'use strict';

    const container = document.getElementById("sliders");

    if (!container) return;

    function createSlider(labelText, min, max, step, id) {
        const wrapper = document.createElement("div");
        wrapper.className = "slider-wrapper";

        const label = document.createElement("label");
        label.innerText = labelText;

        const input = document.createElement("input");
        input.type = "range";
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = min;
        input.id = id;

        const valueDisplay = document.createElement("span");
        valueDisplay.innerText = input.value;

        input.addEventListener("input", () => {
            valueDisplay.innerText = input.value;

            console.log(id, input.value);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        wrapper.appendChild(valueDisplay);

        container.appendChild(wrapper);
    }

    createSlider("Year", 1990, 2023, 1, "year");
    createSlider("Month", 1, 12, 1, "month");

    createSlider("Weather", 0, 5, 1, "weather");
    createSlider("Altitude", 0, 40000, 1000, "altitude");
    createSlider("Phase of Flight", 0, 10, 1, "phase");
    createSlider("Time of Day", 0, 24, 1, "time");
})();