import { action } from '@ember/object';
import D3MultipleSeriesOverTime from '../objects/d3-multiple-series-over-time';

export default class TemperaturesOverTimeChartComponent extends D3MultipleSeriesOverTime {
  cssSelectorForSvgInsertion = '.temperatures-over-time-chart';

  @action
  async loadChart() {
    super.didInsertHandler(this.cssSelectorForSvgInsertion, this.args.d3Config, this.args.dataToRender);
  }

  renderData(svg, xScale, yScale) {
    let seriesNumber = 1;
    this.getSeriesIdListing().forEach(seriesId => {
      const seriesData = this.args.dataToRender.filter(d => d.seriesId === seriesId);
      svg.selectAll('whatever')
        .data(seriesData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', this.args.d3Config.elementSize)
        .attr('class', `dot series-${seriesNumber++} ${seriesId}`);
    });
  }

  getSeriesIdListing() {
    return this.args.dataToRender.reduce((listing, temperatureReading) => {
      if (!listing.includes(temperatureReading.seriesId)) {
        listing.push(temperatureReading.seriesId);
      }
      return listing;
    }, []);
  }
}
