# CO · VinU website

Static website for the Combinatorial Optimization Research Group at VinUniversity. It is ready to deploy to GitHub Pages: no build step or package manager is required.

## Project structure

```text
assets/
  css/styles.css          Shared site styles
  images/                 Shared logos and research graphics
  js/site.js              Shared rendering and interaction code
members/
  manifest.js             List of member profile files
  _template/              Copyable starter files for new members
  khuuv/                  Current member's profile folder
    profile.js            Default template content
index.html                Group homepage
member.html               Shared default/custom profile shell
```

## Adding a member with the default profile

1. Copy `members/_template` to a new folder, for example `members/hanhnt`.
2. Edit the copied `profile.js`. Fill in the name, role, biography, interests, email, links, and accent color.
3. Open `members/manifest.js` and add the new profile file:

   ```js
   "members/hanhnt/profile.js"
   ```

The member will appear in the homepage directory and will have a profile at `member.html?id=hanhnt`.

## Customizing a personal profile

The default option only requires editing `profile.js`. For a fully custom page, copy `members/_template/custom.html` into the member's folder, edit its HTML, and add this field to that member's `profile.js`:

```js
customPage: "members/hanhnt/custom.html"
```

The custom page is loaded inside the shared profile shell. It can use the shared classes in `assets/css/styles.css`. A member may also add personal images or a stylesheet inside their own folder and reference them from `custom.html`.

## Removing a member

Remove that member's path from `members/manifest.js`. Their folder can then be removed from the repository if it is no longer needed.

## Deploying on GitHub Pages

Push the repository to GitHub, then open **Settings → Pages**, choose **Deploy from a branch**, select the default branch and `/ (root)`, and save. The site will be available at `https://<username>.github.io/<repository>/`.
