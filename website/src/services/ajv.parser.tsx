import { SnackbarContextType } from "../components/SnackBar";

export function parseAjvErrors(
    error: any,
    errorMap: {
        [prefix: string]: React.Dispatch<React.SetStateAction<string[]>>;
    },
    showSnackMessage: SnackbarContextType["showSnackMessage"]
) {
    // Clear previous messages
    for (const setter of Object.values(errorMap))
        setter([]);

    const statusText = error.response.statusText as string;
    const splitMsgs = statusText
        .split("Bad Request: ")[1] // remove Bad Request: 
        ?.split(", ");

    const errorMessages: { [key: string]: string[] } = {};
    for (const msg of splitMsgs) {
        const match = msg.match(/(data\/\w+)\s(.+)/);
        if (!match) {
            // failed to parse, resort to snackbar for this msg
            showSnackMessage(msg, "error");
            continue;
        }
        const [_, key, message] = match;
        if (!errorMessages[key])
            errorMessages[key] = [];

        errorMessages[key].push(message);
    }

    for (const [key, setter] of Object.entries(errorMap)) {
        if (errorMessages[key])
            setter(errorMessages[key]);
    }
}

export function joinErrorMessages(errorMsgs: string[]) {
    // https://stackoverflow.com/a/67264565
    return (
        <>
            {errorMsgs.map(x => (
                <>{x} <br /></>
            ))}
        </>
    )
}
