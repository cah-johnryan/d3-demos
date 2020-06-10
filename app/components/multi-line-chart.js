import Component from '@glimmer/component';
import {action} from '@ember/object';

export default class MultiLineChartComponent extends Component {
  unemploymentData;

  @action
  async createChart() {
    let response = await fetch('http://localhost:4200/multi-line-chart/unemployment.tsv');
    this.unemploymentData = await response.text();

  }

}
