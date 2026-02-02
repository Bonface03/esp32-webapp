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

// Stream elements
const startStreamBtn = document.getElementById('startStreamBtn');
const stopStreamBtn = document.getElementById('stopStreamBtn');
const streamPlaceholder = document.getElementById('streamPlaceholder');
const cameraStream = document.getElementById('cameraStream');

// Admin control elements
const toggleLEDBtn = document.getElementById('toggleLEDBtn');
const rebootBtn = document.getElementById('rebootBtn');
const calibrateBtn = document.getElementById('calibrateBtn');

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
    if (livestreamTab) livestreamTab.addEventListener('click', () => switchTab('livestream'));
    
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
    
    // Stream controls
    if (startStreamBtn) {
        startStreamBtn.addEventListener('click', startStream);
    }
    
    if (stopStreamBtn) {
        stopStreamBtn.addEventListener('click', stopStream);
    }
    
    // Admin controls
    if (toggleLEDBtn) {
        toggleLEDBtn.addEventListener('click', toggleLED);
    }
    
    if (rebootBtn) {
        rebootBtn.addEventListener('click', rebootDevice);
    }
    
    if (calibrateBtn) {
        calibrateBtn.addEventListener('click', calibrateCamera);
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
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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

// Switch between tabs
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);
    
    // Remove active class from all tabs
    [homeTab, aboutTab, productsTab, contactTab, livestreamTab].forEach(tab => {
        if (tab) tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    switch(tabId) {
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
    switch(tabId) {
        case 'home':
            if (homeCard) homeCard.style.display = 'flex';
            break;
        case 'about':
            if (aboutCard) aboutCard.style.display = 'flex';
            break;
        case 'products':
            if (productsCard) productsCard.style.display = 'flex';
            break;
        case 'contact':
            if (contactCard) contactCard.style.display = 'flex';
            break;
        case 'livestream':
            if (livestreamCard) livestreamCard.style.display = 'flex';
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

// Stream control functions
function startStream() {
    if (streamPlaceholder) {
        streamPlaceholder.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px; color: #2563eb;"></i>
                <h3>Connecting to ESP32 Camera...</h3>
                <p>Please wait while we establish the connection</p>
            </div>
        `;
        
        // Simulate stream loading
        setTimeout(() => {
            if (streamPlaceholder) {
                streamPlaceholder.style.display = 'none';
            }
            if (cameraStream) {
                cameraStream.style.display = 'block';
                cameraStream.src = 'https://via.placeholder.com/800x450/4A90E2/FFFFFF?text=Live+Surgical+Stream';
                cameraStream.alt = 'Live ESP32 Camera Stream';
                cameraStream.style.width = '100%';
                cameraStream.style.borderRadius = '8px';
            }
        }, 2000);
    }
    
    console.log('Stream started');
}

function stopStream() {
    if (streamPlaceholder) {
        streamPlaceholder.style.display = 'block';
        streamPlaceholder.innerHTML = `
            <i class="fas fa-video-slash"></i>
            <h3>Stream Offline</h3>
            <p>Click "Start" to begin live video feed</p>
        `;
    }
    
    if (cameraStream) {
        cameraStream.style.display = 'none';
        cameraStream.src = '';
    }
    
    console.log('Stream stopped');
}

// Admin control functions
function toggleLED() {
    alert('LED toggled - This would control the ESP32 device');
    console.log('LED control activated');
}

function rebootDevice() {
    if (confirm('Are you sure you want to reboot the ESP32 device?')) {
        alert('Device rebooting... Please wait 30 seconds.');
        console.log('Device reboot initiated');
    }
}

function calibrateCamera() {
    alert('Camera calibration started... This may take a few moments.');
    console.log('Camera calibration initiated');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Debug info
console.log('App.js loaded successfully');