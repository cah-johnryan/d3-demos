import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as d3 from "d3";
import * as moment from "moment";

// https://observablehq.com/@sdaas/d3-timeseries
// https://observablehq.com/@mbostock/global-temperature-trends
export default class SimpleTimeSeriesComponent extends Component {
  d3Config = {
    viewportHeight: 400,
    viewportWidth: 900,
    margin: { top: 30, right: 30, bottom: 30, left: 30 }
  };

  constructor() {
    super(...arguments);
    this.d3Config.height = this.d3Config.viewportHeight - this.d3Config.margin.top - this.d3Config.margin.bottom
    this.d3Config.width = this.d3Config.viewportWidth - this.d3Config.margin.left - this.d3Config.margin.right
  }

  xMapperGenerator(d3, d3Config, dataSeries) {
    return d3.scaleTime()
      .domain(d3.extent(dataSeries, d => d.date))
      .range([d3Config.margin.left, d3Config.viewportWidth - d3Config.margin.right]);
  }

  xAxis(d3, d3Config, g, xMapper) {
    return g.attr("transform", `translate(0,${d3Config.viewportHeight - d3Config.margin.bottom})`).call(
      d3
        .axisBottom(xMapper)
        .ticks(10)
        .tickSizeOuter(0)
    );
  }

  yMapperGenerator(d3, d3Config, dataSeries) {
    return d3.scaleLinear()
      .domain(d3.extent(dataSeries, d => d.value))
      .range([d3Config.viewportHeight - d3Config.margin.bottom, d3Config.margin.top]);
  }

  yAxis(d3, d3Config, g, yMapper) {
    return g.attr("transform", `translate(${d3Config.margin.left},0)`).call(
      d3
        .axisLeft(yMapper)
        .ticks(5)
        .tickSizeOuter(0)
    );
  }

  @action
  async getDataAndLoadChart() {

    // Create fake data
    // let data = [{ x: 10, y: 20 }, { x: 40, y: 90 }, { x: 80, y: 50 }]
    const seedTime = moment();
    const dataSeries1 = this.generateFakeTimeSeries(seedTime);

    const svg = d3.select("#simple-time-series-container")
      .append('svg')
      .attr('width', this.d3Config.viewportWidth)
      .attr('height', this.d3Config.viewportHeight);

    const xMapper = this.xMapperGenerator(d3, this.d3Config, dataSeries1);
    const yMapper = this.yMapperGenerator(d3, this.d3Config, dataSeries1);

    svg.selectAll('whatever')
      .data(dataSeries1)
      .enter()
      .append('circle')
      .attr('cx', (d => xMapper(d.date)))
      .attr('cy', (d => yMapper(d.value)))
      .attr('r', 3);

    svg.append('g').call((g) => this.xAxis(d3, this.d3Config, g, xMapper));
    svg.append('g').call((g) => this.yAxis(d3, this.d3Config, g, yMapper));
  }

  generateFakeTimeSeries(seedTime) {
    const data = [];
    let d = seedTime;
    for (let i = 0, v = 2; i < 48; ++i) {
      v += Math.random() - 0.5;
      v = Math.max(Math.min(v, 4), 0);
      data.push({
        date: d.toDate(),
        value: v
      });

      d = d.add(-1, 'hour');
    }
    return data;
  }
}
