/**
 *  opportunity.route.js
 *
 *  Receives a get request at path /opportunity
 *
 *  Establishes connection to Salesforce using session cookie containing accessToken
 *
 *  Queries Sales for a list of Opportunities associated with Exceptions list
 *
 *  Results are stored in cache-provider with 'opportunityKey'
 *
 */


const jsforce = require('jsforce');
const express = require('express');
const opportunityRoute = express.Router();

let cacheProvider = require('../cache-provider');

opportunityRoute.route('/').get((req, res) => {
  if (req.session.userId ) {
    let querySOQL = 'SELECT Id, Name FROM Opportunity WHERE Id IN (';

    cacheProvider.instance().get('exceptionKey', (err, exceptions) => {
      if (err)
        console.error(err);
      else {

        for (let index = 0; index < exceptions.length; ++index) {
          if (index == 0)
            querySOQL += '\'' + exceptions[index].Opportunity_Name__c + '\'';
          else
            querySOQL += ',\'' + exceptions[index].Opportunity_Name__c + '\'';
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
          cacheProvider.instance().set('opportunityKey', result.records, (err) => {
            if (err) {
              res.status(400).json('Opportunities save error');
            } else {
              res.status(200).json('Opportunities saved');
            }
          });
        }
      });

    });
  }
  else
    res.status(400).send('Error: Not Logged in');
});

module.exports = opportunityRoute;
