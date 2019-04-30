/**
 *  user.route.js
 *
 *  Receives a post request at path /signin
 *
 *  Uses jsforce to send a login request to Salesforce
 *
 *  Stores accessToken, url and userId in a cookie - 'js-force'
 *
 *  Sends json reply to client
 */


const express = require('express');
const userRoute = express.Router();
const jsforce = require('jsforce');

let cacheProvider = require('../cache-provider');

const connection = new jsforce.Connection({
  loginUrl: 'https://login.salesforce.com'
});


userRoute.route('/').post((req, res) => {
  const body = req.body;

  connection.login(body.sfdcName, body.password + body.token, (err, userInfo) => {
    if (err) {
      res.status(400).json('Salesforce login failure');
      return console.error(err);
    }
    else {

      req.session.accessToken = connection.accessToken;
      req.session.instanceUrl = connection.instanceUrl;
      req.session.userId = userInfo.id;

      cacheProvider.instance().set('agileName', body, (err) => {
        if (err)
          console.error(err);
        else {
          res.status(200).json('Salesforce login success ' + userInfo.id);
        }
      });
    }
  });
});

module.exports = userRoute;
