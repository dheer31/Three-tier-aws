
/* ==================================
   CONFIGURATION
================================== */

// Replace with your actual API Gateway URL
const API_URL = "https://jw4eq78hb0.execute-api.ap-south-1.amazonaws.com/prod/users";

/* ==================================
   FETCH USER DATA
================================== */

async function fetchUserData() {

    const userId = document.getElementById("userId").value.trim();

    const button = document.getElementById("fetchBtn");
    const btnText = document.getElementById("btnText");
    const userDetails = document.getElementById("userDetails");
    const resultBadge = document.getElementById("resultBadge");

    // Validate input
    if (!userId) {
        alert("Please enter a User ID");
        return;
    }

    // Loading state
    button.disabled = true;
    btnText.innerText = "Fetching...";

    resultBadge.className = "result-status";
    resultBadge.innerText = "FETCHING DATA";

    userDetails.innerHTML = `
        <div class="empty-state">
            <div class="empty-illustration">
                <div class="empty-icon">⟳</div>
            </div>
            <h3>Retrieving user information</h3>
            <p>Communicating with the database. Please wait...</p>
        </div>
    `;

    try {

        // Send GET request
        const response = await fetch(
            `${API_URL}?userId=${encodeURIComponent(userId)}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.json();

        // SUCCESS
        if (response.ok) {

            resultBadge.className = "result-status success";
            resultBadge.innerText = "RECORD FOUND";

            displayUserData(data);

        }

        // USER NOT FOUND OR SERVER ERROR
        else {

            resultBadge.className = "result-status error";

            resultBadge.innerText =
                response.status === 404
                    ? "NOT FOUND"
                    : "REQUEST FAILED";

            showError(
                data.message || "Unable to retrieve user information.",
                response.status
            );

        }

    }

    catch (error) {

        console.error("Fetch error:", error);

        resultBadge.className = "result-status error";
        resultBadge.innerText = "CONNECTION ERROR";

        showError(
            "Unable to connect to the server. Check your API URL, internet connection and CORS configuration.",
            "Network"
        );

    }

    finally {

        button.disabled = false;
        btnText.innerText = "Get User Data";

    }

}


/* ==================================
   DISPLAY USER INFORMATION
================================== */

function displayUserData(user) {

    const userDetails = document.getElementById("userDetails");

    const userName = user.name || user.userId || "User Record";

    const fields = Object.entries(user).map(([key, value]) => {

        let displayValue;

        if (value !== null && typeof value === "object") {
            displayValue = JSON.stringify(value);
        } else {
            displayValue = String(value ?? "N/A");
        }

        return `
            <div class="data-item">
                <small>${escapeHTML(key)}</small>
                <strong>${escapeHTML(displayValue)}</strong>
            </div>
        `;

    }).join("");

    userDetails.innerHTML = `

        <div class="user-result">

            <div class="user-top">

                <div class="user-avatar">
                    ${escapeHTML(String(userName).charAt(0).toUpperCase())}
                </div>

                <div>
                    <h3>${escapeHTML(String(userName))}</h3>
                    <p>User record successfully retrieved from DynamoDB</p>
                </div>

                <span class="record-label">✓ VERIFIED RESPONSE</span>

            </div>

            <div class="data-grid">

                ${fields}

            </div>

            <div class="json-header">

                <h4>RAW JSON RESPONSE</h4>

                <button class="copy-btn" onclick="copyJSON()">
                    Copy JSON
                </button>

            </div>

            <pre id="jsonResponse">${escapeHTML(
                JSON.stringify(user, null, 4)
            )}</pre>

        </div>

    `;

}


/* ==================================
   DISPLAY ERROR
================================== */

function showError(message, status) {

    const userDetails = document.getElementById("userDetails");

    userDetails.innerHTML = `

        <div class="error-state">

            <div class="error-symbol">!</div>

            <h3>${status === 404 ? "User Not Found" : "Request Failed"}</h3>

            <p>${escapeHTML(message)}</p>

            <p style="margin-top:12px">
                Status Code: ${escapeHTML(String(status))}
            </p>

        </div>

    `;

}


/* ==================================
   COPY JSON RESPONSE
================================== */

async function copyJSON() {

    const jsonElement = document.getElementById("jsonResponse");

    if (!jsonElement) return;

    try {

        await navigator.clipboard.writeText(jsonElement.innerText);

        const button = document.querySelector(".copy-btn");

        button.innerText = "Copied!";

        setTimeout(() => {
            button.innerText = "Copy JSON";
        }, 1500);

    }

    catch (error) {
        console.error("Copy failed:", error);
        alert("Unable to copy JSON.");
    }

}


/* ==================================
   SECURITY: ESCAPE HTML
================================== */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[char]);

}


/* ==================================
   ENTER KEY SEARCH
================================== */

document.getElementById("userId").addEventListener("keydown", event => {

    if (event.key === "Enter") {
        fetchUserData();
    }

});
