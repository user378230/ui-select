#!/bin/bash
set -e # exit with nonzero exit code if anything fails

echo ${TRAVIS_SECURE_ENV_VARS}

COMMIT_ID="$(git rev-parse --short HEAD)"

mkdir docs-out;

# go to the out directory and create a *new* Git repo
cd docs-out
git clone "https://${GH_KEY}@${GH_REF}" . -b ${GH_PAGES_BRANCH} --single-branch --depth=1

git checkout ${GH_PAGES_BRANCH}

# clear out everything
git rm -rf .
git clean -fxd

# get new content
cp ../docs/* . -R

git add .

# inside this git repo we'll pretend to be a new user
git config user.name "Travis CI"
git config user.email "travisci@users.noreply.github.com"

# The first and only commit to this new Git repo contains all the
# files present with the commit message "Deploy to GitHub Pages".
git commit -m "docs(all) new deployment (ref: angular-ui/ui-select@${COMMIT_ID})"

# Force push from the current repo's master branch to the remote
# repo's gh-pages branch. (All previous history on the gh-pages branch
# will be lost, since we are overwriting it.) We redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push origin --quiet 
#"https://${GH_KEY}@${GH_REF}" master:gh-pages2 > /dev/null 2>&1