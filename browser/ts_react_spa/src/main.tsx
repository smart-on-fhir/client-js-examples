import { createRoot }      from 'react-dom/client';
import { oauth2 as SMART } from 'fhirclient';
import App                 from './App.tsx';


const root = createRoot(document.getElementById("root")!);


SMART.init({
  iss        : "https://launch.smarthealthit.org/v/r3/sim/eyJoIjoiMSIsImIiOiJzbWFydC0xNjQyMDY4IiwiZSI6InNtYXJ0LVByYWN0aXRpb25lci03MTYxNDUwMiJ9/fhir",
  clientId   : "whatever",
  scope      : "launch/patient offline_access openid fhirUser"
})
  .then(client => {
      // Fetch MedicationRequest and Patient in parallel to load the app faster
      return Promise.all([
          client.patient.read(),
          client.request(`/MedicationRequest?patient=${client.patient.id}`, {
              resolveReferences: "medicationReference",
              pageLimit: 0,
              flat: true
          })
      ]);
  })
  .then(
      ([patient, meds]) => root.render(<App patient={patient} meds={meds} />),
      error => {
          console.error(error);
          root.render(<pre><br />{error.stack}</pre>);
      }
  );