async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    alert("Login failed");
    return;
  }

  const data = await res.json();
  localStorage.setItem("token", data.access_token);

  // Decode JWT payload
  const payload = JSON.parse(atob(data.access_token.split(".")[1]));
  const role = payload.role;

  // Show dashboard
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  // Show video stream (ESP32 stream URL)
  document.getElementById("cameraStream").src = "http://192.168.4.1:81/stream";

  // Show admin controls if role = admin
  if (role === "admin") {
    document.getElementById("adminControls").style.display = "block";
  }
}

async function toggleLed() {
  const token = localStorage.getItem("token");
  const res = await fetch("/esp32/control?pin=2&state=toggle", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  alert(data.message);
}
