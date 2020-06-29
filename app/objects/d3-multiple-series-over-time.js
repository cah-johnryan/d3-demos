import Component from '@glimmer/component';
import * as d3 from 'd3';

export default class D3MultipleSeriesOverTime extends Component {
  cssSelectorForSvgInsertion = '#d3-multiple-series-overtime';
  d3Config = {
    viewportHeight: 400,
    viewportWidth: 900,
    margin: { top: 30, right: 30, bottom: 50, left: 50 },
    xAxisTitle: 'Date',
    yAxisTitle: 'Temperature (°C)',
    elementSize: 3, // The rendering size of each element plotted
    xAxisTickSize: 16, // The number of ticks to render on the x Axis
    yAxisTickSize: 5, // The number of ticks to render on the y Axis
    startYaxisAtZero: false

    // Optional parameters if threshold lines are desired
    // highThresholdValue: 6,
    // highThresholdValueText: 'High Temperature Value',
    // lowThresholdValue: 2,
    // lowThresholdValueText: 'Low Temperature Value'
  };
  dataToRender = [];


  didInsertHandler(cssSelectorForSvgInsertion, d3Config, dataToRender) {
    if (cssSelectorForSvgInsertion) {
      this.cssSelectorForSvgInsertion = cssSelectorForSvgInsertion;
    }
    this.d3Config = d3Config;
    this.d3Config.height = this.d3Config.viewportHeight - this.d3Config.margin.top - this.d3Config.margin.bottom
    this.d3Config.width = this.d3Config.viewportWidth - this.d3Config.margin.left - this.d3Config.margin.right

    this.dataToRender = dataToRender;
    this.loadD3Chart();
  }

  loadD3Chart() {
    const svg = this.createSvg();

    const { highThresholdValueLineData, lowThresholdValueLineData } = this.buildTemperatureThresholdLines();

    const xScale = this.xScaleGenerator([].concat(this.args.dataToRender, lowThresholdValueLineData, highThresholdValueLineData));
    const yScale = this.yScaleGenerator([].concat(this.args.dataToRender, lowThresholdValueLineData, highThresholdValueLineData));
    this.createXandYaxis(svg, xScale, yScale);

    this.renderData(svg, xScale, yScale);

    this.renderTemperatureThresholdLines(svg, xScale, yScale, highThresholdValueLineData, lowThresholdValueLineData);

    this.renderAxisLabels(svg);
  }

  createSvg() {
    return d3.select(this.cssSelectorForSvgInsertion)
      .append('svg')
      .attr('width', this.d3Config.viewportWidth)
      .attr('height', this.d3Config.viewportHeight);
  }

  buildTemperatureThresholdLines() {
    // TODO: This can be consolidated into a single reduce process
    const minDate = this.args.dataToRender.reduce((currentMinDate, temperatureReading) => {
      currentMinDate = currentMinDate > temperatureReading.date ? temperatureReading.date : currentMinDate;
      return currentMinDate;
    }, this.args.dataToRender[0].date);
    const maxDate = this.args.dataToRender.reduce((currentMaxDate, temperatureReading) => {
      currentMaxDate = currentMaxDate < temperatureReading.date ? temperatureReading.date : currentMaxDate;
      return currentMaxDate;
    }, this.args.dataToRender[0].date);

    const highThresholdValueLineData = !this.d3Config.highThresholdValue ? [] : [
      {
        seriesId: this.d3Config.highThresholdValueText,
        date: minDate,
        value: this.d3Config.highThresholdValue
      },
      {
        seriesId: this.d3Config.highThresholdValueText,
        date: maxDate,
        value: this.d3Config.highThresholdValue
      }
    ];

    const lowThresholdValueLineData = !this.d3Config.lowThresholdValue ? [] : [
      {
        seriesId: this.d3Config.lowThresholdValueText,
        date: minDate,
        value: this.d3Config.lowThresholdValue
      },
      {
        seriesId: this.d3Config.lowThresholdValueText,
        date: maxDate,
        value: this.d3Config.lowThresholdValue
      }
    ];
    return { highThresholdValueLineData, lowThresholdValueLineData };
  }

  xScaleGenerator(dataSeries) {
    return d3.scaleTime()
      .domain(d3.extent(dataSeries, d => d.date))
      .range([this.d3Config.margin.left, this.d3Config.viewportWidth - this.d3Config.margin.right]);
  }

  yScaleGenerator(dataSeries) {
    return d3.scaleLinear()
      .domain(this.d3Config.startYaxisAtZero ? [0, d3.max(dataSeries, d => d.value)] : d3.extent(dataSeries, d => d.value))
      .range([this.d3Config.viewportHeight - this.d3Config.margin.bottom, this.d3Config.margin.top]);
  }

  createXandYaxis(svg, xScale, yScale) {
    svg.append('g').call((g) => this.xAxis(g, xScale));
    svg.append('g').call((g) => this.yAxis(g, yScale));
  }

  xAxis(g, xScale) {
    return g.attr('transform', `translate(0,${this.d3Config.viewportHeight - this.d3Config.margin.bottom})`).call(
      d3
        .axisBottom(xScale)
        .ticks(this.d3Config.xAxisTickSize)
        .tickSizeOuter(0)
    );
  }

  yAxis(g, yScale) {
    return g.attr('transform', `translate(${this.d3Config.margin.left},0)`).call(
      d3
        .axisLeft(yScale)
        .ticks(this.d3Config.yAxisTickSize)
        .tickSizeOuter(0)
    );
  }

  renderData(svg, xScale, yScale) {
    throw new Error('renderData not implemented');
  }

  renderTemperatureThresholdLines(svg, xScale, yScale, highThresholdValueLineData, lowThresholdValueLineData) {
    var valueline = d3.line()
      .x(function (d) { return xScale(d.date); })
      .y(function (d) { return yScale(d.value); });

    if (highThresholdValueLineData.length > 0) {
      svg.append('path')
        .datum(highThresholdValueLineData)
        .attr('class', 'high-value-threshold-line')
        .attr('d', valueline);
    }

    if (lowThresholdValueLineData.length > 0) {
      svg.append('path')
        .datum(lowThresholdValueLineData)
        .attr('class', 'low-value-threshold-line')
        .attr('d', valueline);
    }
  }

  renderAxisLabels(svg) {
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', this.d3Config.margin.left + this.d3Config.width / 2)
      .attr('y', this.d3Config.height + this.d3Config.margin.top + this.d3Config.margin.bottom * 0.8)
      .text(this.d3Config.xAxisTitle);

    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', this.d3Config.margin.left * 0.4)
      .attr('x', -this.d3Config.height / 2 + this.d3Config.margin.bottom)
      .text(this.d3Config.yAxisTitle);
  }
}
