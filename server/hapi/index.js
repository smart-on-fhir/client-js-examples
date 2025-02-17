const Hapi = require("hapi");
const Session = require("hapi-server-session");
const smart = require("fhirclient/lib/entry/hapi");

// The settings that we use to connect to our SMART on FHIR server
const smartSettings = {
  clientId: "my-client-id",
  redirectUri: "/app",
  scope: "launch/patient patient/*.read openid fhirUser",
  iss:
    "https://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImIiOiJzbWFydC03Nzc3NzA1In0/fhir"
};

// Just a simple function to reply back with some data (the current patient if
// we know who he is, or all patients otherwise
async function handler(client, h) {
  const data = await (client.patient.id
    ? client.patient.read()
    : client.request("Patient"));
  return h.response(JSON.stringify(data, null, 4)).type("application/json");
}

const init = async () => {
  const server = Hapi.server({
    port: 8080,
    host: "0.0.0.0",
    debug: {
      request: ["*"],
      log: ["*"]
    }
  });

  await server.register({
    plugin: Session,
    options: {
      expiresIn: 1000 * 60 * 5,
      cookie: {
        isSecure: false // never set to false in production
      }
    }
  });

  // our launch uri
  server.route({
    method: "GET",
    path: "/",
    handler: async (request, h) => {
      return smart(request, h).authorize(smartSettings);
    }
  });

  // our redirect uri
  server.route({
    method: "GET",
    path: "/app",
    handler: async (request, h) => {
      return smart(request, h).ready((client) => handler(client, h));
    }
  });

  await server.start();
};

init();
