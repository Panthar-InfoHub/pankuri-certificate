import { NextResponse } from "next/server";

export const registerUser = async (name, phone) => {
    // Retaining this function to avoid breaking existing imports.
    // ChatVerce automatically registers contacts upon message delivery.
    return { success: true, message: "User registration handled by ChatVerce" };
}


export const sendMessage = async ({ phoneNo = "", name, course, date, publicUrl }) => {

    console.debug(`Name ==> ${name}, `)
    try {
        const token = process.env.CHATVERCE_TOKEN;
        const channelId = process.env.CHATVERCE_CHANNEL_ID;

        if (!token || !channelId) {
            return {
                success: false,
                message: "CHATVERCE_TOKEN or CHATVERCE_CHANNEL_ID is not configured in the environment variables."
            };
        }

        // Format recipient phone number to exclude non-digits and ensure country code
        const formattedPhone = phoneNo.replace(/\D/g, "");
        const recipient = formattedPhone.startsWith("91") ? formattedPhone : `91${formattedPhone}`;

        // Construct ChatVerce / Sihari Labs template message payload
        const messagePayload = {
            to: recipient,
            type: "template",
            template: {
                name: "certificate_message_",
                language: {
                    code: "en"
                },
                components: [
                    {
                        type: "header",
                        parameters: [
                            {
                                type: "document",
                                document: {
                                    link: publicUrl,
                                    filename: `${name.replace(/ /g, "_")}_Certificate.pdf`
                                }
                            }
                        ]
                    },
                    {
                        type: "body",
                        parameters: [
                            {
                                type: "text",
                                text: name
                            },
                            {
                                type: "text",
                                text: course
                            },
                            {
                                type: "text",
                                text: date
                            }
                        ]
                    }
                ]
            }
        };

        console.debug(`Sending message to ${recipient} via ChatVerce...`);

        const response = await fetch(`https://api.siharilabs.com/v1/channels/${channelId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messagePayload),
        });

        const rawText = await response.text();
        console.debug("Raw ChatVerce Response:", rawText);

        let responseJson;
        try {
            responseJson = JSON.parse(rawText);
        } catch (err) {
            return {
                success: false,
                message: "Failed to parse response from ChatVerce",
                responseText: rawText,
                error: err.message,
            };
        }

        if (!response.ok) {
            return {
                success: false,
                message: "Failed to send WhatsApp message via ChatVerce.",
                error: responseJson,
            };
        }

        return { success: true, message: "Message is queued to send..." };

    } catch (error) {
        console.error("Error while sending message ==> ", error);
        return { success: false, error, message: "Error while sending message..." };
    }
}