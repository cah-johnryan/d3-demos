import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as d3 from "d3";

export default class MultiLineChartComponent extends Component {
  data = { y: "% Unemployment", series: Array(45), dates: Array(166) };
  chart;
  height = 600;
  width = 600;
  margin = ({ top: 20, right: 20, bottom: 30, left: 30 });

  @action
  async getDataAndLoadChart() {
    await this.setupData();
    this.createChart();
  }

  async setupData() {
    let response = await fetch('http://localhost:4200/multi-line-chart/unemployment.tsv');
    let responseData = await response.text();
    const data = d3.tsvParse(responseData);
    const columns = data.columns.slice(1);
    this.data = {
      y: "% Unemployment",
      series: data.map(d => ({
        name: d.name.replace(/, ([\w-]+).*/, " $1"),
        values: columns.map(k => +d[k])
      })),
      dates: columns.map(d3.utcParse("%Y-%m"))
    };
  }

  x() {
    return d3.scaleUtc()
      .domain(d3.extent(this.data.dates))
      .range([this.margin.left, this.width - this.margin.right]);
  }

  xAxis(g) {
    g.attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.x).ticks(this.width / 80).tickSizeOuter(0));
  }

  y() {
    return d3.scaleLinear()
      .domain([0, d3.max(this.data.series, d => d3.max(d.values))]).nice()
      .range([this.height - this.margin.bottom, this.margin.top])
  }

  yAxis(g) {
    g.attr("transform", `translate(${this.margin.left},0)`)
      .call(d3.axisLeft(this.y))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(this.data.y));
  }

  line() {
    return d3.line()
      .defined(d => !isNaN(d))
      .x((d, i) => this.x(this.data.dates[i]))
      .y(d => this.y(d));
  }

  hover(svg, path) {
    if ("ontouchstart" in document) svg
      .style("-webkit-tap-highlight-color", "transparent")
      .on("touchmove", moved)
      .on("touchstart", entered)
      .on("touchend", left)
    else svg
      .on("mousemove", moved)
      .on("mouseenter", entered)
      .on("mouseleave", left);

    const dot = svg.append("g")
      .attr("display", "none");

    dot.append("circle")
      .attr("r", 2.5);

    dot.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("y", -8);

    function moved() {
      d3.event.preventDefault();
      const mouse = d3.mouse(this);
      const xm = this.x.invert(mouse[0]);
      const ym = this.y.invert(mouse[1]);
      const i1 = d3.bisectLeft(this.data.dates, xm, 1);
      const i0 = i1 - 1;
      const i = xm - this.data.dates[i0] > this.data.dates[i1] - xm ? i1 : i0;
      const s = d3.least(this.data.series, d => Math.abs(d.values[i] - ym));
      path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
      dot.attr("transform", `translate(${this.x(this.data.dates[i])},${this.y(s.values[i])})`);
      dot.select("text").text(s.name);
    }

    function entered() {
      path.style("mix-blend-mode", null).attr("stroke", "#ddd");
      dot.attr("display", null);
    }

    function left() {
      path.style("mix-blend-mode", "multiply").attr("stroke", null);
      dot.attr("display", "none");
    }
  }

  createChart() {
    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, this.width, this.height])
      .style("overflow", "visible");

    svg.append("g")
      .call(this.xAxis);

    svg.append("g")
      .call(this.yAxis);

    const path = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .selectAll("path")
      .data(this.data.series)
      .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("d", d => this.line(d.values));

    svg.call(this.hover, path);

    return svg.node();
  }
}
