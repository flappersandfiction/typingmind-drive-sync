
// TypingMind Custom Extension - Google Drive Sync (Safe Version)
// This version excludes the client secret for security and public publishing on GitHub.

const CLIENT_ID = "979394491208-rhmsur374u5vrkh4ijnueqslt4f7ckf2.apps.googleusercontent.com";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

async function getAccessToken() {
    const CLIENT_SECRET = prompt("Paste your Google Client Secret:");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent`;
    window.open(authUrl, "_blank");
    alert("Authorize the app in the new tab, then copy the 'authorization code' and paste it below.");

    const code = prompt("Paste the authorization code here:");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code"
        })
    });
    const tokens = await tokenRes.json();
    return tokens.access_token;
}

async function listDriveFiles(accessToken) {
    const res = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType!='application/vnd.google-apps.folder'&fields=files(id,name,mimeType)", {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    const data = await res.json();
    console.log("Google Drive Files:", data.files);
    alert("Fetched file list. Check the browser console.");
}

(async () => {
    const token = await getAccessToken();
    if (token) {
        await listDriveFiles(token);
    }
})();
