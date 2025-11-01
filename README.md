# Kannada Vedike NITK - Website

Official website for Kannada Vedike NITK Surathkal, showcasing the organization's activities, events, and cultural initiatives.

## 🚀 Technology Stack

- **React 19** - UI Framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **GSAP** - Animations
- **Framer Motion** - Motion library

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/kv-nitk/kv-nitk.github.io.git
cd kv-nitk.github.io
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including React, Vite, Tailwind CSS, and other dependencies.

### 3. Development

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

### 4. Build for Production

Build the optimized production bundle:

```bash
npm run build
```

The build output will be in the `build/` directory.

### 5. Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 📦 Available Scripts

- `npm run dev` or `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🌐 Deployment

The website is deployed on a server at NITK. There are two deployment scripts available:

### Standard Deployment (`deploy.sh`)

Full deployment process including:
- ✅ Pulling latest changes from Git
- ✅ Installing/updating dependencies
- ✅ Building the project
- ✅ Creating backup of current deployment
- ✅ Copying files to web directory
- ✅ Setting proper permissions
- ✅ Testing Nginx configuration
- ✅ Reloading Nginx

**Usage on server:**

```bash
ssh kannadavedike@10.14.0.80
cd ~/kv-nitk.github.io
./deploy.sh
```

Or from anywhere on the server:

```bash
~/kv-nitk.github.io/deploy.sh
```

### Fast Deployment (`deploy-fast.sh`)

`git pull` once before this

Quick deployment without Git operations (use when changes are already on server):
- ✅ Installing dependencies
- ✅ Building the project
- ✅ Copying files to web directory
- ✅ Setting permissions
- ✅ Reloading Nginx

**Usage on server:**

```bash
ssh kannadavedike@10.14.0.80
cd ~/kv-nitk.github.io
./deploy-fast.sh
```

Or:

```bash
~/kv-nitk.github.io/deploy-fast.sh
```

### Deployment Workflow

1. **Make changes locally** and test them
2. **Commit and push** to Git repository
3. **SSH into the server**:
   ```bash
   ssh kannadavedike@10.14.0.80
   ```
4. **Run deployment script**:
   - For full deployment (with Git pull): `~/kv-nitk.github.io/deploy.sh`
   - For fast deployment (no Git pull): `~/kv-nitk.github.io/deploy-fast.sh`
5. **Verify** the website is updated at [http://kannadavedike.nitk.ac.in](http://kannadavedike.nitk.ac.in)

### Deployment Scripts Location

Both scripts are located in the project root:
- `deploy.sh` - Full deployment with Git pull
- `deploy-fast.sh` - Fast deployment without Git pull

## 📁 Project Structure

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## 🎨 Features

- Responsive design for all devices
- Modern UI with animations
- Event gallery with 3D dome view
- Team member showcase
- Parva 2025 event details
- Sponsors section
- Social media integration

## 🔧 Troubleshooting

### Build Issues

If `npm run build` fails:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Issues

If deployment fails:
1. Check Nginx status: `sudo systemctl status nginx`
2. Check Nginx logs: `sudo tail -50 /var/log/nginx/error.log`
3. Verify file permissions: `ls -la /var/www/kannadavedike/kv-nitk.github.io/`
4. Test Nginx config: `sudo nginx -t`

### Port Issues

If port 5173 is in use during development:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Or change port in vite.config.js
```

## 📝 Notes

- Always test locally before deploying
- Keep backups before major updates
- Check website functionality after deployment
- Ensure all images and assets are in the `public/` folder

## 📞 Contact

For issues or questions, contact the Kannada Vedike NITK team.

## 📄 License

This project is for Kannada Vedike NITK internal use.

---

**Website**: [http://kannadavedike.nitk.ac.in](http://kannadavedike.nitk.ac.in)  
**Server IP**: 10.14.0.80
