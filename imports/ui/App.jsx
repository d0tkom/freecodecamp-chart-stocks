import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data'; 
import PropTypes from 'prop-types';
import { Tasks } from '../api/tasks.js';
import Task from './Task.jsx';
import { Chart } from 'react-google-charts';
 
// App component - represents the whole app
class App extends Component {
  handleSubmit(event) {
    event.preventDefault();
 
    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
 
    Meteor.call('tasks.insert', text);
    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }
  
  renderTasks() {
    return this.props.tasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }
  
    renderChart() {
      if (!this.props.tasks[0]) return "";
      
      let columns= [
        {
          type: 'date',
          label: 'Day',
        }
      ];
      
      let rows = [];
        
      this.props.tasks.map((item) => {
        console.log(item);
        columns.push({type: 'number', label: item.text});
        
        item.data.data.map((dataRow,i ) => {
          if (rows[i]) {
            rows[i].push(dataRow[1]);
          }
          else {
            let newRow = [new Date(dataRow[0]), dataRow[1]];
            rows.push(newRow);
          }
        });
      });
      
      rows = rows.filter((item) => {
        if (item.length == columns.length) {
          return item;
        }
      })
      //data = this.props.tasks[0].data.data;
      //data = [column_names, ...data];
      
      console.log(columns);
      console.log(rows);
      
      return <Chart
          chartType="LineChart"
          rows={rows}
          columns={columns}
          options={{}}
          graph_id="LineChart"
          width="100%"
          height="400px"
          legend_toggle
        />;
    }
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Chart Stocks</h1>
          
          <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
            <input
              type="text"
              ref="textInput"
              placeholder="Type to add new stocks"
            />
          </form>
        </header>
        
        {this.renderChart()}
        
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
};
 
export default createContainer(() => {
  return {
    tasks: Tasks.find({}, { sort: { createdAt: 1 }}).fetch(),
  };
}, App);