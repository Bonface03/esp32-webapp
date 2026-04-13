// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const welcomeMessage = document.getElementById('welcomeMessage');
const updateTimeElement = document.getElementById('updateTime');

// Tab elements
const homeTab = document.getElementById('homeTab');
const aboutTab = document.getElementById('aboutTab');
const productsTab = document.getElementById('productsTab');
const contactTab = document.getElementById('contactTab');
const livestreamTab = document.getElementById('livestreamTab');

// Card elements
const homeCard = document.getElementById('home');
const aboutCard = document.getElementById('about');
const productsCard = document.getElementById('products');
const contactCard = document.getElementById('contact');
const livestreamCard = document.getElementById('livestream');
const adminControlsCard = document.getElementById('adminControls');

// Search elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// ============ STREAMING VARIABLES ============
let streamSocket = null;
let isStreaming = false;
let frameTimes = [];
let esp32IP = ""; // Prevent ReferenceError in legacy init
function detectESP32() {} // Prevent ReferenceError for removed function
function updateStream() {} // Prevent ReferenceError

// ============ AUDIO VARIABLES ============
let audioSocket = null;
let isAudioConnected = false;
let audioContext = null;
let audioInputSource = null;
let audioProcessor = null;
let nextPlayTime = 0;
let captureStream = null;

// ============ STREAMING ELEMENTS ============
// These will be initialized when needed
let startStreamBtn = null;
let stopStreamBtn = null;
let captureBtn = null;
let streamPlaceholder = null;
let streamDisplay = null;
let streamLoading = null;
let cameraStream = null;
let connectionStatus = null;
let streamStats = null;
let esp32IPInput = null;
let detectBtn = null;
let qualitySelect = null;
let resolutionSelect = null;
let fpsSelect = null;
let liveIndicator = null;
let resolutionIndicator = null;
let deviceIP = null;
let streamQuality = null;
let photoPreview = null;
let capturedPhoto = null;
let downloadBtn = null;
let closePreviewBtn = null;
let toggleLEDBtn = null;
let rebootBtn = null;
let calibrateBtn = null;

// Voice GUI 
let joinVoiceBtn = null;
let leaveVoiceBtn = null;
let voiceStatusIndicator = null;
let voiceUsersSpan = null;

// Initialize the application
function init() {
    console.log('VTA Surgery Dashboard initialized');

    // Set up event listeners
    setupEventListeners();

    // Always show login page first
    loginPage.style.display = 'flex';
    dashboardPage.style.display = 'none';

    // Focus on username input
    usernameInput.focus();

    // Start time updater
    updateTime();
    setInterval(updateTime, 60000); // Update every minute
}

// Set up all event listeners
function setupEventListeners() {
    // Login button
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }

    // Logout button
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // Tab navigation
    if (homeTab) homeTab.addEventListener('click', () => switchTab('home'));
    if (aboutTab) aboutTab.addEventListener('click', () => switchTab('about'));
    if (productsTab) productsTab.addEventListener('click', () => switchTab('products'));
    if (contactTab) contactTab.addEventListener('click', () => switchTab('contact'));
    if (livestreamTab) livestreamTab.addEventListener('click', handleLivestreamTab);

    // Search functionality
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Handle Enter key in password field
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
}

// Update current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString();

    if (updateTimeElement) {
        updateTimeElement.textContent = `${dateString} ${timeString}`;
    }
}

