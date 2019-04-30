/**
 *  task.route.js
 *
 *  Receives a get request at path /task
 *
 *  Establishes connection to Salesforce using session cookie containing accessToken
 *
 *  Queries Salesforce for a list of Tasks assigned to the logged on user
 *
 *  Results are stored in cache-provider with 'taskKey'
 *
 *  Update route sends changes the status of the nominated task to complete
 *
 *  Sends json reply to client
 */


const jsforce = require ('jsforce');
const express = require('express');
const taskRoute = express.Router();
const moment = require('moment');

let cacheProvider = require('../cache-provider');

taskRoute.route('/').get((req, res) => {

  if (req.session.userId ) {
    const connection = new jsforce.Connection({
      sessionId: req.session.accessToken,
      instanceUrl: req.session.instanceUrl
    });
    connection.query(
      'SELECT Id, Exception_Agile_ECO_MCO__c, Status, Subject, WhatId ' +
      'FROM Task WHERE (Subject LIKE \'%Preliminary\' OR Subject LIKE \'%FA\' OR Subject LIKE \'%Revision%\' )' +
      'AND Status <> \'Completed\' AND Status <> \'Cancelled\' AND OwnerId = \'' + req.session.userId + '\'',
      (err, result) => {
        if (err)
          return console.log("jsforce query error " + err);

        cacheProvider.instance().set('taskKey', result.records, (err) => {
          if (err) {
            res.status(400).json('Tasks save error');
          } else {
            res.status(200).json('Tasks saved');
          }
        });
      });
  }
  else
    res.status(400).json('Error: Not Logged in');
});

taskRoute.route('/update/:id').post( (req, res) => {
  if (req.session.userId ) {
    const connection = new jsforce.Connection({
      sessionId: req.session.accessToken,
      instanceUrl: req.session.instanceUrl
    });
    connection.sobject('Task').update({
      Id: req.params.id,
      Status: 'Completed',
      Description: 'Task Completed - ' + moment().format('MMM Do YYYY hh:mm')
    }, (err, ret) => {
      if( err || ! ret.success) {
        return console.error(err, ret);
      }
      else {
        res.status(200).json('update success');
      }
    });
  }
  else
    res.status(400).json('Error: Not Logged in');
});

module.exports = taskRoute;

