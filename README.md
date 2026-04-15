# Sessions Marketplace

A full-stack application built with Django (Backend) and React (Frontend), featuring OAuth authentication (GitHub & Google), sessions browsing, and bookings. The application is fully containerized using Docker.

## Setup Steps

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd sessions-marketplace
```

### 2. Set up Environment Variables
Copy the `.env.example` file to create your own configuration:

```bash
cp .env.example .env
```
Inside the `.env` file, make sure to add your specific OAuth client credentials. The other existing defaults are safe for local Docker development.

### 3. Run the Application
Start the whole application (Database, Backend, and Frontend reverse proxied by Nginx) using Docker Compose:

```bash
docker compose up --build
```
This single command builds all necessary containers, applies Django database migrations, collects static files, and loads sample data directly! 

Access the running application:
- **Frontend App:** http://localhost
- **Django Admin Panel:** http://localhost/admin/ (Credentials: Username `admin` / Password `adminpassword`)
- **Backend API:** http://localhost/api/

---

## OAuth Client Setup Instructions

To enable social logins via Google and GitHub:

### GitHub OAuth Setup:
1. Go to your **GitHub Settings** -> **Developer settings** -> **OAuth Apps** -> **New OAuth App**.
2. Set the **Homepage URL** to `http://localhost`.
3. Set the **Authorization callback URL** to `http://localhost/auth/github/callback/`
4. Generate the app. Copy the built `Client ID` and generate a `Client Secret`.
5. Enter them as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in your local `.env` file.

### Google OAuth Setup:
1. Go to the **Google Cloud Console**.
2. Create a new Project or select an existing one. Navigate to **APIs & Services** -> **Credentials**.
3. Configure the **OAuth consent screen** (Internal/External).
4. Create new **OAuth client ID** (Web application type).
5. Set **Authorized JavaScript origins** to `http://localhost`.
6. Set **Authorized redirect URIs** to `http://localhost/auth/google/callback/`.
7. Once created, copy the `Client ID` and `Client Secret` into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your `.env` file.

---

## Example Demo Flow

1. **Login:** Visit `http://localhost` and click the `Login` button in the navbar. You can login securely via Google or GitHub.
2. **Browse Sessions:** Once logged in, navigate the homepage to view various available sessions.
3. **Book a Session:** Click "Details" on an interesting session tile. In the Session Details page, click "Book Session" to secure your spot.
4. **Create a Session:** (If logged in as a Creator), navigate to your dashboard to create a new session listing by filling out the title, duration, capacity, and price!
