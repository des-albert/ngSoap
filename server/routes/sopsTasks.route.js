/**
 *  sopsTasks.route.js
 *
 *  Receives a get request at path /sopsTasks
 *
 *  Establishes connection to Salesforce using session cookie containing accessToken
 *
 *  Queries Salesforce for a list of Quote Review Tasks assigned to the logged on user
 *
 *  Results are stored in cache-provider with 'sopsTasksKey'
 *
 */


const jsforce = require('jsforce');
const express = require('express');
const sopsTasksRoute = express.Router();

let cacheProvider = require('../cache-provider');

sopsTasksRoute.route('/').get((req, res) => {
  if (req.session.userId ) {

    const connection = new jsforce.Connection({
      sessionId: req.session.accessToken,
      instanceUrl: req.session.instanceUrl
    });
    connection.query(
      'SELECT Id, Status, Days_until_Due_Date__c, Description, WhatId '
      + 'FROM Task WHERE Status <> \'Completed\' '
      + 'AND Subject = \'Quote Review Request\' AND OwnerId = \'' + req.session.userId + '\' AND WhatId IN '
      + '(SELECT Id FROM Opportunity WHERE Sales_Enablement_User__c = \'' + req.session.userId + '\' '
      + 'AND SOPS_Control__c = True AND Primary_Quote_Status__c <> \'\') ORDER BY WhatId',
      (err, result) => {
        if (err)
          return console.error(err);
        else {
          cacheProvider.instance().set('sopsTasksKey', result.records, (err) => {
            if (err) {
              res.status(400).json('sopsTasks save error');
            } else {
              res.status(200).json('sopsTasks saved');
            }
          });
        }
      });
  }
  else
    res.status(400).send('Error: Not Logged in');
});

module.exports = sopsTasksRoute;
