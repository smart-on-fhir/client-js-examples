const http    = require("http");
const { smart } = require("fhirclient/node");
const Session = require("./session");


// The settings that we use to connect to our SMART on FHIR server
const smartSettings = {
    clientId: "my-client-id",
    redirectUri: "/app",
    scope: "launch/patient patient/*.read openid fhirUser",
    iss: "https://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImIiOiJzbWFydC03Nzc3NzA1In0/fhir"
};

// Just a simple function to reply back with some data (the current patient if
// we know who he is, or all patients otherwise
async function handler(client, res) {
    const data = await (client.patient.id
        ? client.patient.read()
        : client.request("Patient"));
    res.setHeader("Content-type", "application/json");
    res.end(JSON.stringify(data, null, 4));
}

// This is our storage factory function. It will be called with request and response and is
// expected to return a storage object that implements the basic storage interface found at
// https://github.com/smart-on-fhir/client-js/tree/master/src/storage/ServerStorage.ts
function getStorage({ request, response }) {
    const session = Session.fromRequest(request) || new Session();
    response.setHeader("Set-Cookie", session.cookie);
    return session;
}

// Our basic HTTP server
http.createServer((req, res) => {
    switch (req.url) {
        // =====================================================================
        // LAUNCHING
        // =====================================================================
        // 1. The "iss" option in smartSettings preconfigures the app to work with
        //    that server. Loading /launch makes a standalone launch against it.
        // 2. An EHR launches the app by loading /launch with "iss" and "launch" url
        //    parameters. Because this app is preconfigured with an "iss" option, the
        //    "iss" url parameter must match it, or authorize() throws. This prevents a
        //    crafted link from making the app authorize against a different server.
        //    To accept launches from several EHRs, pass an array of settings with
        //    "issMatch" instead (see
        //    http://docs.smarthealthit.org/client-js/open_servers#2-using-multiple-launch-configurations).
        // 3. If you remove the "iss" option, the server must come from the url:
        //    - /launch with no "iss" url parameter throws, because the FHIR server is
        //      not known.
        //    - /launch?iss=... without "launch" makes a "dynamic" standalone launch
        //      against that server. The app cannot obtain a launch context, but the
        //      SMART Sandbox can build an "iss" url that has the launch context
        //      embedded, which is perfect for previewing your app. For example, to
        //      launch the app with Angela Montgomery from DSTU-2:
        //      /launch?iss=https://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImIiOiJzbWFydC03Nzc3NzA1In0/fhir
        //    - If "iss" is an open server, no authorization attempt is made and we are
        //      redirected to the redirect_uri (there is no launch context and no
        //      selected patient, so we show all patients instead):
        //      /launch?iss=https://r3.smarthealthit.org
        // 4. Finally, a "fhirServiceUrl" option or url parameter is like "iss" but
        //    bypasses the authorization (only useful in testing and development). It
        //    is ignored if "iss" is set. Example:
        //    /launch?fhirServiceUrl=https://launch.smarthealthit.org/v/r3/fhir
        case "/launch":
            smart(req, res, getStorage).authorize(smartSettings);
            break;

        // =====================================================================
        // APP
        // =====================================================================
        // The app lives at your redirect_uri. After waiting for "ready()", you
        // get a client instance that can be used to query the fhir server.
        case "/app":
            smart(req, res, getStorage).ready().then(client => handler(client, res));
            break;

        // =====================================================================
        // SINGLE ROUTE
        // =====================================================================
        // In case you prefer to handle everything in one place, you can use the "init"
        // method instead of "authorize" and then "ready". It takes the same options as
        // "authorize"
        case "/":
            smart(req, res, getStorage)
                .init({ ...smartSettings, redirectUri: "/" })
                .then(client => handler(client, res));
            break;

        // 404 Error Handler
        default:
            res.writeHead(404);
            res.end("Cannot get " + req.url);
            break;
    }
}).listen(8080);
