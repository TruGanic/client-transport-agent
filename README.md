# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



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
│   └── store/                    # Zuztand store for state management
