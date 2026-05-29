# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Roxan Jaecklin | 424398 |
| Samuel Waridel | 330169 |
| Martin Fähnrich | 423634 |

## Bird Strike Risk Visualization

This project visualizes FAA bird strike data to better understand how bird activity affects aviation safety. The dataset includes information about where and when strikes occurred, the type of damage caused to aircraft, flight conditions, and other operational details.

To add more context to the analysis, we also incorporated migratory route data for bird species commonly involved in strikes. Combining these datasets makes it possible to explore seasonal and geographic patterns in bird strike risk.

The project is intended to help flight planners, insurance companies, and wildlife conservation groups identify areas and periods with higher strike activity so that better planning and mitigation strategies can be developed.

## Intended usage

### Setup

To set up the project locally, follow the steps provided in the [setup](#setup-1) section.


### The Visualization

When you load the webpage, you will be greeeted by a simple explanation of the project and the datasets that we used. Scroll down to find the section containing the visualizations, or click on the visualizations tab to be taken there directly.


#### The Map

The entry point to our visualization is through the map. On the map you see clusters of bird strikes which represent the "danger zones". You can easily pan around, and zoom in and out using the mouse to adjust the view. The sliders on the right of the map allow you to select the data being displayed. These affect both the map and the subsequent visualizations.

By clicking on a cluster, you can select it and the view will automatically be adjusted as well as the data selection. This allows you to focus on only one "danger zone" and study the effects of this zone precisely. To deselect, simply click outside of any displayed cluster and wait for the data to refresh. This might take a few seconds, so please be patient. We unfortunately did not have the time to properly guard this feature against spam clicking, so if you encounter an issue, simply refresh the page.

On the top left of the map, there is a checkbox that allows you to toggle on and off the bird migration paths. When displayed, each color represents a specific kind of bird. Clicking on the line indicates which bird species the specific flight path corresponds to. Multiple flight paths can be selected at once, and you can deselect them simply by clicking off the lines.

Note: Bird species can sometime share the same flight paths, so overlapping paths add to the intensity on the screen.

#### The Sliders

The sliders are the main selection tool for the user. They filter the data and select only the parts that interest you. These include filter for year, month, time of day; but also categorical filters for weather and others. There is a reset button at the top right of the sliders section to reset them back to the default.

These sliders, along with the cluster selection filter the data for the final two visualizations.

#### Damage Heatmaps

This visualization displays the damage suffered by the aircrafts, and more specifically which parts were damaged. The data being displayed here is the one from the selection that was done through the sliders and the cluster clicks. There are three pannels, the first for airplanes, the second for helicopters, and the third for other types of aircrafts. The color represents the number of strikes on that specific part.

Hovering the mouse over the different sections will give extra information including the number of strikes, how many stikes damaged the aircraft, and the costs both financial and in terms of injuries/fatalities.

#### Barplots

The final visualization is a condensed view of the data in the form of an interactive barplot. The x axis can be adjusted for different temporal scales including year, month, day, time of day, and phase of flight. The y axis can be switched between strike cout and finacial cost. The mean and median are also displalyed and can be toggled on and off. And finally, the whole barchart can be exported as a png with the simple click of a button.

Note: Feel free to click the play button on the bottom right of the screen to hear a custom, home-made, version of Kenny Loggins' "Danger Zone" (We had fun during this project).

## Setup

This project uses Webpack, Babel, and D3.js. To ensure we are all working in the same environment, follow these steps to set up the project locally.

### 1. Prerequisites

Ensure you have Node.js installed (LTS version recommended). This includes npm, our package manager.

You can verify your installation with:

```bash
node -v
npm -v
```

---

## Running with Docker

If you prefer to run the project in a containerized environment, you can use Docker.

### Prerequisites

Make sure Docker is installed and running on your machine.

You can verify your installation with:

```bash
docker --version
```

### Build the Docker Image

From the root of the project, build the Docker image:

```bash
# Build the image with a tag name
docker build -t threelittlebirds:latest .
```

### Run the Docker Container

Start the container and expose the application on port `8080`:

```bash
# Run the container using that tag
docker run -d -p 8080:80 --name birds-app threelittlebirds:latest
```

The application will then be available at:

- http://localhost:8080

### Useful Docker Commands

```bash
# View running containers
docker ps

# Stop the container when you are done
docker stop birds-app
```

---

### 2. Initial Setup

Clone the repository and install the dependencies defined in `package.json`:

```bash
# Clone the repo (replace with your actual SSH/HTTPS link)
git clone https://github.com/com-480-data-visualization/ThreeLittleBirds.git

# Enter the directory
cd ThreeLittleBirds

# Install all libraries (D3, Leaflet, Webpack, etc.)
npm install
```

---

### 3. Local Development

To start the development server with Hot Module Replacement (HMR), run:

```bash
npm start # To run on a specific port you can add "-- --port portnumber"
```

- The site will be available at: http://localhost:8080
- Any changes you save in `src/` will automatically refresh the browser.

---

### 4. Project Structure

- `src/main.js`: The entry point for our JavaScript.
- `src/index.html`: The main HTML template.
- `src/components/`: Place individual visualization logic here.
- `src/assets/`: Store data files (CSV/JSON) here.

---

### 5. Deployment

We use Continuous Deployment via Vercel.

- Do not push to `master` directly.
- Create a feature branch for your work.
- Open a Pull Request (PR). Vercel will generate a preview link for your branch so we can review the visualizations live before merging.

## Extra (Past Milestones)

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2)


