import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as d3 from "d3";

export default class SimpleDemoComponent extends Component {
  svgHeight = 400;
  svgWidth = 450;

  margin = { top: 10, right: 40, bottom: 30, left: 30 };
  chartHeight = this.svgHeight - this.margin.top - this.margin.bottom;
  chartWidth = this.svgWidth - this.margin.left - this.margin.right;

  @action
  async getDataAndLoadChart() {
    let svg = d3.select("#simple-demo-container")
      .append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    let x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.chartWidth]);

    svg.append('g')
      .attr('transform', `translate(0,${this.chartHeight})`)
      .call(d3.axisBottom(x));

    let y = d3.scaleLinear()
      .domain([0, 100])
      .range([this.chartHeight, 0]);

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.append("circle")
      .attr("cx", 100).attr("cy", 100).attr("r", 40).style("fill", "blue");
    svg.append("circle")
      .attr("cx", 225).attr("cy", 100).attr("r", 40).style("fill", "red");
    svg.append("circle")
      .attr("cx", 350).attr("cy", 100).attr("r", 40).style("fill", "green");
  }
}
