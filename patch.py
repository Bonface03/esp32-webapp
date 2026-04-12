import re

with open("c:/Users/BONFACE/Desktop/esp32-webapp-original/frontend/app.js", "r", encoding="utf-8") as f:
    code = f.read()

# Replace variables
code = code.replace(
    'let streamInterval = null;\nlet isStreaming = false;\nlet esp32IP = "";',
    'let streamSocket = null;\nlet isStreaming = false;'
)

new_stream_logic = """
// Start the relay stream
function startStream() {
    if (streamPlaceholder) streamPlaceholder.style.display = 'none';
    if (streamLoading) streamLoading.style.display = 'flex';
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/stream`;
    
    streamSocket = new WebSocket(wsUrl);
    streamSocket.binaryType = 'blob'; // explicitly request Blob objects
    
    streamSocket.onopen = () => {
        if (streamLoading) streamLoading.style.display = 'none';
        if (streamDisplay) streamDisplay.style.display = 'block';
        
        if (startStreamBtn) startStreamBtn.disabled = true;
        if (stopStreamBtn) stopStreamBtn.disabled = false;
        isStreaming = true;
        
        if (connectionStatus) connectionStatus.innerHTML = `<i class="fas fa-circle status-online"></i> Connected to Relay`;
        if (deviceIP) deviceIP.textContent = `Status: Streaming`;
        
        showNotification('Stream started successfully', 'success');
    };
    
    streamSocket.onmessage = (event) => {
        if (event.data instanceof Blob) {
            const url = URL.createObjectURL(event.data);
            if (cameraStream) {
                if (cameraStream.src && cameraStream.src.startsWith('blob:')) {
                    URL.revokeObjectURL(cameraStream.src);
                }
                cameraStream.src = url;
            }
            
            frameTimes.push(performance.now());
            if (frameTimes.length > 30) frameTimes.shift();
            updateStreamStats();
        }
    };
    
    streamSocket.onclose = () => {
        stopStream();
        showNotification('Stream disconnected', 'error');
    };
}

// Update streaming statistics
function updateStreamStats() {
    if (!streamStats) return;
    if (frameTimes.length > 1) {
        const times = [];
        for (let i = 1; i < frameTimes.length; i++) {
            times.push(frameTimes[i] - frameTimes[i - 1]);
        }
        const avgDelay = Math.round(times.reduce((a, b) => a + b) / times.length);
        const avgFPS = Math.round(1000 / avgDelay);
        streamStats.textContent = `FPS: ${avgFPS} | Delay: ${avgDelay}ms`;
    }
}

// Stop the relay stream
function stopStream() {
    if (streamSocket) {
        streamSocket.close();
        streamSocket = null;
    }
    isStreaming = false;
    
    if (streamDisplay) streamDisplay.style.display = 'none';
    if (streamPlaceholder) streamPlaceholder.style.display = 'block';
    if (startStreamBtn) startStreamBtn.disabled = false;
    if (stopStreamBtn) stopStreamBtn.disabled = true;
    
    if (connectionStatus) connectionStatus.innerHTML = `<i class="fas fa-circle status-offline"></i> Disconnected`;
    if (deviceIP) deviceIP.textContent = `Status: Disconnected`;
    if (streamStats) streamStats.textContent = 'FPS: -- | Delay: --ms';
    
    showNotification('Stream stopped', 'info');
}
"""

# Replace from detectESP32 until updateStreamQuality using regex
pattern = re.compile(r'// Auto-detect ESP32 on local network.*?// Update stream quality', re.DOTALL)
res = pattern.sub(new_stream_logic + '\n// Update stream quality', code)

with open("c:/Users/BONFACE/Desktop/esp32-webapp-original/frontend/app.js", "w", encoding="utf-8") as f:
    f.write(res)
