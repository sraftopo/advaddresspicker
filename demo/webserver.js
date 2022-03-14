const express = require('express');
const app = new express();
const path = require('path');
const router = express.Router();
const cors = require('cors');

var livereload = require("livereload");
var connectLiveReload = require("connect-livereload");

path.win32.basename('/');

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
}); 

var staticFilesPath = path.resolve(__dirname, '../');
app.use(express.static(staticFilesPath));
app.use(connectLiveReload());

app.get('/', function(request, response, next){
    response.sendFile(path.join(__dirname,'/demo.html'));
});

//add the router
app.use('/', router);


app.listen(
    port = 8080 , 
    function() {
    console.log('Listening on port %d', port);
});

// opens the url in the default browser 
// open('http://localhost:8080');