### Milestone 1

#### Dataset

The main dataset for this project is the [Federal Aviation Administration (FAA) Aircraft Wildlife Strike Database (1990–2023)](https://www.kaggle.com/datasets/dianaddx/aircraft-wildlife-strikes-1990-2023), available on Kaggle. It documents incidents of wildlife strikes involving aircraft, primarily bird-related events. The dataset originates from a reputable source (FAA) and carries a usability score of 10 on Kaggle, suggesting high-quality and well-maintained data.

Although the dataset is comprehensive—with over 100 columns covering species, aircraft type, flight phase, and location—some preprocessing will be required. The main tasks include handling missing or unknown entries (notably for bird species), addressing outliers in numeric variables, and ensuring consistent formatting of location and date fields. Overall, the data quality is strong, and preprocessing will focus on cleaning rather than extensive transformation.

A complementary dataset, [A Global Dataset of Directional Migration Networks of Migratory Birds](https://figshare.com/articles/dataset/A_global_dataset_of_directional_migration_networks_of_migratory_birds/26162269/3?file=48041545) provides migration path information derived from a systematic review of English and Chinese literature (1993–2023). The data already includes curated GPS coordinates, which will allow comparison with FAA incident locations to explore geographic correlations. Preprocessing will mainly involve filtering relevant species and migration routes and aligning coordinate systems with the FAA dataset.

The main challenge will be integrating these datasets due to potential differences in spatial resolution and taxonomic naming conventions, but overall, both sources are clean and ready for analysis.


#### Problematic

**Topic:**
 Visualizing the Spatial–Temporal “Danger Zone” of Aviation Bird Strikes

**Overview:**
This project explores the intersection of human air travel and natural bird migration. Using FAA wildlife strike data combined with global avian migration routes, we aim to visualize where and when aircraft are most at risk of encountering birds. The central axes of the visualization will be space (geographic location), time (seasonality, year, and flight phase), and flight conditions (altitude and weather).

**Motivation:**
Bird strikes pose both economic and safety threats to aviation, causing significant repair costs and operational disruptions. By overlaying strike incidents with migratory corridors, this project aims to turn historical data into predictive insight — shifting focus from “where strikes happened” to understanding why risk peaks at specific altitudes or seasons.

**Target Audience:**
- Aviation safety officers seeking to anticipate seasonal risks near specific airports.
- Environmental researchers examining how air traffic overlaps with migratory pathways.
- The general public interested in visualizing the shared aerial space between humans and wildlife.


**Analytical Components:**
1. Geospatial correlation: Map overlaps between strike locations and migration routes to identify risk hotspots.
2. Temporal analysis: Examine how strike frequency and severity change across months, years, and airports.
3. Damage profiling: Visualize which aircraft components are most affected and under what flight conditions, offering insights for preventive measures.


#### Exploratory Data Analysis

The exploratiry data analysis has been done in the following notebook: [M1 ThreeLittleBirds](https://colab.research.google.com/drive/1rXPO2LDDgPRk97wf8cLNTDRRA6dTV_iW?usp=sharing)

##### Bird Strikes

The 190 MB CSV contains 288,810 entries across 110 columns. Features include binary damage indicators (e.g., struck vs. damaged parts), geography, aircraft specs, flight conditions (speed/altitude), environmental factors (weather/light), wildlife species, and economic costs.

**Missing Data & Quality**

- Gaps: Cost and fatality columns are largely empty. Height, speed, and distance have significant missing values, requiring reliance on PHASE_OF_FLT for context. Weather and coordinates (~10%) also have gaps.
- Cleaning Needed: Latitude values contain errors (max > 41M) and must be cleaned to the valid $\pm 90$ range.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/images/ColumnsWithMissingData.png)


**Key Statistical Insights**

- Altitude: Strikes are extremely "bottom-heavy"; the median height is 50 ft, while the mean is 865 ft.
- Speed: The average strike occurs at 142 knots, though some occur at 0 knots (parked/taxiing).
- Severity: Out-of-service time (AOS) averages 3 hours, but outliers reach 7+ years, indicating total destruction.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/images/IncidentPerMonth.png)

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/images/IncidentsPerYear.png)

