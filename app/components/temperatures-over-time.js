import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from "@glimmer/tracking";
import * as moment from 'moment';

export default class TemperaturesOverTimeComponent extends Component {
  d3Config = {
    viewportHeight: 400,
    viewportWidth: 900,
    margin: { top: 30, right: 30, bottom: 50, left: 50 },
    xAxisTitle: 'Date',
    yAxisTitle: 'Temperature (°C)',
    elementSize: 3,
    xAxisTickSize: 16,
    yAxisTickSize: 5,
    highThresholdValue: 6,
    highThresholdValueText: 'High Temperature Value',
    lowThresholdValue: 2,
    lowThresholdValueText: 'Low Temperature Value'
  };
  chartDataToRender = [];
  @tracked isLoadingChartData = true;

  fakeSeriesIds = ['TemperatureA', 'TemperatureB'];

  @action
  async loadChartData() {
    const seedTime = moment();
    this.fakeSeriesIds.forEach(fakeSeriesId => {
      let fakeTimeSeries = this.generateFakeTimeSeries(fakeSeriesId, seedTime.clone());
      this.chartDataToRender.push(...fakeTimeSeries);
    });
    this.isLoadingChartData = false;
  }

  generateFakeTimeSeries(fakeSeriesId, seedTime) {
    let data = [];
    let d = seedTime;
    for (let i = 0, v = 4; i < 48; ++i) {
      v += Math.random() - 0.5;
      v = Math.max(Math.min(v, 8), 0);
      data.push({
        seriesId: fakeSeriesId,
        date: d.toDate(),
        value: v
      });

      d = d.add(-1, 'hour');
    }
    return data;
  }
}
