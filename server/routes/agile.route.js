/**
 *  agile.route.js
 *
 *  Receives a get request at path /agile
 *
 *  Sends SOAP request to Agile PLM WebServices
 *
 *  Adds change status information to Tasks
 *
 **/


const soap = require('strong-soap').soap;
const express = require('express');
const agileRoute = express.Router();

let cacheProvider = require('../cache-provider');

const argsSearch = {
  request: {
    classIdentifier: null,
    keywords: null,
    searchFiles: 'false'
  }
};

const argsCollaboration = {
  request: {
    statusRequest: {
      classIdentifier: null,
      objectNumber: null
    }
  }
};

const argsTable = {
  request: {
    tableRequest: {
      classIdentifier: null,
      objectNumber: null,
      tableIdentifier: 'Workflow'
    }
  }
};

agileRoute.route('/').get((req, res) => {
  if (req.session.userId) {
    let agileUser = cacheProvider.instance().get('agileName');
    let security = new soap.BasicAuthSecurity(agileUser.agileName, agileUser.password);
    let tasks = cacheProvider.instance().get('taskKey');

    let promises = [];
    for (let i = 0; i < tasks.length; i++) {
      const change = tasks[i].Exception_Agile_ECO_MCO__c;

      promises.push(getChangeStaus(change, security));
    }

    Promise.all(promises)
      .then((values) => {
        for (let i = 0; i < tasks.length; i++) {
          tasks[i]['ECO_MCO_status'] = values[i];
        }
        cacheProvider.instance().set('taskKey', tasks, (err) => {
          if (err) {
            res.status(400).json('Agile Status Task save error');
          } else {
            res.status(200).json('Agile Status added to Task');
          }
        });

      })
      .catch(err => {
        console.log('getStatus error ' + err);
      });
  }
});

function getChangeStaus (change, secure) {
  return new Promise ((resolve, reject) => {
    let wsdl = __dirname + '/wsdl/Search.wsdl';
    soap.createClient(wsdl, {}, (err, searchClient) => {
      if (err) {
        console.log('QuickSearch createClient error : ' + err);
        reject();
      }

      // Change Object Identifier

      searchClient.setSecurity(secure);
      const searchMethod = searchClient['SearchService']['Search']['quickSearch'];
      argsSearch.request.classIdentifier = change.substring(0, 3);
      argsSearch.request.keywords = change.substring(4, 9);
      searchMethod(argsSearch, (err, searchResult) => {
        if (err) {
          console.log('QuickSearch method error : ' + err);
          reject();
        }
        const id = searchResult.response.table.row.objectReferentId.objectId;

        // Change Status

        wsdl = __dirname + '/wsdl/Collaboration.wsdl';
        soap.createClient(wsdl, {}, (err, collabClient) => {
          if (err) {
            console.log('Collaboration createClient error : ' + err);
            reject();
          }
          collabClient.setSecurity(secure);
          argsCollaboration.request.statusRequest.classIdentifier = change.substring(0, 3);
          argsCollaboration.request.statusRequest.objectNumber = id;
          const collabationMethod = collabClient['CollaborationService']['Collaboration']['getStatus'];
          collabationMethod(argsCollaboration, (err, collabResult) => {
            if (err) {
              console.log('Collaboration method error : ' + err);
              reject();
            }
            let objStatus = collabResult.response.statusResponse.currentStatus.statusDisplayName;

            // Change Approvers

            if(objStatus === 'CCB') {
              wsdl = __dirname + '/wsdl/Table.wsdl';
              soap.createClient(wsdl, {}, (err, tableClient) => {
                if (err) {
                  console.log('Table createClient error : ' + err);
                  reject();
                }
                tableClient.setSecurity(secure);
                argsTable.request.tableRequest.classIdentifier = change.substring(0, 3);
                argsTable.request.tableRequest.objectNumber = id;
                const tableMethod = tableClient['TableService']['Table']['loadTable'];
                tableMethod(argsTable, (err, tableResult) => {
                  if (err) {
                    console.log('Table method error : ' + err);
                    reject();
                  }
                  const tableRow = tableResult.response.tableContents.row;
                  for (let i = 0; i < tableRow.length; i++) {
                    if(tableRow[i].action.hasOwnProperty('selection')) {
                      if(tableRow[i].action.selection.value == 'Awaiting Approval')
                        objStatus += ', ' + tableRow[i].reviewer.selection.value;
                    }
                  }
                  resolve(objStatus);

                });
              });
            }
            else {
              resolve(objStatus);
            }
          });
        });
      });
    });
  });
}


module.exports = agileRoute;