// Handle login
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    console.log('Login attempt for:', username);

    // Basic validation
    if (!username) {
        alert('Please enter username');
        usernameInput.focus();
        return;
    }

    if (!password) {
        alert('Please enter password');
        passwordInput.focus();
        return;
    }

    // Determine user role
    const isAdmin = username.toLowerCase() === 'admin';
    const role = isAdmin ? 'Administrator' : 'Medical Staff';

    // Update welcome message
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${username}! You are now logged in as ${role}.`;
    }

    // Show admin controls if admin
    if (adminControlsCard) {
        adminControlsCard.style.display = isAdmin ? 'block' : 'none';
    }

    // Hide login page, show dashboard
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'block';

    // Reset login form
    usernameInput.value = '';
    passwordInput.value = '';

    // Show home tab by default
    switchTab('home');

    // Update time
    updateTime();

    console.log(`User ${username} logged in successfully as ${role}`);
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Stop any active stream
        if (isStreaming) {
            stopStream();
        }

        // Show login page, hide dashboard
        loginPage.style.display = 'flex';
        dashboardPage.style.display = 'none';

        // Reset to home tab
        switchTab('home');

        // Focus on username field
        usernameInput.focus();

        console.log('User logged out');
    }
}

// Handle livestream tab click
function handleLivestreamTab() {
    switchTab('livestream');
    initStreaming(); // Initialize streaming only when tab is clicked
}

// Initialize streaming functionality
function initStreaming() {
    // Don't re-initialize if already done
    if (window.streamingInitialized) return;

    console.log('Initializing streaming functionality...');

    // Get streaming elements
    startStreamBtn = document.getElementById('startStreamBtn');
    stopStreamBtn = document.getElementById('stopStreamBtn');
    captureBtn = document.getElementById('captureBtn');
    streamPlaceholder = document.getElementById('streamPlaceholder');
    streamDisplay = document.getElementById('streamDisplay');
    streamLoading = document.getElementById('streamLoading');
    cameraStream = document.getElementById('cameraStream');
    connectionStatus = document.getElementById('connectionStatus');
    streamStats = document.getElementById('streamStats');
    esp32IPInput = document.getElementById('esp32IP');
    detectBtn = document.getElementById('detectBtn');
    qualitySelect = document.getElementById('qualitySelect');
    resolutionSelect = document.getElementById('resolutionSelect');
    fpsSelect = document.getElementById('fpsSelect');
    liveIndicator = document.getElementById('liveIndicator');
    resolutionIndicator = document.getElementById('resolutionIndicator');
    deviceIP = document.getElementById('deviceIP');
    streamQuality = document.getElementById('streamQuality');
    photoPreview = document.getElementById('photoPreview');
    capturedPhoto = document.getElementById('capturedPhoto');
    downloadBtn = document.getElementById('downloadBtn');
    closePreviewBtn = document.getElementById('closePreviewBtn');
    toggleLEDBtn = document.getElementById('toggleLEDBtn');
    rebootBtn = document.getElementById('rebootBtn');
    calibrateBtn = document.getElementById('calibrateBtn');

    // Init Voice UI
    joinVoiceBtn = document.getElementById('joinVoiceBtn');
    leaveVoiceBtn = document.getElementById('leaveVoiceBtn');
    voiceStatusIndicator = document.getElementById('voiceStatusIndicator');
    voiceUsersSpan = document.getElementById('voiceUsersSpan');

    // Check if streaming elements exist
    if (!startStreamBtn) {
        console.error('Streaming elements not found!');
        return;
    }

    // Try to get saved ESP32 IP
    const savedIP = localStorage.getItem('esp32IP');
    if (savedIP && esp32IPInput) {
        esp32IPInput.value = savedIP;
        esp32IP = savedIP;
    }

    // Set up streaming event listeners
    detectBtn?.addEventListener('click', detectESP32);
    startStreamBtn.addEventListener('click', startStream);
    stopStreamBtn.addEventListener('click', stopStream);
    captureBtn?.addEventListener('click', capturePhoto);

    // Quality controls
    qualitySelect?.addEventListener('change', updateStreamQuality);
    resolutionSelect?.addEventListener('change', updateStreamQuality);
    fpsSelect?.addEventListener('change', updateStreamQuality);

    // Photo preview controls
    closePreviewBtn?.addEventListener('click', () => {
        if (photoPreview) photoPreview.style.display = 'none';
    });

    downloadBtn?.addEventListener('click', downloadPhoto);

    // Admin controls
    toggleLEDBtn?.addEventListener('click', toggleLED);
    rebootBtn?.addEventListener('click', rebootDevice);
    calibrateBtn?.addEventListener('click', calibrateCamera);

    // Voice UI Event Listeners
    joinVoiceBtn?.addEventListener('click', joinVoiceChat);
    leaveVoiceBtn?.addEventListener('click', leaveVoiceChat);

    // Handle image load errors
    if (cameraStream) {
        cameraStream.addEventListener('error', function () {
            if (isStreaming) {
                console.log('Stream frame error, retrying...');
                setTimeout(() => {
                    if (isStreaming) {
                        const quality = qualitySelect ? qualitySelect.value : '10';
                        const resolution = resolutionSelect ? resolutionSelect.value : '5';
                        loadFrame(quality, resolution);
                    }
                }, 1000);
            }
        });
    }

    // Handle page visibility change
    document.addEventListener('visibilitychange', function () {
        if (document.hidden && isStreaming) {
            // Pause stream when tab is not visible
            if (streamInterval) {
                clearInterval(streamInterval);
                streamInterval = null;
            }
        } else if (!document.hidden && isStreaming && window.startStream) {
            // Resume stream when tab becomes visible
            // Since it's a websocket, we simply restart the logic by simulating a stop/start
            stopStream();
            setTimeout(startStream, 500);
        }
    });

    window.streamingInitialized = true;
    console.log('Streaming functionality initialized');
}


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

// ============ VOICE CHAT SYSTEM ============

async function joinVoiceChat() {
    try {
        captureStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/audio`;
        audioSocket = new WebSocket(wsUrl);
        audioSocket.binaryType = 'arraybuffer';
        
        audioSocket.onopen = () => {
            isAudioConnected = true;
            if (joinVoiceBtn) joinVoiceBtn.disabled = true;
            if (leaveVoiceBtn) leaveVoiceBtn.disabled = false;
            if (voiceStatusIndicator) voiceStatusIndicator.innerHTML = `<i class="fas fa-circle status-online"></i> Connected to Channel`;
            showNotification('Joined Voice Chat', 'success');
            
            // Setup Web Audio API
            audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            nextPlayTime = audioContext.currentTime + 0.1;
            
            // Mute the local playback of your own microphone
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;
            
            audioInputSource = audioContext.createMediaStreamSource(captureStream);
            audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            
            audioInputSource.connect(audioProcessor);
            audioProcessor.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // PCM format conversion: Float32 to Int16
            audioProcessor.onaudioprocess = (e) => {
                if (!isAudioConnected) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }
                
                if (audioSocket && audioSocket.readyState === WebSocket.OPEN) {
                    audioSocket.send(pcm16.buffer);
                }
            };
        };
        
        audioSocket.onmessage = async (event) => {
            if (!audioContext || !isAudioConnected) return;
            try {
                // PCM format conversion: Int16 to Float32
                const int16Array = new Int16Array(event.data);
                const float32Array = new Float32Array(int16Array.length);
                for (let i = 0; i < int16Array.length; i++) {
                    float32Array[i] = int16Array[i] / 32768;
                }
                
                const audioBuffer = audioContext.createBuffer(1, float32Array.length, 16000);
                audioBuffer.getChannelData(0).set(float32Array);
                
                const playSource = audioContext.createBufferSource();
                playSource.buffer = audioBuffer;
                playSource.connect(audioContext.destination);
                
                // Seamless scheduling
                if (nextPlayTime < audioContext.currentTime) {
                    nextPlayTime = audioContext.currentTime + 0.05;
                }
                playSource.start(nextPlayTime);
                nextPlayTime += audioBuffer.duration;
            } catch (err) {
                console.error("Audio decode error:", err);
            }
        };
        
        audioSocket.onclose = () => {
            leaveVoiceChat();
        };
        
    } catch (err) {
        console.error("Microphone access denied or error:", err);
        showNotification('Microphone access required for Voice Chat', 'error');
    }
}

