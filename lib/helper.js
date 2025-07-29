export const registerUser = async (name, phone, email) => {
    const response = await fetch("https://api.interakt.ai/v1/public/track/users/", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${process.env.INTERAKT_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            countryCode: "+91",
            phoneNumber: phone,
            traits: {
                name,
                email: email,
            },
        }),
    });

    const responseText = await response.text();
    console.debug("User registration response:", responseText);

    return response.ok;
}


export const sendMessage = async ({ phoneNo = "", name, course, date, publicUrl }) => {

    console.debug(`Name ==> ${name}, `)
    try {

        const messagePayload = {
            countryCode: "91",
            phoneNumber: phoneNo, // Replace with actual student phone number
            type: "Template",
            template: {
                name: "certificate_delivery",
                languageCode: "en",
                headerValues: [publicUrl],
                bodyValues: [name, course, date], // Template variables
            }
        };

        const interaktRes = await fetch("https://api.interakt.ai/v1/public/message/", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${process.env.INTERAKT_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messagePayload),
        });

        const rawText = await interaktRes.text(); // 
        console.debug("Raw Interakt Response:", rawText);

        let interaktResponseJson;
        try {
            interaktResponseJson = JSON.parse(rawText);
            console.debug("Interakt json response =>", interaktResponseJson);
        } catch (err) {
            return NextResponse.json({
                success: false,
                message: "Failed to parse response from Interakt",
                responseText: rawText,
                error: err.message,
            }, { status: 500 });
        }


        if (!interaktRes.ok) {
            return NextResponse.json({
                success: false,
                message: "Certificate uploaded but failed to send WhatsApp message.",
                publicUrl,
                error: interaktResponseJson,
            }, { status: 500 });
        }

        return { success: true }

    } catch (error) {
        console.error("Error while sending message ==> ", error)
        return { success: false, error }
    }
}