**Notable Trends** 

- Analysis shows a clear seasonal peak in summer and a steady upward trend in reported strikes over the 33-year period.

##### Bird FLight Paths

The complementary dataset contains 42,844 entries across 26 columns. It tracks global avian movement via GPS sensor nodes (Origin, Transit, Wintering) and includes full taxonomic classifications (Order, Family, Genus), English names, and IUCN Red List (2023) conservation statuses.

**Missing Data & Quality**

- High Integrity: The dataset is exceptionally complete, with only the Provinces column missing a negligible 19 values (<0.05%).
- Modern Precision: 75% of the data is from 2010 or later, ensuring that the insights are based on modern, high-resolution satellite telemetry rather than legacy banding methods.

**Key Statistical Insights**

- Geography: While coverage is global (spanning from -83° to +78° latitude), the mean latitude of 29.9°N indicates a significant focus on Northern Hemisphere flyways.
- Timing: Migration is highly bimodal. The Autumn surge (July–September) is the largest movement window, followed by a secondary Spring peak (March–April).
- Conservation: While 85.4% are "Least Concern," nearly 15% of tracked movements involve at-risk species (Vulnerable to Critically Endangered), providing vital data for protected transit nodes.

![alt text](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/images/FrequencyOfMigrationStartsByMonth.png)

**Notable Trends**

The data reveals a massive concentration of activity during the late summer months, identifying a critical temporal window where high bird density and biodiversity risk intersect.


#### Related work


