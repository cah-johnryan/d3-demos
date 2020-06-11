import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as d3 from "d3";
import * as moment from "moment";

// https://observablehq.com/@sdaas/d3-timeseries
// https://observablehq.com/@mbostock/global-temperature-trends
export default class SimpleTimeSeriesComponent extends Component {
  viewportHeight = 400;
  viewportWidth = 450;

  margin = { top: 10, right: 40, bottom: 30, left: 30 };
  height = this.viewportHeight - this.margin.top - this.margin.bottom;
  width = this.viewportWidth - this.margin.left - this.margin.right;

  @action
  async getDataAndLoadChart() {
    let svg = d3.select("#simple-time-series-container")
      .append('svg')
      .attr('width', this.viewportWidth)
      .attr('height', this.viewportHeight);

    // set a margin around the chart for the axis rulers to sit
    svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // set up the x axis
    let x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.width]);

    svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x));

    // set up the y axis
    let y = d3.scaleLinear()
      .domain([0, 100])
      .range([this.height, 0]);

    svg.append('g')
      .call(d3.axisLeft(y));

    // Create fake data
    // let data = [{ x: 10, y: 20 }, { x: 40, y: 90 }, { x: 80, y: 50 }]
    let data = this.generateFakeTimeSeries();

    svg.selectAll('whatever')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d => x(d.date)))
      .attr('cy', (d => y(d.value)))
      .attr('r', 3);
  }

  generateFakeTimeSeries() {
    const data = [];
    let d = moment();
    for (let i = 0, v = 2; i < 60; ++i) {
      v += Math.random() - 0.5;
      v = Math.max(Math.min(v, 4), 0);
      data.push({
        date: d.toDate(),
        value: v
      });

      d = d.add(1, 'hour');
    }
    return data;
  }
}
