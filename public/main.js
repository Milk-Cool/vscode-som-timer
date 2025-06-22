/**
 * @param {string} key 
 * @returns {{ text: string, total_seconds: number } | null}
 */
const fetchStats = async key => {
    const f = await fetch(`https://hackatime.hackclub.com/api/hackatime/v1/users/my/statusbar/today`, {
        headers: {
            "Authorization": `Bearer ${key}`
        }
    });
    if(f.status !== 200) return null;
    return (await f.json()).data.grand_total;
};

/** @type {HTMLInputElement} */
const apiKeyInput = document.querySelector("#key");
/** @type {HTMLButtonElement} */
const apiKeyButton = document.querySelector("#submitKey");
const saveAPIKey = async () => {
    apiKeyButton.disabled = true;
    const newKey = apiKeyInput.value;
    const test = await fetchStats(newKey);
    apiKeyButton.disabled = false;
    if(test === null)
        return vscode.postMessage({
            command: "alert",
            msg: "Your provided API key is invalid!"
        });
    vscode.postMessage({
        command: "saveKey",
        key: newKey
    });
    apiKey = newKey;
    return vscode.postMessage({
        command: "alert",
        msg: "Updated your API key!"
    });  
};
apiKeyButton.addEventListener("click", saveAPIKey);

const update = async () => {
    if(!apiKey) {
        document.querySelector("#time").innerText = "Not yet set up!";
        return;
    }
    const stats = await fetchStats(apiKey);
    document.querySelector("#time").innerText = stats.text;
};
setInterval(update, 60 * 1000);
update();

const updateCountdown = () => {
    const remaining = 1756702800000 - Date.now();
    document.querySelector("#countdown").innerText = remaining < 0
        ? "0d 0h 0m 0s"
        : `${Math.floor(remaining / (1000 * 3600 * 24))}d ${Math.floor(remaining / (1000 * 3600)) % 24}h ${Math.floor(remaining / (1000 * 60)) % 60}m ${Math.floor(remaining / 1000) % 60}s`;
};
updateCountdown();
setInterval(updateCountdown, 1000);

const updateLeaderboard = async () => {
    vscode.postMessage({
        command: "getLeaderboard"
    });
};
updateLeaderboard();
setInterval(updateLeaderboard, 60 * 1000);

window.addEventListener("message", e => {
    if(e.data.command !== "leaderboard") return;
    document.querySelector("#leaderboard").innerHTML = e.data.leaderboard;
});