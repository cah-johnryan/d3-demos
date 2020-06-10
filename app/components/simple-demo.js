import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as d3 from "d3";

export default class SimpleDemoComponent extends Component {
  chartHeight = 200;
  chartWidth = 450;

  @action
  async getDataAndLoadChart() {
    let svg = d3.select("#simple-demo-container");

    let x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 450]);

    svg.call(d3.axisBottom(x));

    svg.append("circle")
      .attr("cx", 100).attr("cy", 100).attr("r", 40).style("fill", "blue");
    svg.append("circle")
      .attr("cx", 225).attr("cy", 100).attr("r", 40).style("fill", "red");
    svg.append("circle")
      .attr("cx", 350).attr("cy", 100).attr("r", 40).style("fill", "green");
  }
}
