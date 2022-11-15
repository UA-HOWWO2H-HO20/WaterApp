# Helper to clean the node_modules folder and re-install all dependencies
# Can be run right before starting the server after pulling

# Remove current node modules folder
rm -rf node_modules/

# Remove the lock file
rm package-lock.json

# Run install
npm install --force
#npm audit fix --force
