import React, { useEffect, useState } from "react";
import { useClient } from "./FhirClientContext";


function PatientName({ name = [] }) {
    let entry =
        name.find(nameRecord => nameRecord.use === "official") || name[0];
    if (!entry) {
        return <h1>No Name</h1>;
    }
    return <h1>{entry.given.join(" ") + " " + entry.family}</h1>;
}

function PatientBanner(patient) {
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

export default function Patient() {
    const [loading, setLoading] = useState(true)
    const [patient, setPatient] = useState(null)
    const [error  , setError  ] = useState(null)
    
    const { client } = useClient()

    
    useEffect(() => {
        if (client) {
            setError(null)
            setLoading(true)
            setPatient(null)
            client.patient.read()
                .then(patient => setPatient(patient))
                .catch(error => setError(error))
                .finally(() => setLoading(false));
        }
    }, [client])

    
    if (loading) {
        return null;
    }

    if (error) {
        return error + "";
    }

    return <PatientBanner {...patient} />;
}
