# Reenaxi & Yash

This invitation is a static website. The photographs, illustrations, typefaces and music are bundled. Google Maps opens separately when a guest asks for directions.

## Publish on GitHub Pages

1. Extract the ZIP. Add its contents to the root of the GitHub repository you want to use. Include the hidden `.nojekyll` file and keep the `assets` folder alongside `index.html`.
2. In that repository, open **Settings**, then **Pages**. Under **Build and deployment**, select **Deploy from a branch**, choose the branch containing these files and select **/ (root)**.
3. When GitHub finishes publishing, use **Visit site** to open the invitation and copy its guest link.

If you want a photo to appear when guests share your GitHub Pages link, edit the `og:image` value in `index.html` after publishing. Replace `assets/share.jpg` with the full published address of that file, including the repository folder if present.

The invitation contains personal photos and event details. Anyone with access to the published website can view those details. The Pages site is public by default, including when your GitHub plan lets you build it from a private repository.

[GitHub Pages publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
