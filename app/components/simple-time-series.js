import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as d3 from "d3";

export default class SimpleTimeSeriesComponent extends Component {
  svgHeight = 400;
  svgWidth = 450;

  margin = { top: 10, right: 40, bottom: 30, left: 30 };
  chartHeight = this.svgHeight - this.margin.top - this.margin.bottom;
  chartWidth = this.svgWidth - this.margin.left - this.margin.right;

  @action
  async getDataAndLoadChart() {
    let svg = d3.select("#simple-time-series-container")
      .append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight);

    // set a margin around the chart for the axis rulers to sit
    svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // set up the x axis
    let x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.chartWidth]);

    svg.append('g')
      .attr('transform', `translate(0,${this.chartHeight})`)
      .call(d3.axisBottom(x));

    // set up the y axis
    let y = d3.scaleLinear()
      .domain([0, 100])
      .range([this.chartHeight, 0]);

    svg.append('g')
      .call(d3.axisLeft(y));

    // Create fake data
    let data = [{ x: 10, y: 20 }, { x: 40, y: 90 }, { x: 80, y: 50 }]

    svg.selectAll('whatever')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d => x(d.x)))
      .attr('cy', (d => y(d.y)))
      .attr('r', 3);
  }
}
