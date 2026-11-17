import { createContext, useContext, useEffect, useState } from "react";
import { ready } from "fhirclient/browser";
import Client from "fhirclient/Client";

export const FhirClientContext = createContext({
    /** @type {Client|null} */
    client: null
});

export function useClient() {
    return useContext(FhirClientContext);
}

export function FhirClientProvider({ children })
{
    const [loading   , setLoading   ] = useState(true)
    const [error     , setError     ] = useState(null)
    const [client    , setClient    ] = useState(null)

    useEffect(() => {
        ready().then(
            // @ts-ignore
            (client) => setClient(client),
            (error ) => setError(error)
        ).finally(() => setLoading(false));
    }, [])

    if (loading) {
        return null
    }

    if (error) {
        console.error(error)
        return error + ""
    }

    return (
        <FhirClientContext value={{ client }}>
            {children}
        </FhirClientContext>
    );
}