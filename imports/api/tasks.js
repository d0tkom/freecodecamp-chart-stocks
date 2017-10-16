import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
var fetch = require('node-fetch');

export const Tasks = new Mongo.Collection('tasks');

const weekInMilliSeconds = 1000 * 60 * 60 * 24 * 7;
const monthInMilliSeconds = weekInMilliSeconds * 4;
const yearInMilliSeconds = weekInMilliSeconds * 52;

Meteor.methods({
  'tasks.insert'(text) {
    check(text, String);
    
    // check if we already have ticker
    if (Tasks.find({text: text}).count() >= 1) {
        return;
    }
    
    var tasks = Tasks.find({}, { sort: { createdAt: 1 }}).fetch();
    var start_date = '';
    var end_date = '';
    
    // get correct start_date and end_date to have data in sync
    if (tasks.length >= 1) {
      var oldestTask = tasks[0];
      start_date = oldestTask.data.start_date;
      end_date = oldestTask.data.end_date;
    }
    else {
      let unixTime = new Date().getTime();
      let date = new Date(unixTime - yearInMilliSeconds);
      start_date = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    }
    
    var url = 'https://www.quandl.com/api/v3/datasets/WIKI/' + text + '/data.json?' + 
    'api_key=' + process.env.API_KEY + '&column_index=4&order=asc&start_date=' + start_date +
    '&end_date=' + end_date;
    
    fetch(url)
    .then((res) => {
        return res.json()
    }).then((data) => {
        if (data.quandl_error) return;

        var data = data.dataset_data;
        
        text = text.toUpperCase();
        Tasks.insert({
            text,
            createdAt: new Date(),
            data: data
        });
    });
  },
  'tasks.remove'(taskId) {
    check(taskId, String);
 
    Tasks.remove(taskId);
  },
  'tasks.setChecked'(taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);
 
    Tasks.update(taskId, { $set: { checked: setChecked } });
  },
});


