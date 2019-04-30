/**
 *  exception.route.js
 *
 *  Receives a get request at path /exception
 *
 *  Establishes connection to Salesforce using session cookie containing accessToken
 *
 *  Queries Sales for a list of Exceptions associated with tasks list
 *
 *  Results are stored in cache-provider with 'exceptionKey'
 *
 */

const jsforce = require('jsforce');
const express = require('express');
const exceptionRoute = express.Router();

let cacheProvider = require('../cache-provider');

exceptionRoute.route('/').get((req, res) => {
  if (req.session.userId ) {

    let querySOQL = 'SELECT Id, Name, Agile_Opportunity_ID__c, Exception_Decision_Due__c, Opportunity_Name__c, ' +
      'Status__c, Exception_Number__c, Quoting_Instructions__c FROM Exception__c ' +
      'WHERE Id IN (';

    cacheProvider.instance().get('taskKey', (err, tasks) => {
      if (err) {
        console.error(err);
        res.status(400).json('Tasks not found in cache ');
      }
      else {

        for (let index = 0; index < tasks.length; ++index) {
          if (index == 0)
            querySOQL += '\'' + tasks[index].WhatId + '\'';
          else
            querySOQL += ',\'' + tasks[index].WhatId + '\'';
        }
      }
      querySOQL += ')';

      const connection = new jsforce.Connection({
        sessionId: req.session.accessToken,
        instanceUrl: req.session.instanceUrl
      });
      connection.query(querySOQL, (err, result) => {
        if (err)
          return console.error(err);
        else {

          // Remove <br> from Quote Instructions

          result.records.forEach(record => {
            record.Quoting_Instructions__c = record.Quoting_Instructions__c.replace(/<br ?\/?>/g, ' ');
          });
          cacheProvider.instance().set('exceptionKey', result.records, (err) => {
            if (err) {
              res.status(400).json('Exceptions save error');
            } else {
              res.status(200).json('Exceptions saved');
            }
          });
        }
      });

    });
  }
  else
    res.status(400).send('Error: Not Logged in');
});

module.exports = exceptionRoute;
