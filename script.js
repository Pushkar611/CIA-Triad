/* =====================================
   CIA TRIAD SECURITY ASSESSMENT
   Educational Frontend Simulation
===================================== */

/* =====================================
   1. APPLICATION DATA
===================================== */

var mode = "vuln";

var USERS = {
    1: {
        id: 1,
        name: "Rahul Mahato",
        password: "rahul123",
        email: "rahul@gmail.com",
        phoneNo: "+91 789654137"
    },

    2: {
        id: 2,
        name: "Rahul Kumar",
        password: "rahul456",
        email: "rahul@gmail.com",
        phoneNo: "+91 7896475889"
    },

    3: {
        id: 3,
        name: "Rashid Quaiser",
        password: "rashid123",
        email: "quaiser@yahoo.com",
        phoneNo: "+91 7897894561"
    }
};

/* Helper function */

function $(id) {
    return document.getElementById(id);
}

/* Display result message */

function res(elementId, cls, message) {
    var container = $(elementId);

    var div = document.createElement("div");

    div.className = "res " + cls;
    div.textContent = message;

    container.replaceChildren(div);
}

/* =====================================
   2. SECURITY SCORECARD
===================================== */

function score() {

    var vulnerable = mode === "vuln";

    var items = [
        {
            name: "Confidentiality",
            status: vulnerable ? "Exposed" : "Protected",
            control: "Access control and ownership verification"
        },

        {
            name: "Integrity",
            status: vulnerable ? "At Risk" : "Protected",
            control: "Parameterised queries and output encoding"
        },

        {
            name: "Availability",
            status: vulnerable ? "At Risk" : "Protected",
            control: "Rate limiting and request monitoring"
        }
    ];

    $("score").replaceChildren();

    items.forEach(function (item) {

        var div = document.createElement("div");

        div.className = "score";

        var heading = document.createElement("b");
        heading.textContent = item.name;

        var badge = document.createElement("span");

        badge.className =
            "badge " + (vulnerable ? "bad" : "good");

        badge.textContent = item.status;

        var paragraph = document.createElement("p");

        paragraph.className = "muted";
        paragraph.textContent = "Controls: " + item.control;

        div.append(heading, badge, paragraph);

        $("score").appendChild(div);

    });
}

/* =====================================
   3. APPLICATION MODE SWITCHING
===================================== */

document.querySelectorAll("#modeSeg button")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            mode = button.dataset.m;

            document.querySelectorAll("#modeSeg button")
                .forEach(function (item) {

                    item.classList.remove("on", "v", "s");

                });

            button.classList.add("on");

            button.classList.add(
                mode === "vuln" ? "v" : "s"
            );

            score();

            resetAll();

        });

    });

/* =====================================
   4. NAVIGATION TABS
===================================== */

document.querySelectorAll("#tabs button")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            document.querySelectorAll("#tabs button")
                .forEach(function (item) {

                    item.classList.remove("on");

                });

            button.classList.add("on");

            ["c", "i", "a", "r"].forEach(function (key) {

                $("t-" + key).classList.toggle(
                    "hide",
                    key !== button.dataset.t
                );

            });

        });

    });

/* =====================================
   CONFIDENTIALITY
   AUTHENTICATION SIMULATION
===================================== */

$("cBtn").addEventListener("click", doC);

var cAtk = $("cAtk");

if (cAtk) {
    cAtk.addEventListener("click", function () {
        $("userName").value = "Rahul Mahato";
        $("userPassword").value = "1234";
        doC();
    });
}
function doC() {

    var name = $("userName").value.trim().toLowerCase();
    var password = $("userPassword").value;

    // Find user by name

    var user = Object.values(USERS).find(function (item) {

        return item.name.toLowerCase() === name;

    });

    // User does not exist

    if (!user) {

        $("cOut").textContent =
            '404 Not Found\n{"error":"User not found"}';

        res(
            "cRes",
            "bad",
            "Unauthorized: User does not exist."
        );

        return;
    }

    /* =================================
       VULNERABLE MODE
    ================================= */

    if (mode === "vuln") {

        // Password is not verified.

        $("cOut").textContent =
            "200 OK\n" + JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNo: user.phoneNo
            }, null, 2);

        res(
            "cRes",
            "bad",
            "Vulnerability detected: Access granted without password verification."
        );

    }

    /* =================================
       SECURED MODE
    ================================= */

    else {

        // Verify the actual password.

        if (password === user.password) {

            $("cOut").textContent =
                "200 OK\n" + JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phoneNo
                }, null, 2);

            res(
                "cRes",
                "good",
                "Access granted: Correct password verified."
            );

        }

        else {

            $("cOut").textContent =
                '401 Unauthorized\n{"error":"Invalid password"}';

            res(
                "cRes",
                "bad",
                "Unauthorized: Wrong password. Authentication failed."
            );

        }

    }

}


/* =====================================
   6. INTEGRITY TEST 1
   SQL INJECTION
===================================== */

$("iAtk").addEventListener("click", function () {

    $("em").value = "' OR 1=1 --";

    $("pw").value = "x";

    doI();

});

$("iBtn").addEventListener("click", doI);


