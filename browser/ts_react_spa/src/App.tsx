import { Coding, HumanName, MedicationRequest, Patient } from "fhir/r4";
import { getPath } from "fhirclient/lib/lib";


function getMedicationName(medCodings: Coding[] = []) {
  let out = "Unnamed Medication(TM)";
  const coding = medCodings.find((c) => c.system === "http://www.nlm.nih.gov/research/umls/rxnorm");
  if (coding && coding.display) {
    out = coding.display;
  }
  return out;
}

function PatientName({ name = [] }: { name?: HumanName[] }) {
  let entry = name.find((nameRecord) => nameRecord.use === "official") || name[0];
  if (!entry) {
    return <h1>No Name</h1>;
  }
  
  let out = entry.family;
  if (entry.given) {
    out = entry.given.join(" ") + " " + out
  }
  return <h1>{out}</h1>;
}

function PatientBanner(patient: Patient) {
  return (
    <div>
      <PatientName name={patient.name} />
      <span>
        Gender: <b>{patient.gender}</b>,{" "}
      </span>
      <span>
        DOB: <b>{patient.birthDate}</b>
      </span>
    </div>
  );
}

function MedRow({ med }: { med: MedicationRequest }) {
  const name = getMedicationName(
    getPath(med, "medicationCodeableConcept.coding") ||
    getPath(med, "medicationReference.code.coding")
  );
  return (
    <tr>
      <td>
        <b>{name}</b>
      </td>
      <td>{med.status || "-"}</td>
      <td>{med.intent || "-"}</td>
      <td>{getPath(med, "dosageInstruction.0.text") || "-"}</td>
    </tr>
  );
}

function App({ patient, meds }: { patient: Patient, meds: MedicationRequest[] }) {
  return (
    <div className="App">
      <PatientBanner {...patient} />
      <hr />
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Medication</th>
            <th>Status</th>
            <th>Intent</th>
            <th>Dosage Instruction</th>
          </tr>
        </thead>
        <tbody>
          { meds.map((med) => (
            <MedRow key={med.id} med={med} />
          ))}
        </tbody>
      </table>
      {/* <pre>{ JSON.stringify(meds, null, 4) }</pre> */}
    </div>
  );
}

export default App;
