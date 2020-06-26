import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as d3 from 'd3';

export default class TimeSeriesWithThresholdsComponent extends Component {
  // this.args.this.d3Config;
  // this.args.dataToRender;
  internalD3Config;
  seriesIdListing = [];

  @action
  async loadChart() {
    this.internalD3Config = this.args.d3Config;
    this.internalD3Config.height = this.internalD3Config.viewportHeight - this.internalD3Config.margin.top - this.internalD3Config.margin.bottom
    this.internalD3Config.width = this.internalD3Config.viewportWidth - this.internalD3Config.margin.left - this.internalD3Config.margin.right

    const { highTemperatureValueLineData, lowTemperatureValueLineData } = this.buildTemperatureThresholdLines(this.args.dataToRender);

    const svg = this.createSvg(this.internalD3Config.chartElementSelector);

    const xScale = this.xScaleGenerator(d3, [].concat(this.args.dataToRender, lowTemperatureValueLineData, highTemperatureValueLineData));
    const yScale = this.yScaleGenerator(d3, [].concat(this.args.dataToRender, lowTemperatureValueLineData, highTemperatureValueLineData));
    this.createXandYaxis(svg, xScale, yScale);

    this.renderScatterPlotData(svg, xScale, yScale, this.args.dataToRender);

    this.renderTemperatureThresholdLines(svg, xScale, yScale, highTemperatureValueLineData, lowTemperatureValueLineData);

    this.renderAxisLabels(svg);
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

    const highTemperatureValueLineData = [
      {
        seriesId: this.internalD3Config.highTemperatureValueText,
        date: minDate,
        value: this.internalD3Config.highTemperatureValue
      },
      {
        seriesId: this.internalD3Config.highTemperatureValueText,
        date: maxDate,
        value: this.internalD3Config.highTemperatureValue
      }
    ];

    const lowTemperatureValueLineData = [
      {
        seriesId: this.internalD3Config.lowTemperatureValueText,
        date: minDate,
        value: this.internalD3Config.lowTemperatureValue
      },
      {
        seriesId: this.internalD3Config.lowTemperatureValueText,
        date: maxDate,
        value: this.internalD3Config.lowTemperatureValue
      }
    ];
    return { highTemperatureValueLineData, lowTemperatureValueLineData };
  }

  createSvg(cssSelector) {
    return d3.select(cssSelector)
      .append('svg')
      .attr('width', this.internalD3Config.viewportWidth)
      .attr('height', this.internalD3Config.viewportHeight);
  }

  xScaleGenerator(d3, dataSeries) {
    return d3.scaleTime()
      .domain(d3.extent(dataSeries, d => d.date))
      .range([this.internalD3Config.margin.left, this.internalD3Config.viewportWidth - this.internalD3Config.margin.right]);
  }

  yScaleGenerator(d3, dataSeries) {
    return d3.scaleLinear()
      .domain(d3.extent(dataSeries, d => d.value))
      // .domain([0, d3.max(dataSeries, d => d.value)]) // in the event that you want the y axis to start at zero
      .range([this.internalD3Config.viewportHeight - this.internalD3Config.margin.bottom, this.internalD3Config.margin.top]);
  }

  createXandYaxis(svg, xScale, yScale) {
    svg.append('g').call((g) => this.xAxis(d3, g, xScale));
    svg.append('g').call((g) => this.yAxis(d3, g, yScale));
  }

  renderScatterPlotData(svg, xScale, yScale, dataToRender) {
    let seriesNumber = 1;
    this.getSeriesIdListing().forEach(seriesId => {
      const seriesData = dataToRender.filter(d => d.seriesId === seriesId);
      svg.selectAll('whatever')
        .data(seriesData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', this.internalD3Config.elementSize)
        .attr('class', `dot series-${seriesNumber++} ${seriesId}`);
    });
  }

  renderTemperatureThresholdLines(svg, xScale, yScale, highTemperatureValueLineData, lowTemperatureValueLineData) {
    var valueline = d3.line()
      .x(function (d) { return xScale(d.date); })
      .y(function (d) { return yScale(d.value); });

    svg.append('path')
      .datum(highTemperatureValueLineData)
      .attr('class', 'temperature-threshold-line')
      .attr('d', valueline);

    svg.append('path')
      .datum(lowTemperatureValueLineData)
      .attr('class', 'temperature-threshold-line')
      .attr('d', valueline);
  }

  renderAxisLabels(svg) {
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', this.internalD3Config.width / 2)
      .attr('y', this.internalD3Config.height + this.internalD3Config.margin.top + this.internalD3Config.margin.bottom * 0.8)
      .text(this.internalD3Config.xAxisTitle);

    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', this.internalD3Config.margin.left * 0.4)
      .attr('x', -this.internalD3Config.height / 2)
      .text(this.internalD3Config.yAxisTitle);
  }

  getSeriesIdListing() {
    return this.args.dataToRender.reduce((listing, temperatureReading) => {
      if (!listing.includes(temperatureReading.seriesId)) {
        listing.push(temperatureReading.seriesId);
      }
      return listing;
    }, []);
  }

  xAxis(d3, g, xScale) {
    return g.attr('transform', `translate(0,${this.internalD3Config.viewportHeight - this.internalD3Config.margin.bottom})`).call(
      d3
        .axisBottom(xScale)
        .ticks(this.internalD3Config.xAxisTickSize)
        .tickSizeOuter(0)
    );
  }

  yAxis(d3, g, yScale) {
    return g.attr('transform', `translate(${this.internalD3Config.margin.left},0)`).call(
      d3
        .axisLeft(yScale)
        .ticks(this.internalD3Config.yAxisTickSize)
        .tickSizeOuter(0)
    );
  }
}
