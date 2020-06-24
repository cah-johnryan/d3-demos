import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as d3 from 'd3';
import * as moment from 'moment';

export default class MultipleTimeSeriesComponent extends Component {
  d3Config = {
    viewportHeight: 400,
    viewportWidth: 900,
    margin: { top: 30, right: 30, bottom: 50, left: 50 }
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
    return g.attr('transform', `translate(0,${d3Config.viewportHeight - d3Config.margin.bottom})`).call(
      d3
        .axisBottom(xMapper)
        .ticks(16)
        .tickSizeOuter(0)
    );
  }

  yMapperGenerator(d3, d3Config, dataSeries) {
    return d3.scaleLinear()
      .domain(d3.extent(dataSeries, d => d.value))
      .range([d3Config.viewportHeight - d3Config.margin.bottom, d3Config.margin.top]);
  }

  yAxis(d3, d3Config, g, yMapper) {
    return g.attr('transform', `translate(${d3Config.margin.left},0)`).call(
      d3
        .axisLeft(yMapper)
        .ticks(5)
        .tickSizeOuter(0)
    );
  }

  @action
  async getDataAndLoadChart() {
    const seedTime = moment();
    const dataToRender = [];
    const dataSeries1 = this.generateFakeTimeSeries(seedTime.clone());
    const dataSeries2 = this.generateFakeTimeSeries(seedTime.clone());
    dataToRender.push(dataSeries1);
    dataToRender.push(dataSeries2);

    const svg = d3.select('#multiple-time-series-container')
      .append('svg')
      .attr('width', this.d3Config.viewportWidth)
      .attr('height', this.d3Config.viewportHeight)

    const xMapper = this.xMapperGenerator(d3, this.d3Config, [].concat(dataSeries1, dataSeries2));
    const yMapper = this.yMapperGenerator(d3, this.d3Config, [].concat(dataSeries1, dataSeries2));

    svg.selectAll('whatever')
      .data(dataSeries1)
      .enter()
      .append('circle')
      .attr('cx', d => xMapper(d.date))
      .attr('cy', d => yMapper(d.value))
      .attr('fill', d3.rgb('black'))
      .attr('r', 3);

    svg.selectAll('whatever')
      .data(dataSeries2)
      .enter()
      .append('circle')
      .attr('cx', d => xMapper(d.date))
      .attr('cy', d => yMapper(d.value))
      .attr('fill', d3.rgb('steelblue'))
      .attr('r', 3);

    svg.append('g').call((g) => this.xAxis(d3, this.d3Config, g, xMapper));
    svg.append('g').call((g) => this.yAxis(d3, this.d3Config, g, yMapper));

    // X axis label:
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', this.d3Config.width / 2)
      .attr('y', this.d3Config.height + this.d3Config.margin.top + this.d3Config.margin.bottom * 0.8)
      .text('Date');

    // Y axis label:
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', this.d3Config.margin.left * 0.4)
      .attr('x', -this.d3Config.height / 2)
      .text('Temperature');
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