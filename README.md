# TruGanic Agent 🚛🌱

**TruGanic Agent** is a specialized food traceability mobile application designed for logistics agents. It connects farmers to transportation hubs, ensuring organic certification integrity through secure, offline-first data collection.

**Key Tech Stack:**
* **Framework:** React Native (Expo SDK 52)
* **Language:** TypeScript
* **Database:** SQLite (local-first) with Drizzle ORM
* **Connectivity:** Bluetooth Low Energy (BLE) via `react-native-ble-plx`
* **Architecture:** Expo Router (File-based routing)

---

## 🚀 Prerequisites

Before you begin, ensure you have the following installed on your machine:

1.  **Node.js** (LTS version recommended, e.g., v20+)
2.  **JDK 17** (Required for Android Builds)
3.  **Android Studio** (With Android SDK Platform 35 installed)
4.  **Expo CLI:** `npm install -g eas-cli`

---

## 🛠️ Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd truganic-agent
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory (if required by your logic):
    ```env
    EXPO_PUBLIC_API_URL=[https://api.truganic.com](https://api.truganic.com)
    ```

---

## 📱 Running the App

**⚠️ IMPORTANT:** This app uses Native Modules (Bluetooth/SQLite). **You cannot use the standard "Expo Go" app.** You must use a **Development Build**.

### Step 1: Generate the Development Build
This command compiles the native Android code. You only need to run this when you add new native libraries, change `app.json` (icons/names), or switch branches.

```bash
npx expo run:android



```plaintext
client-transport-agent/
├── app/                          # ROOT DIRECTORY FOR EXPO-ROUTER (MANDATORY)
│   ├── (auth)/                   # Grouping: Handles login/registration flow
│   │   ├── index.tsx             # -> /login (Loads component from src/features/auth/)
│   │   └── sign-up.tsx
│   │
│   ├── (main)/                   # Grouping: The main application screens
│   │   ├── _layout.tsx           # Defines the main bottom tabs UI
│   │   ├── index.tsx             # -> / (Loads component from src/screens/HomeScreen.tsx)
│   │   ├── harvesting.tsx        # -> /harvesting (Loads form from src/features/harvesting/)
│   │   └── trip-start.tsx        # -> /trip-start (Loads trip UI from src/features/transport/)
│   │
│   └── _layout.tsx               # Root layout (handles Authentication stack switch)
│
├──                               # Application source code (All business logic and modularity)
│   ├── api/
│   ├── blockchain/
│   ├── components/
│   ├── database/
│   ├── features/                 # ALL the heavy lifting (Forms, Sync Logic, State) remains here.
│   │   ├── auth/                 # Auth logic, but the screen component moved to app/(auth)
│   │   ├── harvesting/
│   │   ├── transport/
│   │   └── sync/
│   ├── hooks/
│   └── store/                    # Zustand store for state management
