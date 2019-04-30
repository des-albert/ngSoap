/**
 *  sopsOpps.route.js
 *
 *  Receives a get request at path /sopsOpps
 *
 *  Establishes connection to Salesforce using session cookie containing accessToken
 *
 *  Queries Salesforce for a list of opportunities associated with tasks
 *
 *  Results are stored in cache-provider with 'sopsOppsKey'
 *
 */

const jsforce = require('jsforce');
const express = require('express');
const sopsOppsRoute = express.Router();

let cacheProvider = require('../cache-provider');

sopsOppsRoute.route('/').get((req, res) => {
  if (req.session.userId ) {
    let querySOQL = 'SELECT Id, Name,  Qualified_Quote__c, '
      + 'Primary_Quote_Status__c, Primary_Quote_Number__c FROM Opportunity WHERE '
      + 'Primary_Quote_Status__c <> \'\' AND Id IN ('

    cacheProvider.instance().get('sopsTasksKey', (err, tasks) => {
      if (err)
        console.error(err);
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
          cacheProvider.instance().set('sopsOppsKey', result.records, (err) => {
            if (err) {
              res.status(400).json('sopsOpps save error');
            } else {
              res.status(200).json('sopsOpps saved');
            }
          });
        }
      });

    });
  }
  else
    res.status(400).send('Error: Not Logged in');
});

module.exports = sopsOppsRoute;
