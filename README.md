# Leonardo Cilmi Portfolio Static Export

This folder is the deployment-ready static copy. Serve it from the folder root with no build command.

Local test:

```sh
python3 -m http.server 3000
```

Known external references intentionally left:

- Social/profile links and the Google Drive case study link.
- Google Analytics / Google Tag Manager.
- Google WebFont loader for Open Sans.
- YouTube/Embedly embeds on art pages.
- Cloudflare Turnstile URL inside Webflow's exported JS, only used if a Webflow form/captcha path is invoked.
- The homepage Cilmi Sans teaser video still points at an older Webflow asset URL because that asset was not included in the export and returned 403 when fetched.
