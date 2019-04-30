const moment = require('moment');

const express = require('express');
const sopsRoute = express.Router();

let cacheProvider = require('../cache-provider');

sopsRoute.route('/').get((req, res) => {
  if (req.session.userId ) {
    let sopsTasks = cacheProvider.instance().get('sopsTasksKey')

    cacheProvider.instance().get('sopsOppsKey', (err, opps) => {
      if (err)
        console.error(err);
      else {


        for (let i = 0; i < opps.length; i++) {
          let t = sopsTasks.find(task => (task.WhatId === opps[i].Id));
          delete opps[i].attributes;
          opps[i].TaskStatus = t.Status;
          opps[i].TaskDueDate = moment().add(t.Days_until_Due_Date__c, 'days').format('MMM Do YYYY');
        }
        res.json(opps);
      }
    });
  }
  else
    res.status(400).json('Error: Not Logged in');

});

module.exports = sopsRoute;
