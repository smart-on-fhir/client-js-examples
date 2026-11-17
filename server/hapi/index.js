const Hapi = require("@hapi/hapi");
const Yar = require("@hapi/yar");
const { smart } = require("fhirclient/hapi");

// The settings that we use to connect to our SMART on FHIR server
const smartSettings = {
  clientId: "my-client-id",
  redirectUri: "/app",
  scope: "launch/patient patient/*.read openid fhirUser",
  iss:
    "https://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImIiOiJzbWFydC03Nzc3NzA1In0/fhir"
};

// The SMART state is stored in the session. By default, fhirclient looks for a
// `request.session` object. The @hapi/yar session plugin uses `request.yar`
// instead, so we pass a small storage adapter to `smart()`.
function getStorage({ request }) {
  return {
    async get(key) {
      return request.yar.get(key);
    },
    async set(key, value) {
      request.yar.set(key, value);
      return value;
    },
    async unset(key) {
      request.yar.clear(key);
      return true;
    }
  };
}

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
    plugin: Yar,
    options: {
      cookieOptions: {
        // Used to encrypt the session cookie. Must be at least 32 characters.
        // Use a real secret (for example, from an environment variable) in
        // production!
        password: "my secret that is at least 32 characters long",
        isSecure: false // never set to false in production
      }
    }
  });

  // our launch uri
  server.route({
    method: "GET",
    path: "/",
    handler: async (request, h) => {
      return smart(request, h, getStorage).authorize(smartSettings);
    }
  });

  // our redirect uri
  server.route({
    method: "GET",
    path: "/app",
    handler: async (request, h) => {
      const client = await smart(request, h, getStorage).ready();
      return handler(client, h);
    }
  });

  await server.start();
  console.log("Server running at %s", server.info.uri);
};

init();
