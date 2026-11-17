import { useEffect } from "react";
import { authorize } from "fhirclient/browser";

/**
 * Typically the launch page is an empty page with a `SMART.authorize`
 * call in it.
 *
 * This example demonstrates that the call to authorize can be postponed
 * and called manually. In this case we use ReactRouter which will match
 * the `/launch` path and render our component. Then, after our page is
 * rendered we start the auth flow.
 */
export default function Launcher() {

    /**
     * This is configured to make a Standalone Launch against the server
     * given in the `iss` option. Because of that option, the app only
     * works with that server: if an EHR launches it with a different `iss`
     * url parameter, `authorize` throws. To support EHR launch from any
     * server, remove the `iss` option. To support several known servers,
     * pass an array of options with `issMatch` instead.
     */
    useEffect(() => {
        authorize({
            clientId: "my-client-id",
            scope: "launch launch/patient patient/read offline_access",
            redirectUri: "./app",
            iss:
                "https://launch.smarthealthit.org/v/r3/sim/" +
                "eyJoIjoiMSIsImIiOiJmMDQ2MjkzNi1lYjRiLTRkYT" +
                "EtYjQ1YS1mYmQ5NmViZjhjY2IiLCJlIjoic21hcnQt" +
                "UHJhY3RpdGlvbmVyLTcxNjE0NTAyIn0/fhir"
        });
    }, []);

    return "Launching...";
}
