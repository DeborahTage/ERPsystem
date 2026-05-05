# Trust Agro Management System - Frontend

React frontend for the Trust Agro Management System. Connects to the Spring Boot backend API.

## Backend Connection

The frontend connects to the Spring Boot backend at `http://localhost:8080` (configurable via `REACT_APP_API_URL`).

### API Layer Structure

```
src/
├── api/
│   ├── axios.js          # Axios instance with JWT interceptors
│   └── index.js          # API service functions
├── context/
│   └── AuthContext.js    # Authentication state & token management
├── hooks/
│   ├── useApi.js         # Data fetching hooks with loading/error states
│   └── index.js          # Hook exports
└── components/common/
    ├── ErrorAlert.js     # Reusable error display
    └── LoadingSpinner.js # Reusable loading indicator
```

### Authentication Flow

1. **Login**: `POST /api/auth/login` → Stores JWT in `localStorage`
2. **Token Usage**: Axios interceptor adds `Authorization: Bearer <token>` header
3. **Auto Logout**: 401 responses clear storage and redirect to `/login`
4. **Current User**: `GET /api/auth/me` validates token on app load

### Phase 1 API Endpoints Used

| Feature | Endpoint | Component |
|---------|----------|-----------|
| Dashboard Stats | `GET /api/farms`, `/api/flocks`, `/api/daily-farm-records` | Dashboard.js |
| Farm List | `GET /api/farms` | FarmList.js |
| Create Farm | `POST /api/farms` | FarmForm.js |
| Flock List | `GET /api/flocks` | FlockList.js |
| Create Flock | `POST /api/flocks` | FlockForm.js |
| Daily Records | `GET/POST /api/daily-farm-records` | DailyFarmRecordList.js, DailyFarmRecordForm.js |

### Environment Variables

```
REACT_APP_API_URL=http://localhost:8080
```

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
