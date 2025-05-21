
// Google Drive Plugin for TypingMind
// Supports: listFiles, searchFiles, getFileContent

const CLIENT_ID = "<YOUR_CLIENT_ID>";
const CLIENT_SECRET = prompt("Paste your Google Client Secret:");
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

async function getAccessToken() {
    const authUrl = \`https://accounts.google.com/o/oauth2/v2/auth?client_id=\${CLIENT_ID}&redirect_uri=\${REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent\`;
    window.open(authUrl, "_blank");
    const code = prompt("Paste the authorization code from Google:");
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

async function listFiles() {
    const token = await getAccessToken();
    const res = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType!='application/vnd.google-apps.folder'&fields=files(id,name,mimeType)", {
        headers: { Authorization: \`Bearer \${token}\` }
    });
    const data = await res.json();
    console.log("Files:", data.files);
    return data.files;
}

async function searchFiles(query) {
    const token = await getAccessToken();
    const q = encodeURIComponent(\`name contains '\${query}' and mimeType != 'application/vnd.google-apps.folder'\`);
    const res = await fetch(\`https://www.googleapis.com/drive/v3/files?q=\${q}&fields=files(id,name,mimeType)\`, {
        headers: { Authorization: \`Bearer \${token}\` }
    });
    const data = await res.json();
    console.log("Search results:", data.files);
    return data.files;
}

async function getFileContent(fileId) {
    const token = await getAccessToken();
    const metaRes = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}?fields=name,mimeType\`, {
        headers: { Authorization: \`Bearer \${token}\` }
    });
    const meta = await metaRes.json();

    let content = "";

    if (meta.mimeType === "application/vnd.google-apps.document") {
        const res = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=text/plain\`, {
            headers: { Authorization: \`Bearer \${token}\` }
        });
        content = await res.text();
    } else if (meta.mimeType === "application/pdf") {
        const res = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}?alt=media\`, {
            headers: { Authorization: \`Bearer \${token}\` }
        });
        content = await res.text(); // text may be garbled; PDF parsing is limited
    } else {
        const res = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}?alt=media\`, {
            headers: { Authorization: \`Bearer \${token}\` }
        });
        content = await res.text();
    }

    console.log("File content:", content);
    return content;
}

// For manual testing:
// await listFiles();
// await searchFiles("meeting");
// await getFileContent("YOUR_FILE_ID");
