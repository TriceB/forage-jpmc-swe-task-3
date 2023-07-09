import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;
    // track the upper and lower bounds between the 2 stocks and alert when the bounds are crossed
    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      // create a continuous line graph
      elem.setAttribute('view', 'y_line');
      // define the x_axis to map data points based on the timestamps
      elem.setAttribute('row-pivots', '["timestamp"]');
      // define which data points to track. ensure ratio, lower and upper bound and trigger_alert are tracked on the y_axis
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      // prevents the graph from displaying duplicate data. identify unique data if timestamp exists. If there are duplicates, average the duplicates so only 1 is shown
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([DataManipulator.generateRow(this.props.data),] as unknown as TableData);
    }
  }
}

export default Graph;
