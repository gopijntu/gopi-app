# KeyGuard Glow

This project is a secure, offline-first password vault for managing bank and card details.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Capacitor

## How to work with this project locally

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## How to build for Android

To build the Android application, follow these steps after setting up your local environment:

1.  **Build the web assets:**
    ```bash
    npm run build
    ```
2.  **Sync the assets with the Android project:**
    ```bash
    npx cap sync android
    ```
3.  **Open the project in Android Studio:**
    ```bash
    npx cap open android
    ```
4.  **Build the APK in Android Studio:**
    -   Once the project is open in Android Studio, you can build the APK using the `Build > Build Bundle(s) / APK(s) > Build APK(s)` menu.

## How to deploy to GitHub Pages

This project can be deployed to GitHub Pages to create a shareable web link.

1.  **Configure the `base` path:**
    -   Before deploying, open `vite.config.ts` and make sure the `base` property matches the name of your GitHub repository. For example, if your repository URL is `https://github.com/your-username/your-repo-name`, the `base` should be set to `'/your-repo-name/'`.

2.  **Deploy:**
    -   Run the following command to build the application and deploy it to GitHub Pages:
        ```bash
        npm run deploy
        ```
    -   This command will create a `gh-pages` branch in your repository and push the built application to it. You may need to enable GitHub Pages in your repository settings to use this branch as the source.
