// ===============================
// HELPER: NUMBER TO IPv4
// ===============================

function numberToIP(number) {
    return [
        (number >>> 24) & 255,
        (number >>> 16) & 255,
        (number >>> 8) & 255,
        number & 255
    ].join(".");
}


// ===============================
// IP CALCULATOR
// ===============================

function calculateIP() {

    let input = document.getElementById("ipInput").value.trim();
    let result = document.getElementById("ipResult");

    let parts = input.split("/");

    if (parts.length !== 2) {
        result.innerHTML = "<p>❌ Enter IP/CIDR, example: 192.168.1.10/24</p>";
        return;
    }

    let ip = parts[0];
    let cidr = Number(parts[1]);

    if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
        result.innerHTML = "<p>❌ Invalid CIDR. Use /0 to /32.</p>";
        return;
    }

    let ipParts = ip.split(".");

    if (ipParts.length !== 4) {
        result.innerHTML = "<p>❌ Invalid IPv4 address.</p>";
        return;
    }

    let validIP = ipParts.every(part =>
        /^\d+$/.test(part) &&
        Number(part) >= 0 &&
        Number(part) <= 255
    );

    if (!validIP) {
        result.innerHTML = "<p>❌ Invalid IPv4 address.</p>";
        return;
    }

    ipParts = ipParts.map(Number);

    let mask = cidr === 0
        ? 0
        : (0xFFFFFFFF << (32 - cidr)) >>> 0;

    let ipNumber =
        ((ipParts[0] << 24) >>> 0) +
        (ipParts[1] << 16) +
        (ipParts[2] << 8) +
        ipParts[3];

    let networkNumber = (ipNumber & mask) >>> 0;
    let broadcastNumber =
        (networkNumber | (~mask >>> 0)) >>> 0;

    let network = numberToIP(networkNumber);
    let broadcast = numberToIP(broadcastNumber);
    let subnetMask = numberToIP(mask);

    let hosts;

    if (cidr === 31) {
        hosts = 2;
    } else if (cidr === 32) {
        hosts = 1;
    } else {
        hosts = Math.pow(2, 32 - cidr) - 2;
    }

    let firstHost = cidr <= 30
        ? numberToIP(networkNumber + 1)
        : "N/A";

    let lastHost = cidr <= 30
        ? numberToIP(broadcastNumber - 1)
        : "N/A";

    result.innerHTML =
        "<h4>Result</h4>" +
        "<p><strong>IP Address:</strong> " + ip + "</p>" +
        "<p><strong>CIDR:</strong> /" + cidr + "</p>" +
        "<p><strong>Subnet Mask:</strong> " + subnetMask + "</p>" +
        "<p><strong>Network Address:</strong> " + network + "</p>" +
        "<p><strong>First Host:</strong> " + firstHost + "</p>" +
        "<p><strong>Last Host:</strong> " + lastHost + "</p>" +
        "<p><strong>Broadcast Address:</strong> " + broadcast + "</p>" +
        "<p><strong>Usable Hosts:</strong> " + hosts + "</p>";
}


// ===============================
// SUBNET CALCULATOR
// ===============================

function calculateSubnet() {

    let input = document.getElementById("subnetInput").value.trim();
    let result = document.getElementById("subnetResult");

    let parts = input.split("/");

    if (parts.length !== 2) {
        result.innerHTML = "<p>❌ Enter IP/CIDR, example: 192.168.1.0/26</p>";
        return;
    }

    let ip = parts[0];
    let cidr = Number(parts[1]);

    if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
        result.innerHTML = "<p>❌ Invalid CIDR. Use /0 to /32.</p>";
        return;
    }

    let ipParts = ip.split(".");

    if (ipParts.length !== 4) {
        result.innerHTML = "<p>❌ Invalid IPv4 address.</p>";
        return;
    }

    let validIP = ipParts.every(part =>
        /^\d+$/.test(part) &&
        Number(part) >= 0 &&
        Number(part) <= 255
    );

    if (!validIP) {
        result.innerHTML = "<p>❌ Invalid IPv4 address.</p>";
        return;
    }

    ipParts = ipParts.map(Number);

    let mask = cidr === 0
        ? 0
        : (0xFFFFFFFF << (32 - cidr)) >>> 0;

    let ipNumber =
        ((ipParts[0] << 24) >>> 0) +
        (ipParts[1] << 16) +
        (ipParts[2] << 8) +
        ipParts[3];

    let networkNumber = (ipNumber & mask) >>> 0;

    let broadcastNumber =
        (networkNumber | (~mask >>> 0)) >>> 0;

    let network = numberToIP(networkNumber);
    let broadcast = numberToIP(broadcastNumber);
    let subnetMask = numberToIP(mask);
    let wildcardMask = numberToIP((~mask) >>> 0);

    let totalAddresses = Math.pow(2, 32 - cidr);

    let usableHosts;

    if (cidr === 31) {
        usableHosts = 2;
    } else if (cidr === 32) {
        usableHosts = 1;
    } else {
        usableHosts = totalAddresses - 2;
    }

    let firstHost = cidr <= 30
        ? numberToIP(networkNumber + 1)
        : "N/A";

    let lastHost = cidr <= 30
        ? numberToIP(broadcastNumber - 1)
        : "N/A";

    result.innerHTML =
        "<h4>Subnet Result</h4>" +
        "<p><strong>Network:</strong> " + network + "</p>" +
        "<p><strong>CIDR:</strong> /" + cidr + "</p>" +
        "<p><strong>Subnet Mask:</strong> " + subnetMask + "</p>" +
        "<p><strong>Wildcard Mask:</strong> " + wildcardMask + "</p>" +
        "<p><strong>Total Addresses:</strong> " + totalAddresses + "</p>" +
        "<p><strong>First Host:</strong> " + firstHost + "</p>" +
        "<p><strong>Last Host:</strong> " + lastHost + "</p>" +
        "<p><strong>Broadcast:</strong> " + broadcast + "</p>" +
        "<p><strong>Usable Hosts:</strong> " + usableHosts + "</p>";
}