The dataset used in this project originates from the Federal Aviation Administration (FAA) Wildlife Strike Database and contains reports of strikes involving different aircraft since 1990. Because it covers a lot of time and its detailed attributes, the dataset has been widely used for exploratory analysis and visualization projects. Previous work with this dataset has primarily focused on statistical summaries and visualizations. Many analyses explore the frequency of strikes over time, identify the most involved species, or analyze the phases of flight where most incidents happen. Other projects utilize geographic patterns and focus on identifying airports or regions with high numbers of strikes, where the data is often presented using individual charts such as time-series plots, bar charts, or maps highlighting incident hotspots. [Example 1](https://www.kaggle.com/code/dianaddx/aircraft-wildlife-strikes-1990-2023-eda), [Example 2](https://www.kaggle.com/code/justin2028/which-month-has-the-most-bird-airstrikes).

These approaches provide valuable insight, but because they often present information through a series of separate visualizations, navigating through them can make it overwhelming. Especially if you want a comprehensive overview of the data to explore relationships between multiple variables simultaneously. This [report](https://www.faa.gov/airports/airport_safety/wildlife/wildlife-strike-report-1990-2024) from the FAA demonstrates a good example of how overwhelming it can be. Our approach addresses this limitation by proposing a multi-dimensional and interactive visualization that allows users to explore several aspects of the dataset within a single interface. For the design, we drew mostly inspiration from aviation visualization tools such as Flightradar24, which provides a map-based overview of global flight activity. Additionally, heatmaps of frequently affected regions were considered a way to highlight the geographic concentrations of strikes, as well as affected machinery on the plane.  

For the complementary dataset we haven't found any usages as it doesn't have any citations yet. Similar datasets have been used to analyze endagerment of migratory bird species, [Example 3](http://pdf.sciencedirectassets.com/321112/1-s2.0-S2590332222X0002X/1-s2.0-S2590332223003962/main.pdf?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFkaCXVzLWVhc3QtMSJIMEYCIQCXkxX%2FwX79wnCueGMu6UrJ3av0%2FQE9JBgPIbc9Gf1SBwIhAMLSY0ULmzJX3NcVVzig8bYCzyOdufUrpiyctOiNggk0KrMFCCIQBRoMMDU5MDAzNTQ2ODY1IgzN9yWB7iyKmF2Ut2wqkAUYpNeUD7OnwH49NYEN8EFdHYxZCasKYZiVQK2iVbLLra3wYG%2FqBZVLRY53dRgrP6MiChTwL9EV1yK1A7tlHSMlt15yIYmG8KAHPRfj6%2Bq3Ti2GFqIWzW7fn1%2BfCKr2o5ty3PHKLLe8VbU3wH997bCfZJgGOD7Q7Toc6WWQdb9e0pZuromli4nXTJQzwF8RCa4YpwNKxT94OqQtyIFHA2fFpgIcbLNtJ8F45xx7rclKe0G5XFpH0WiY5V7gEc4gvNuathdlXZ6UMnpy3V8pgpooefEDoXefYdi7pLttUb4HTrOgL1Egzd5NU2gPO7bFsOdDsFF%2F0Gf6LRG37hwZq6uPzuOQv1l%2BWmQIc%2FzFAX%2BLc4q7mTwQx2GHNQG%2F483NP2Iof21Etu4s3FUGAUyR%2FTgpZZ0qsfaEwd5MdlJGPjIPhsAWd1kjGcZD7vOl9cg2RlsGL2EHPUWrVh9%2Fsw%2FJ5aaLinwvj0Z66HTgQ0HkKkN47FnipAmNirJNOgEBvaquPq0ZhX22Gvop3y8Q%2B5vIxsqT%2FU8tW700bcBY4f1MBgga%2BabD4DvzIzwFHZC2gyLfl3nS0Ii6bHqDzyCRTKtZPq3TYGX9naL7EWh9Rieb084gpzrRkWlQ5H7tNGumzLGSl8H82Wjh2Fcn8zbcGJQRzE2bYDT1UslZwfdciQ8zsN38QEgUTnR3mn3v3Pveha9pNzxYZVgrrMXspjABWAj%2BukFhE8Viwm9bF8TlK0axHx%2BkZGV2wA%2FLCEGXLm0iXgRRnr8LEk8xINSqWjquvlNpzd3lZtMKyOjaY6WkT4KoU%2Bjy5jFO6a6FTPmQz9d0Gj6cHeks2IGjrrvyUEixqScilCIn4dOfGcPvzaZeSkMlYE4rRzDqyfDNBjqwAeik7xJbNFDCbqSqG9t98%2BUauLy5VPMn4z6TEuy98kwyvA0rNMGASDamkFmKHqfV6ji2qRd6zQwd4pw%2BlHpwLNMxmU6WIz7UmZiBHXqy7sYAHiGDMAgGSbuWteFLLTjTkgQp0wx%2BxeTh41pbFPoA0b7U%2F6eCcAl8GZhU0gL7KlWCa2vQF9lhIlR4qRDWoG6RwchQ0NV84acjQVXDnz7qm02QDo8wApNcXfoBUHBEgAtq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260319T174039Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAQ3PHCVTYSYANV362%2F20260319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=1c95d74728f593f12ac42edf6cb0f22a6f93a23ad039570499c8b30b7609808b&hash=5fb05a482c799f523c3f81a0a284b65e6cf1a7ad06cb02fef74dd19a3c4a0dd9&host=68042c943591013ac2b2430a89b270f6af2c76d8dfd086a07176afe7c76c2c61&pii=S2590332223003962&tid=spdf-d68a2299-1490-4bfd-8b16-e2ca44bc9627&sid=b57967669d872942fc0b3278a92a7e3663c2gxrqb&type=client&tsoh=d3d3LnNjaWVuY2VkaXJlY3QuY29t&rh=d3d3LnNjaWVuY2VkaXJlY3QuY29t&ua=030c5f0b0704565650&rr=9dee43723c323b58&cc=ch), or to analyze different migration patterns and influences of environmental conditions; [Example 4](https://www.kaggle.com/code/sivaramg23/bird-migration-analysis).

### Milestone 2

Google Docs: [M2_Docs](https://docs.google.com/document/d/1uXNUvgiqn1qukKXd6VfytE65qpUvLgwY8Lny9tntYhM/edit?usp=sharing)

PDF: [M2_PDF](https://github.com/com-480-data-visualization/ThreeLittleBirds/blob/master/public/data/M2_ThreeLittleBirds.pdf)

Functional Project Prototype: https://three-little-birds-nine.vercel.app
