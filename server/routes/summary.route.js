/**
 *  summary.route.js
 *
 *  Receives a get request at path /summary
 *
 *  Establishes connection to Salesforce using session cookie containing accessToken
 *
 *  Responds with Task, Exception and Opportunity data
 *
 *        Id:
 *        Exception_Agile_ECO_MCO__c:
 *        Status:
 *        Subject:
 *        WhatId:
 *        ECO_MCO_status:
 *        ExceptionId:
 *        ExceptionNumber:
 *        Name:
 *        CustomCodes:
 *        OpportunityName:
 *
 */
const express = require('express');
const summaryRoute = express.Router();

let cacheProvider = require('../cache-provider');

summaryRoute.route('/').get((req, res) => {
  if (req.session.userId ) {

    let exceptions = cacheProvider.instance().get('exceptionKey');
    let opportunities = cacheProvider.instance().get('opportunityKey')

    cacheProvider.instance().get('taskKey', (err, tasks) => {
      if (err)
        console.error(err);
      else {
        for (let i = 0; i < tasks.length; i++) {
          delete tasks[i].attributes;
          let ex = exceptions.find(exception => (exception.Id === tasks[i].WhatId));
          tasks[i].ExceptionId = ex.Id;
          tasks[i].ExceptionNumber = ex.Exception_Number__c;
          tasks[i].Name = ex.Name;
          tasks[i].CustomCodes = ex.Quoting_Instructions__c;
          let opp = opportunities.find(opportunity => (opportunity.Id === ex.Opportunity_Name__c));
          tasks[i].OpportunityName = opp.Name;
        }
        res.status(200).json(tasks);
      }
    });
  }
  else
    res.status(400).json('Summary data error - not logged in');

});

module.exports = summaryRoute;