// ===============================
// DNS LOOKUP
// ===============================

async function dnsLookup() {

    let domain = document.getElementById("dnsInput").value.trim();
    let type = document.getElementById("dnsType").value;
    let result = document.getElementById("dnsResult");

    if (domain === "") {
        result.innerHTML = "<p>❌ Enter a domain name.</p>";
        return;
    }

    result.innerHTML = "<p>🔎 Looking up DNS...</p>";

    try {

        let response = await fetch(
            "https://dns.google/resolve?name=" +
            encodeURIComponent(domain) +
            "&type=" +
            type
        );

        let data = await response.json();

        if (data.Answer) {

            let records = data.Answer.map(record => record.data);

            result.innerHTML =
                "<h4>DNS Result</h4>" +
                "<p><strong>Domain:</strong> " + domain + "</p>" +
                "<p><strong>Record Type:</strong> " + type + "</p>" +
                "<p><strong>Records:</strong><br>" +
                records.join("<br>") +
                "</p>";

        } else {

            result.innerHTML =
                "<p>❌ No " + type + " record found.</p>";
        }

    } catch (error) {

        result.innerHTML =
            "<p>❌ DNS lookup failed.</p>";
    }
}
// ===============================
// PORT REFERENCE
// ===============================

function lookupPort() {

    let port = document.getElementById("portInput").value.trim();
    let result = document.getElementById("portResult");

    const ports = {
        "20": ["FTP Data", "TCP", "File Transfer"],
        "21": ["FTP Control", "TCP", "File Transfer"],
        "22": ["SSH", "TCP", "Secure remote access"],
        "23": ["Telnet", "TCP", "Remote terminal access"],
        "25": ["SMTP", "TCP", "Email transmission"],
        "53": ["DNS", "TCP/UDP", "Domain name resolution"],
        "67": ["DHCP Server", "UDP", "Assign IP addresses"],
        "68": ["DHCP Client", "UDP", "Receive IP addresses"],
        "80": ["HTTP", "TCP", "Web traffic"],
        "110": ["POP3", "TCP", "Email retrieval"],
        "143": ["IMAP", "TCP", "Email access"],
        "443": ["HTTPS", "TCP", "Secure web traffic"],
        "3389": ["RDP", "TCP/UDP", "Remote Desktop"]
    };

    if (!ports[port]) {
        result.innerHTML = "<p>❌ Port not found in the reference.</p>";
        return;
    }

    let info = ports[port];

    result.innerHTML =
        "<h4>Port Result</h4>" +
        "<p><strong>Port:</strong> " + port + "</p>" +
        "<p><strong>Service:</strong> " + info[0] + "</p>" +
        "<p><strong>Protocol:</strong> " + info[1] + "</p>" +
        "<p><strong>Purpose:</strong> " + info[2] + "</p>";
}
// ===============================
// OSI MODEL
// ===============================

