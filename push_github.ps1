# First, ensure you have Git installed. If not, go to https://git-scm.com/downloads

# Initialize Git
git init

# Configure your identity
git config --global user.name "zetraplayz"
git config --global user.email "zetrax472@gmail.com"

# Add and commit the project
git add .
git commit -m "Initial commit for Connect Plus"

# Setup the main branch and remote repository
git branch -M main
git remote add origin https://github.com/zetraplayz/codedominators.git

# Push the code to GitHub (This will prompt you to sign in)
git push -u origin main
