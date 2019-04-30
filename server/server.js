const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const serveStatic = require('serve-static');

const userRoute = require('./routes/user.route');
const taskRoute = require('./routes/task.route');
const exceptionRoute = require('./routes/exception.route');
const summaryRoute = require('./routes/summary.route');
const opportunityRoute = require('./routes/opportunity.route');
const sopsTasksRoute = require('./routes/sopsTasks.route');
const sopsOppsRoute = require('./routes/sopsOpps.route');
const sopsRoute = require('./routes/sops.route');
const agileRoute = require('./routes/agile.route');

let cacheProvider = require('./cache-provider');

cacheProvider.start((err) => {
  if (err)
    console.error(err);
});

const app = express();

//  Initialize session

app.use(session({
  name: 'js-force',
  secret: 'S3CRE7',
  resave: true,
  saveUninitialized: true
}));

const corsOptions = {
  origin: true,
  credentials: true

};
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/signin', userRoute);
app.use('/task', taskRoute);
app.use('/exception', exceptionRoute);
app.use('/opportunity', opportunityRoute);
app.use('/summary', summaryRoute);

app.use( '/sopsTasks', sopsTasksRoute);
app.use( '/sopsOpps', sopsOppsRoute);
app.use( '/sops', sopsRoute);
app.use( '/agile', agileRoute);

app.use(serveStatic(__dirname + '/dist'));

const PORT = 4000;
const port = process.env.PORT || PORT;
app.listen(port, () => {
  console.log('Express server running on port ' + port);
});