function showOSI() {

    let layer = document.getElementById("osiLayer").value;
    let result = document.getElementById("osiResult");

    const osi = {
        "7": ["Application", "HTTP, HTTPS, DNS, FTP", "Provides network services to applications."],
        "6": ["Presentation", "Encryption, Compression, Encoding", "Handles data format, encryption and compression."],
        "5": ["Session", "Sessions, RPC", "Establishes, manages and terminates sessions."],
        "4": ["Transport", "TCP, UDP", "Provides end-to-end communication and transport."],
        "3": ["Network", "IP, ICMP, OSPF", "Handles logical addressing and routing."],
        "2": ["Data Link", "Ethernet, MAC, VLAN", "Handles frames, MAC addresses and local delivery."],
        "1": ["Physical", "Cables, Fiber, Radio", "Transmits raw bits over the physical medium."]
    };

    if (layer === "") {
        result.innerHTML = "<p>❌ Please select an OSI layer.</p>";
        return;
    }

    let info = osi[layer];

    result.innerHTML =
        "<h4>OSI Layer " + layer + "</h4>" +
        "<p><strong>Layer:</strong> " + info[0] + "</p>" +
        "<p><strong>Examples:</strong> " + info[1] + "</p>" +
        "<p><strong>Purpose:</strong> " + info[2] + "</p>";
}
// ===============================
// CCNA QUIZ
// ===============================

let quizQuestions = [
    {
        question: "Which protocol automatically assigns IP addresses?",
        options: ["DNS", "DHCP", "HTTP", "FTP"],
        answer: "DHCP"
    },
    {
        question: "Which port is used by HTTPS?",
        options: ["21", "22", "80", "443"],
        answer: "443"
    },
    {
        question: "Which protocol is used for secure remote access?",
        options: ["FTP", "SSH", "HTTP", "Telnet"],
        answer: "SSH"
    },
    {
        question: "Which OSI layer handles IP addressing?",
        options: ["Application", "Transport", "Network", "Physical"],
        answer: "Network"
    },
    {
        question: "Which routing protocol uses the SPF algorithm?",
        options: ["RIP", "OSPF", "FTP", "DHCP"],
        answer: "OSPF"
    },
    {
        question: "Which device forwards packets between networks?",
        options: ["Switch", "Hub", "Router", "Access Point"],
        answer: "Router"
    },
    {
        question: "What is the default subnet mask of a Class C network?",
        options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.252"],
        answer: "255.255.255.0"
    },
    {
        question: "Which protocol resolves domain names to IP addresses?",
        options: ["DNS", "DHCP", "ARP", "ICMP"],
        answer: "DNS"
    },
    {
        question: "Which protocol is connection-oriented?",
        options: ["UDP", "TCP", "ICMP", "ARP"],
        answer: "TCP"
    },
    {
        question: "Which command commonly tests network reachability?",
        options: ["ping", "mkdir", "ls", "cd"],
        answer: "ping"
    }
];

let currentQuestion = 0;
let score = 0;

function checkQuiz() {

    let answer = document.getElementById("quizAnswer").value;
    let result = document.getElementById("quizResult");

    if (answer === "") {
        result.innerHTML = "<p>❌ Please select an answer.</p>";
        return;
    }

    let correctAnswer = quizQuestions[currentQuestion].answer;

    if (answer === correctAnswer) {
        score++;
        result.innerHTML = "<p>✅ Correct!</p>";
    } else {
        result.innerHTML =
            "<p>❌ Incorrect. Correct answer: " +
            correctAnswer +
            "</p>";
    }

    currentQuestion++;

    if (currentQuestion < quizQuestions.length) {
        result.innerHTML +=
            "<button onclick='nextQuestion()'>Next Question</button>";
    } else {
        result.innerHTML +=
            "<p><strong>🎉 Quiz Finished!</strong></p>" +
            "<p>Your Score: " + score + " / " +
            quizQuestions.length + "</p>";
    }
}

function nextQuestion() {

    let question = quizQuestions[currentQuestion];

    document.querySelector(".tool p:nth-of-type(2)").innerText =
        question.question;

    let select = document.getElementById("quizAnswer");

    select.innerHTML =
        "<option value=''>Select an answer</option>";

    question.options.forEach(option => {

        let optionElement = document.createElement("option");

        optionElement.value = option;
        optionElement.textContent = option;

        select.appendChild(optionElement);
    });

    document.getElementById("quizResult").innerHTML = "";
}
// ===============================
// IPv4 CONVERTER
// ===============================

function convertIPv4() {

    let input = document.getElementById("ipv4Input").value.trim();
    let result = document.getElementById("ipv4Result");

    let parts = input.split(".");

    if (parts.length !== 4) {
        result.innerHTML = "<p>❌ Invalid IPv4 address.</p>";
        return;
    }

    let valid = parts.every(part =>
        /^\d+$/.test(part) &&
        Number(part) >= 0 &&
        Number(part) <= 255
    );

    if (!valid) {
        result.innerHTML = "<p>❌ Invalid IPv4 address.</p>";
        return;
    }

    let binary = parts.map(part =>
        Number(part).toString(2).padStart(8, "0")
    ).join(".");

    result.innerHTML =
        "<h4>IPv4 Result</h4>" +
        "<p><strong>IPv4:</strong> " + input + "</p>" +
        "<p><strong>Binary:</strong> " + binary + "</p>";
}
