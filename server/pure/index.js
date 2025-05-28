const FHIR = require("fhirclient");

const client = new FHIR.FhirClient("https://r4.smarthealthit.org");

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {

    // Iterate over the first 100 patients
    for await(const patient of client.resources("/Patient", { limit: 100 })) {
                    
        console.log("Got patient #%s", patient.id)

        // We have full control here! We can wait a while before fetching the next
        // page, or throw an error, or just `break;` if we want to exit early
        await sleep(100); // just an example
    }
}

main();