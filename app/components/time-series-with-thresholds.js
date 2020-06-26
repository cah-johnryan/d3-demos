import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as d3 from 'd3';
import * as moment from 'moment';

export default class TimeSeriesWithThresholdsComponent extends Component {
  d3Config = {
    viewportHeight: 400,
    viewportWidth: 900,
    margin: { top: 30, right: 30, bottom: 50, left: 50 },
    xAxisTitle: 'Date',
    yAxisTitle: 'Temperature',
    elementSize: 3,
    xAxisTickSize: 16,
    yAxisTickSize: 5,
    highTemperatureValue: 3,
    highTemperatureValueText: 'High Temperature Value',
    lowTemperatureValue: 1,
    lowTemperatureValueText: 'Low Temperature Value'
  };

  dataConfig = {
    'TemperatureA': {
    },
    'TemperatureB': {
    },
  }

  constructor() {
    super(...arguments);
    this.d3Config.height = this.d3Config.viewportHeight - this.d3Config.margin.top - this.d3Config.margin.bottom
    this.d3Config.width = this.d3Config.viewportWidth - this.d3Config.margin.left - this.d3Config.margin.right
  }

  @action
  async getDataAndLoadChart() {
    let dataToRender = [];

    const seedTime = moment();
    for (const seriesId of Object.keys(this.dataConfig)) {
      let fakeTimeSeries = this.generateFakeTimeSeries(seriesId, seedTime.clone());
      dataToRender.push(...fakeTimeSeries);
    }

    const { highTemperatureValueLine, lowTemperatureValueLine } = this.buildTemperatureThresholdLines(dataToRender);

    const svg = this.createSvg('#time-series-with-thresholds-container');

    const xScale = this.xScaleGenerator(d3, this.d3Config, [].concat(dataToRender, lowTemperatureValueLine, highTemperatureValueLine));
    const yScale = this.yScaleGenerator(d3, this.d3Config, [].concat(dataToRender, lowTemperatureValueLine, highTemperatureValueLine));
    this.createXandYaxis(svg, xScale, yScale);

    this.renderScatterPlotData(svg, dataToRender, xScale, yScale);

    this.renderTemperatureThresholdLines(svg, xScale, yScale, highTemperatureValueLine, lowTemperatureValueLine);

    this.renderAxisLabels(svg);
  }

  renderTemperatureThresholdLines(svg, xScale, yScale, highTemperatureValueLine, lowTemperatureValueLine) {
    var valueline = d3.line()
      .x(function (d) { return xScale(d.date); })
      .y(function (d) { return yScale(d.value); });

    svg.append('path')
      .datum(highTemperatureValueLine)
      .attr('class', 'temperature-threshold-line')
      .attr('d', valueline);

    svg.append('path')
      .datum(lowTemperatureValueLine)
      .attr('class', 'temperature-threshold-line')
      .attr('d', valueline);
  }

  buildTemperatureThresholdLines(dataToRender) {
    const minDate = dataToRender.reduce((currentMinDate, temperatureReading) => {
      currentMinDate = currentMinDate > temperatureReading.date ? temperatureReading.date : currentMinDate;
      return currentMinDate;
    }, dataToRender[0].date);
    const maxDate = dataToRender.reduce((currentMaxDate, temperatureReading) => {
      currentMaxDate = currentMaxDate < temperatureReading.date ? temperatureReading.date : currentMaxDate;
      return currentMaxDate;
    }, dataToRender[0].date);

    const highTemperatureValueLine = [
      {
        seriesId: this.d3Config.highTemperatureValueText,
        date: minDate,
        value: this.d3Config.highTemperatureValue
      },
      {
        seriesId: this.d3Config.highTemperatureValueText,
        date: maxDate,
        value: this.d3Config.highTemperatureValue
      }
    ];

    const lowTemperatureValueLine = [
      {
        seriesId: this.d3Config.lowTemperatureValueText,
        date: minDate,
        value: this.d3Config.lowTemperatureValue
      },
      {
        seriesId: this.d3Config.lowTemperatureValueText,
        date: maxDate,
        value: this.d3Config.lowTemperatureValue
      }
    ];
    return { highTemperatureValueLine, lowTemperatureValueLine };
  }

  xScaleGenerator(d3, d3Config, dataSeries) {
    return d3.scaleTime()
      .domain(d3.extent(dataSeries, d => d.date))
      .range([d3Config.margin.left, d3Config.viewportWidth - d3Config.margin.right]);
  }

  yScaleGenerator(d3, d3Config, dataSeries) {
    return d3.scaleLinear()
      .domain(d3.extent(dataSeries, d => d.value))
      .range([d3Config.viewportHeight - d3Config.margin.bottom, d3Config.margin.top]);
  }

  xAxis(d3, d3Config, g, xScale) {
    return g.attr('transform', `translate(0,${d3Config.viewportHeight - d3Config.margin.bottom})`).call(
      d3
        .axisBottom(xScale)
        .ticks(d3Config.xAxisTickSize)
        .tickSizeOuter(0)
    );
  }

  yAxis(d3, d3Config, g, yScale) {
    return g.attr('transform', `translate(${d3Config.margin.left},0)`).call(
      d3
        .axisLeft(yScale)
        .ticks(d3Config.yAxisTickSize)
        .tickSizeOuter(0)
    );
  }

  renderAxisLabels(svg) {
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', this.d3Config.width / 2)
      .attr('y', this.d3Config.height + this.d3Config.margin.top + this.d3Config.margin.bottom * 0.8)
      .text(this.d3Config.xAxisTitle);

    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', this.d3Config.margin.left * 0.4)
      .attr('x', -this.d3Config.height / 2)
      .text(this.d3Config.yAxisTitle);
  }

  renderScatterPlotData(svg, dataToRender, xScale, yScale) {
    let seriesNumber = 1;
    for (const [seriesId, seriesConfig] of Object.entries(this.dataConfig)) {
      const seriesData = dataToRender.filter(d => d.seriesId === seriesId);
      svg.selectAll('whatever')
        .data(seriesData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', this.d3Config.elementSize)
        .attr('class', `dot series-${seriesNumber++} ${seriesId}`);
    }
  }

  createXandYaxis(svg, xScale, yScale) {
    svg.append('g').call((g) => this.xAxis(d3, this.d3Config, g, xScale));
    svg.append('g').call((g) => this.yAxis(d3, this.d3Config, g, yScale));
  }

  createSvg(cssSelector) {
    return d3.select(cssSelector)
      .append('svg')
      .attr('width', this.d3Config.viewportWidth)
      .attr('height', this.d3Config.viewportHeight);
  }

  generateFakeTimeSeries(seriesId, seedTime) {
    let data = [];
    let d = seedTime;
    for (let i = 0, v = 2; i < 48; ++i) {
      v += Math.random() - 0.5;
      v = Math.max(Math.min(v, 4), 0);
      data.push({
        seriesId: seriesId,
        date: d.toDate(),
        value: v
      });

      d = d.add(-1, 'hour');
    }
    return data;
  }
}