function doI() {
    var email = $("em").value.trim();
    var password = $("pw").value;

    // Detect the SQL injection demonstration payload
    var injection =
        /'\s*or\s+1\s*=\s*1/i.test(email) &&
        /--/.test(email);

    // Correct credentials: Rahul
    var validLogin =
        email === "rahul@gmail.com" &&
        password === "rahul123";

    if (mode === "vuln") {

        $("iSql").textContent =
            "SELECT * FROM users WHERE email='" +
            email +
            "' AND password='" +
            password +
            "'";

        if (injection) {
            $("iSql").textContent +=
                "\n\n200 OK - Simulated Login Bypass";

            res(
                "iRes",
                "bad",
                "SQL Injection Successful: Login bypassed because the vulnerable query accepts the injected condition."
            );

        } else if (validLogin) {
            res(
                "iRes",
                "good",
                "Login successful: authenticated normally."
            );

        } else {
            res(
                "iRes",
                "neu",
                "Login failed: Invalid email or password."
            );
        }

    } else {

        $("iSql").textContent =
            "SELECT * FROM users WHERE email = ? " +
            "AND password_hash = ?\n\n" +
            "Parameters: [" +
            JSON.stringify(email) +
            ", securely verified password]";

        if (injection) {
            res(
                "iRes",
                "good",
                "Attack blocked: Parameterised query treats the injected SQL as ordinary input."
            );

        } else if (validLogin) {
            res(
                "iRes",
                "good",
                "Login successful: authenticated normally."
            );

        } else {
            res(
                "iRes",
                "neu",
                "Login failed: Invalid email or password."
            );
        }
    }
}


/* =====================================
   7. INTEGRITY TEST 2
   CROSS-SITE SCRIPTING (XSS)
===================================== */

$("xAtk").addEventListener("click", function () {

    /*
       Harmless local demonstration payload.
       It only changes the demo result message.
    */

    $("rv").value =
        '<img src=x onerror="document.getElementById(\'xRes\').textContent=\'Demo XSS event handler executed in this browser.\'">';

    doX();

});

$("xBtn").addEventListener("click", doX);

function doX() {

    var review = $("rv").value;

    $("xRes").replaceChildren();

    if (mode === "vuln") {

        /*
           Vulnerable:
           HTML is interpreted by the browser.
        */

        $("xOut").innerHTML = review;

        res(
            "xRes",
            "bad",
            "Unsafe output rendering: HTML input is interpreted by the browser and may execute malicious scripts."
        );

    } else {

        /*
           Secured:
           User input is treated as plain text.
        */

        $("xOut").textContent = review;

        res(
            "xRes",
            "good",
            "Protected: input is displayed as text instead of being interpreted as HTML."
        );

    }

}

/* =====================================
   8. AVAILABILITY
   RATE LIMITING SIMULATION
===================================== */

var timer = null;

function resetA() {

    clearInterval(timer);

    timer = null;

    $("load").style.width = "0%";

    $("load").style.background = "var(--good)";

    $("meter").setAttribute("aria-valuenow", "0");

    $("loadText").textContent = "Load: 0%";

    $("aLog").textContent = "Idle.";

    $("aRes").replaceChildren();

    $("aBtn").disabled = false;

}

$("aRst").addEventListener("click", resetA);

$("aBtn").addEventListener("click", function () {

    resetA();

    $("aBtn").disabled = true;

    var requestCount = 0;

    var processed = 0;

    var blocked = 0;

    var lines = [];

    timer = setInterval(function () {

        requestCount++;

        /*
           Vulnerable:
           All 30 requests are accepted.

           Secured:
           Only the first 5 requests are accepted.
           Remaining requests are blocked.
        */

        if (mode === "vuln" || processed < 5) {

            processed++;

            lines.push(
                "#" + requestCount + " 200 OK - Request processed"
            );

        } else {

            blocked++;

            lines.push(
                "#" + requestCount +
                " 429 Too Many Requests - Blocked"
            );

        }

        /* Calculate simulated load */

        var load;

        if (mode === "vuln") {

            load = Math.min(100, processed * 3.4);

        } else {

            load = Math.min(100, processed * 6);

        }

        $("load").style.width = load + "%";

        $("meter").setAttribute(
            "aria-valuenow",
            Math.round(load)
        );

        $("loadText").textContent =
            "Load: " + Math.round(load) + "%";

        $("load").style.background =
            load > 70 ? "var(--bad)" : "var(--good)";

        /* Display last 6 requests */

        $("aLog").textContent =
            lines.slice(-6).join("\n");

        /* Finish simulation */

        if (requestCount === 30) {

            clearInterval(timer);

            timer = null;

            $("aBtn").disabled = false;

            if (mode === "vuln") {

                res(
                    "aRes",
                    "bad",
                    "Availability risk: all 30 simulated requests were accepted without rate limiting. Excessive requests could increase server load."
                );

            } else {

                res(
                    "aRes",
                    "good",
                    "Protected: " +
                    processed +
                    " requests processed and " +
                    blocked +
                    " requests blocked by simulated rate limiting."
                );

            }

        }

    }, 120);

});

/* =====================================
   9. RESET ALL TESTS
===================================== */
function resetAll() {

    /* Confidentiality */

    $("userName").value = "";

    $("userPassword").value = "";

    $("cOut").textContent =
        "Waiting for login...";

    $("cRes").replaceChildren();


    /* SQL Injection */

    $("em").value = "rahul@gmail.com";

    $("pw").value = "rahul123";

    $("iSql").textContent =
        "No query executed yet.";

    $("iRes").replaceChildren();


    /* XSS */

    $("rv").value = "Great product!";

    $("xOut").textContent =
        "No reviews yet.";

    $("xRes").replaceChildren();


    /* Availability */

    resetA();

}

/* =====================================
   10. INITIALISE APPLICATION
===================================== */

score();