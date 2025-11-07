/*
 * Eco Himalayas - Arena Garbage Sensor (ESP32)
 * 
 * Detects waste deposits using light sensor and awards eco-coins
 * Integrates with Arena session system via sessionToken
 * 
 * Hardware:
 * - ESP32 DevKit
 * - LDR/Light sensor module on GPIO 35
 * - LED indicator on GPIO 22
 * 
 * Flow:
 * 1. RPI scans QR → Backend creates Arena session → Token saved to file
 * 2. ESP32 reads sessionToken from serial or HTTP
 * 3. User deposits waste → Light sensor detects
 * 4. ESP32 calls /api/arena/deposit → Backend awards random eco-coins
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>

// ========== WiFi Configuration ==========
const char* ssid = "JioFiber";
const char* password = "987654321000";

// ========== Backend Configuration ==========
// UPDATE THIS to your backend IP and port
const char* BACKEND_URL = "http://10.229.242.109:3000";  // Backend runs on port 3000
const char* DEVICE_API_KEY = "raspberry-pi-eco-device-key";  // Must match backend
const char* DEVICE_ID = "ESP32-HAMIRPUR-01";

// ========== Hardware Pins ==========
#define LIGHT_SENSOR_PIN 35   // LDR module DO -> GPIO35
#define LED_PIN          22   // Indicator LED

// ========== Detection Settings ==========
const int LIGHT_DETECTED = 0;    // LDR output when light detected (0 or 1)
const unsigned long COOLDOWN_MS = 3000;  // 3 seconds between detections

// ========== State Variables ==========
String sessionToken = "";        // Current arena session token
bool inCooldown = false;
unsigned long lastDepositTime = 0;
int lastSensorState = 1;
int depositCount = 0;

// ========== Web Server ==========
WebServer server(80);  // HTTP server on port 80

// ========== Function Declarations ==========
void connectWiFi();
void setupWebServer();
void handleSetToken();
void handleGetStatus();
void sendDeposit();
void checkSerialCommands();
void blinkLED(int times, int delayMs);

// ========== Setup ==========
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  pinMode(LIGHT_SENSOR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("\n==================================================");
  Serial.println("🌱 ECO HIMALAYAS - ARENA GARBAGE SENSOR");
  Serial.println("==================================================");
  Serial.println("Device ID: " + String(DEVICE_ID));
  Serial.println("Backend: " + String(BACKEND_URL));
  Serial.println("==================================================");
  
  connectWiFi();
  setupWebServer();
  
  Serial.println("\n💡 Commands:");
  Serial.println("   TOKEN:your-session-token  - Set session token");
  Serial.println("   TEST                      - Simulate deposit");
  Serial.println("   STATUS                    - Show current status");
  Serial.println("\n💡 HTTP API (Automatic):");
  Serial.println("   POST http://" + WiFi.localIP().toString() + "/set-token");
  Serial.println("   GET  http://" + WiFi.localIP().toString() + "/status");
  Serial.println("\n✅ Ready! Waiting for session token...\n");
  
  blinkLED(3, 200);  // Startup indication
}

// ========== Main Loop ==========
void loop() {
  // Handle HTTP requests
  server.handleClient();
  
  // Check for serial commands
  checkSerialCommands();
  
  // Read sensor
  int sensorState = digitalRead(LIGHT_SENSOR_PIN);
  unsigned long now = millis();
  
  // Release cooldown
  if (inCooldown && (now - lastDepositTime >= COOLDOWN_MS)) {
    inCooldown = false;
    digitalWrite(LED_PIN, LOW);
    Serial.println("✅ Ready for next deposit");
  }
  
  // Detect light (waste deposit): transition from DARK → LIGHT
  bool wasteDetected = (lastSensorState != LIGHT_DETECTED) && 
                       (sensorState == LIGHT_DETECTED);
  
  if (wasteDetected && !inCooldown) {
    // Check if we have a session token
    if (sessionToken.length() == 0) {
      Serial.println("⚠️  Deposit detected but NO SESSION TOKEN!");
      Serial.println("   Waiting for user to scan QR at RPI station...");
      blinkLED(2, 100);
    } else {
      // Valid deposit!
      inCooldown = true;
      lastDepositTime = now;
      digitalWrite(LED_PIN, HIGH);
      
      depositCount++;
      Serial.println("\n🗑️  WASTE DEPOSIT DETECTED! (#" + String(depositCount) + ")");
      
      // Send to backend
      sendDeposit();
    }
  }
  
  lastSensorState = sensorState;
  delay(50);  // Small debounce
}

// ========== WiFi Connection ==========
void connectWiFi() {
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < 10000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi connection failed!");
    Serial.println("   Check SSID and password");
  }
}

// ========== Send Deposit to Backend ==========
void sendDeposit() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected! Skipping backend call.");
    return;
  }
  
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/arena/deposit";
  
  Serial.println("📤 Sending deposit to backend...");
  Serial.println("   URL: " + url);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-api-key", DEVICE_API_KEY);
  
  // Build JSON payload
  String payload = "{";
  payload += "\"sessionToken\":\"" + sessionToken + "\",";
  payload += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"depositType\":\"waste\"";
  payload += "}";
  
  Serial.println("   Payload: " + payload);
  
  int httpCode = http.POST(payload);
  
  Serial.print("   Response: ");
  Serial.println(httpCode);
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("✅ Deposit recorded successfully!");
    Serial.println("   " + response);
    
    // Parse reward (optional - for display)
    int rewardStart = response.indexOf("\"reward\":") + 9;
    if (rewardStart > 8) {
      int rewardEnd = response.indexOf(",", rewardStart);
      String rewardStr = response.substring(rewardStart, rewardEnd);
      Serial.println("🎁 Reward: " + rewardStr + " eco-coins");
    }
    
    blinkLED(3, 100);  // Success indication
    
  } else if (httpCode == 401) {
    Serial.println("❌ Unauthorized - Invalid session token");
    Serial.println("   Session may have expired or is invalid");
    sessionToken = "";  // Clear token
    
  } else if (httpCode == 400) {
    String response = http.getString();
    Serial.println("❌ Bad request: " + response);
    
    if (response.indexOf("expired") >= 0 || response.indexOf("ended") >= 0) {
      Serial.println("   Session has ended. Please scan QR again.");
      sessionToken = "";  // Clear token
    }
    
  } else if (httpCode == 404) {
    Serial.println("❌ Session not found - Please scan QR at RPI");
    sessionToken = "";
    
  } else {
    String response = http.getString();
    Serial.println("❌ Error: " + response);
  }
  
  http.end();
  Serial.println();
}

// ========== Serial Commands ==========
void checkSerialCommands() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command.startsWith("TOKEN:")) {
      sessionToken = command.substring(6);
      Serial.println("✅ Session token updated!");
      Serial.println("   Token: " + sessionToken.substring(0, 20) + "...");
      blinkLED(2, 200);
      
    } else if (command == "TEST") {
      Serial.println("🧪 Testing deposit...");
      if (sessionToken.length() > 0) {
        sendDeposit();
      } else {
        Serial.println("❌ No session token! Set token first with: TOKEN:your-token");
      }
      
    } else if (command == "STATUS") {
      Serial.println("\n==================================================");
      Serial.println("📊 ESP32 STATUS");
      Serial.println("==================================================");
      Serial.println("WiFi: " + String(WiFi.status() == WL_CONNECTED ? "✅ Connected" : "❌ Disconnected"));
      Serial.println("IP: " + WiFi.localIP().toString());
      Serial.println("Backend: " + String(BACKEND_URL));
      Serial.println("Device ID: " + String(DEVICE_ID));
      Serial.println("Session Token: " + String(sessionToken.length() > 0 ? "✅ Set" : "❌ Not Set"));
      if (sessionToken.length() > 0) {
        Serial.println("Token: " + sessionToken.substring(0, 30) + "...");
      }
      Serial.println("Total Deposits: " + String(depositCount));
      Serial.println("Cooldown: " + String(inCooldown ? "🔒 Active" : "✅ Ready"));
      Serial.println("==================================================\n");
      
    } else {
      Serial.println("❌ Unknown command: " + command);
      Serial.println("Available commands: TOKEN:xxx, TEST, STATUS");
    }
  }
}

// ========== Web Server Setup ==========
void setupWebServer() {
  // POST /set-token - Receive token from RPI
  server.on("/set-token", HTTP_POST, handleSetToken);
  
  // GET /status - Get ESP32 status
  server.on("/status", HTTP_GET, handleGetStatus);
  
  // Start server
  server.begin();
  Serial.println("✅ HTTP Server started on port 80");
}

// ========== Handle Set Token (RPI → ESP32) ==========
void handleSetToken() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"No body\"}");
    return;
  }
  
  String body = server.arg("plain");
  Serial.println("\n📡 Received token from RPI:");
  Serial.println("   Body: " + body);
  
  // Parse JSON: {"sessionToken":"xxx"} or {"sessionToken": "xxx"}
  // Try with space first
  int tokenStart = body.indexOf("\"sessionToken\":");
  if (tokenStart == -1) {
    Serial.println("❌ Failed to find 'sessionToken' key");
    server.send(400, "application/json", "{\"error\":\"Missing sessionToken key\"}");
    return;
  }
  
  // Find the opening quote of the value
  tokenStart = body.indexOf("\"", tokenStart + 15);
  if (tokenStart == -1) {
    Serial.println("❌ Failed to find token value start");
    server.send(400, "application/json", "{\"error\":\"Invalid JSON format\"}");
    return;
  }
  
  // Find the closing quote
  int tokenEnd = body.indexOf("\"", tokenStart + 1);
  if (tokenEnd == -1) {
    Serial.println("❌ Failed to find token value end");
    server.send(400, "application/json", "{\"error\":\"Invalid JSON format\"}");
    return;
  }
  
  // Extract token
  sessionToken = body.substring(tokenStart + 1, tokenEnd);
  
  if (sessionToken.length() > 0) {
    Serial.println("✅ Session token auto-updated!");
    Serial.println("   Token: " + sessionToken.substring(0, 20) + "...");
    
    blinkLED(2, 200);
    
    server.send(200, "application/json", "{\"status\":\"success\",\"message\":\"Token received\"}");
  } else {
    Serial.println("❌ Token is empty");
    server.send(400, "application/json", "{\"error\":\"Empty token\"}");
  }
}

// ========== Handle Get Status ==========
void handleGetStatus() {
  String json = "{";
  json += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  json += "\"wifi\":\"" + String(WiFi.status() == WL_CONNECTED ? "connected" : "disconnected") + "\",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  json += "\"hasToken\":" + String(sessionToken.length() > 0 ? "true" : "false") + ",";
  json += "\"depositCount\":" + String(depositCount) + ",";
  json += "\"inCooldown\":" + String(inCooldown ? "true" : "false");
  json += "}";
  
  server.send(200, "application/json", json);
}

// ========== LED Blink Helper ==========
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

