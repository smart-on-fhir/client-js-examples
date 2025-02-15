
// Our app is written in ES3 so that it works in older browsers!

function createRenderer(id) {
  const output = id ? document.getElementById(id) : document.body;
  return function(data) {
    output.innerText = data && typeof data === "object"
      ? JSON.stringify(data, null, 4)
      : String(data);
  };
}

function App(client) {
  this.client = client;
}

App.prototype.fetchCurrentPatient = function() {
  var render = createRenderer("patient");
  render("Loading...");
  return this.client.patient.read().then(render, render);
};

App.prototype.fetchCurrentEncounter = function() {
  var render = createRenderer("encounter");
  render("Loading...");
  return this.client.encounter.read().then(render, render);
};

App.prototype.fetchCurrentUser = function() {
  var render = createRenderer("user");
  render("Loading...");
  return this.client.user.read().then(render, render);
};

App.prototype.request = function(requestOptions, fhirOptions) {
  var render = createRenderer("output");
  render("Loading...");
  return this.client.request(requestOptions, fhirOptions).then(render, render);
};

App.prototype.renderContext = function() {
  return Promise.all([
    this.fetchCurrentPatient(),
    this.fetchCurrentUser(),
    this.fetchCurrentEncounter()
  ]);
};

App.prototype.setLabel = function(containerId, label) {
  document.getElementById(containerId).previousElementSibling.innerText = label;
};

