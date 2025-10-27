# Hermes (hermes-frontend)

Front end testing out the ASR functionality

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

#### HTTPS for Remote Access (Microphone Support)

If testing from a remote machine and need microphone access, enable HTTPS:

1. Create `.env.local` from `.env.example`:

```bash
cp env.example .env.local
```

2. Set `QUASAR_DEV_HTTPS=true` in `.env.local`

3. Restart the dev server - it will now run on HTTPS with a self-signed certificate

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