function leaveVoiceChat() {
    isAudioConnected = false;
    
    if (audioProcessor) {
        audioProcessor.disconnect();
        audioProcessor = null;
    }
    if (audioInputSource) {
        audioInputSource.disconnect();
        audioInputSource = null;
    }
    if (captureStream) {
        captureStream.getTracks().forEach(track => track.stop());
        captureStream = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    if (audioSocket) {
        audioSocket.close();
        audioSocket = null;
    }
    
    if (joinVoiceBtn) joinVoiceBtn.disabled = false;
    if (leaveVoiceBtn) leaveVoiceBtn.disabled = true;
    if (voiceStatusIndicator) voiceStatusIndicator.innerHTML = `<i class="fas fa-circle status-offline"></i> Disconnected`;
    if (voiceUsersSpan) voiceUsersSpan.textContent = '';
    
    showNotification('Left Voice Chat', 'info');
}

// Update stream quality
function updateStreamQuality() {
    if (isStreaming && streamInterval) {
        const quality = qualitySelect ? qualitySelect.value : '10';
        const resolution = resolutionSelect ? resolutionSelect.value : '5';
        const fps = fpsSelect ? fpsSelect.value : '50';

        updateStream(quality, resolution, fps);
        showNotification('Stream quality updated', 'info');
    }
}

// Capture a photo
async function capturePhoto() {
    if (!isStreaming) return;

    const resolution = resolutionSelect ? resolutionSelect.value : '5';
    const timestamp = Date.now();

    try {
        showNotification('Capturing photo...', 'info');

        // Capture high quality photo
        if (capturedPhoto) {
            capturedPhoto.src = `http://${esp32IP}/capture?q=2&r=${resolution}&t=${timestamp}`;
        }

        // Show preview
        if (photoPreview) {
            photoPreview.style.display = 'flex';
        }

        showNotification('Photo captured!', 'success');

    } catch (error) {
        console.error('Capture error:', error);
        showNotification('Failed to capture photo', 'error');
    }
}

// Download captured photo
function downloadPhoto() {
    if (!capturedPhoto || !capturedPhoto.src) return;

    const link = document.createElement('a');
    link.href = capturedPhoto.src;
    link.download = `esp32-capture-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper functions for streaming
function getResolutionName(res) {
    const resolutions = {
        '10': 'QVGA',
        '8': 'VGA',
        '7': 'SVGA',
        '6': 'XGA',
        '5': 'HD',
        '3': 'UXGA'
    };
    return resolutions[res] || 'Unknown';
}

function getQualityName(q) {
    const qualities = {
        '20': 'Fast',
        '15': 'Balanced',
        '10': 'Good',
        '5': 'High',
        '2': 'Best'
    };
    return qualities[q] || 'Unknown';
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ============ EXISTING FUNCTIONS ============

// Switch between tabs
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);

    // Remove active class from all tabs
    [homeTab, aboutTab, productsTab, contactTab, livestreamTab].forEach(tab => {
        if (tab) tab.classList.remove('active');
    });

    // Add active class to clicked tab
    switch (tabId) {
        case 'home':
            if (homeTab) homeTab.classList.add('active');
            break;
        case 'about':
            if (aboutTab) aboutTab.classList.add('active');
            break;
        case 'products':
            if (productsTab) productsTab.classList.add('active');
            break;
        case 'contact':
            if (contactTab) contactTab.classList.add('active');
            break;
        case 'livestream':
            if (livestreamTab) livestreamTab.classList.add('active');
            break;
    }

    // Hide all cards
    [homeCard, aboutCard, productsCard, contactCard, livestreamCard].forEach(card => {
        if (card) card.style.display = 'none';
    });

    // Show selected card
    switch (tabId) {
        case 'home':
            if (homeCard) homeCard.style.display = 'block';
            break;
        case 'about':
            if (aboutCard) aboutCard.style.display = 'block';
            break;
        case 'products':
            if (productsCard) productsCard.style.display = 'block';
            break;
        case 'contact':
            if (contactCard) contactCard.style.display = 'block';
            break;
        case 'livestream':
            if (livestreamCard) livestreamCard.style.display = 'block';
            break;
    }
}

// Handle search
function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        alert('Please enter a search term');
        return;
    }

    // Search through cards
    const cards = [homeCard, aboutCard, productsCard, contactCard, livestreamCard];
    const cardTitles = ['Home', 'About Us', 'Products', 'Contact Us', 'Livestream'];

    let foundIndex = -1;

    // First check card titles
    for (let i = 0; i < cardTitles.length; i++) {
        if (cardTitles[i].toLowerCase().includes(query)) {
            foundIndex = i;
            break;
        }
    }

    // If not found in titles, check card content
    if (foundIndex === -1) {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i] && cards[i].textContent.toLowerCase().includes(query)) {
                foundIndex = i;
                break;
            }
        }
    }

    // Navigate to found section
    if (foundIndex !== -1) {
        const tabIds = ['home', 'about', 'products', 'contact', 'livestream'];
        switchTab(tabIds[foundIndex]);

        // Highlight search term (simplified)
        alert(`Found in ${cardTitles[foundIndex]} section`);

        // Clear search input
        searchInput.value = '';
    } else {
        alert('No matching sections found');
    }
}

// Admin control functions (updated for ESP32)
function toggleLED() {
    if (!esp32IP) {
        showNotification('Please connect to ESP32 first', 'error');
        return;
    }

    try {
        // Create a simple GET request for LED toggle
        const img = new Image();
        img.src = `http://${esp32IP}/led?state=toggle&t=${Date.now()}`;
        showNotification('LED toggled', 'success');
    } catch (error) {
        showNotification('Failed to toggle LED', 'error');
    }
}

function rebootDevice() {
    if (!esp32IP) {
        showNotification('Please connect to ESP32 first', 'error');
        return;
    }

    if (confirm('Are you sure you want to reboot the ESP32 device?')) {
        try {
            const img = new Image();
            img.src = `http://${esp32IP}/reboot?t=${Date.now()}`;
            showNotification('ESP32 rebooting... Please wait 30 seconds.', 'info');

            // Stop stream if active
            if (isStreaming) {
                stopStream();
            }
        } catch (error) {
            showNotification('Reboot command sent', 'info');
        }
    }
}

function calibrateCamera() {
    if (!esp32IP) {
        showNotification('Please connect to ESP32 first', 'error');
        return;
    }

    try {
        const img = new Image();
        img.src = `http://${esp32IP}/calibrate?t=${Date.now()}`;
        showNotification('Camera calibration started', 'success');
    } catch (error) {
        showNotification('Failed to calibrate camera', 'error');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Debug info
console.log('App.js loaded successfully');