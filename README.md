# CO · VinU website

Static website for the Combinatorial Optimization Research Group at VinUniversity. It is ready to deploy to GitHub Pages: no build step or package manager is required.

## Updating members

Open [`data/members.js`](data/members.js) and edit the `window.GROUP_MEMBERS` array. Copy the example object to add a person, or remove an object to remove a person. Every entry creates a directory card and a profile at `member.html?id=member-slug`.

Each profile gets the default layout automatically. The optional `custom` object lets a member add a short personal section; the rest of the profile can be customized by editing that member's fields. Images can be added by placing them in the repository and setting an image field in the data file, then extending the profile template in `script.js` if needed.

## Deploying on GitHub Pages

Push the repository to GitHub, then open **Settings → Pages**, choose **Deploy from a branch**, select the default branch and `/ (root)`, and save. The site will be available at `https://<username>.github.io/<repository>/`.
