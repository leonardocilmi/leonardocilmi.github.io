#!/usr/bin/env node
import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const password = process.env.META_PAGE_PASSWORD;
const sourcePath = process.argv[2] || "meta.html";
const payloadPath = "protected/meta.enc.json";
const lockPagePath = "meta.html";
const cleanLockPagePath = "meta/index.html";

if (!password) {
  console.error("Set META_PAGE_PASSWORD before running this script.");
  process.exit(1);
}

function toBase64(value) {
  return Buffer.from(value).toString("base64");
}

function buildLockPage() {
  return `<!DOCTYPE html><!--  Static lock page generated from the Webflow export.  -->
<html data-wf-page="6246213970916e3f6e1db2d5" data-wf-site="5db20e130ef7f30799118140">
<head>
  <meta charset="utf-8">
  <title>Leonardo Cilmi</title>
  <meta content="Leonardo Cilmi - Product Designer" name="description">
  <meta content="Leonardo Cilmi" property="og:title">
  <meta content="Leonardo Cilmi - Product Designer" property="og:description">
  <meta content="Leonardo Cilmi" property="twitter:title">
  <meta content="Leonardo Cilmi - Product Designer" property="twitter:description">
  <meta property="og:type" content="website">
  <meta content="summary_large_image" name="twitter:card">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <link href="/css/normalize.css" rel="stylesheet" type="text/css">
  <link href="/css/webflow.css" rel="stylesheet" type="text/css">
  <link href="/css/leonardocilmi.webflow.css" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin="anonymous">
  <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
  <script type="text/javascript">WebFont.load({  google: {    families: ["Open Sans:300,300italic,400,400italic,600,600italic,700,700italic,800,800italic"]  }});</script>
  <script type="text/javascript">!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);</script>
  <link href="/images/favicon.png" rel="shortcut icon" type="image/x-icon">
  <link href="/images/webclip.png" rel="apple-touch-icon">
  <script>
document.addEventListener("DOMContentLoaded", function(){
  var videos = document.querySelectorAll("video");
  videos.forEach(function(video){
    video.volume = 0;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "muted");
  });
  if (videos[0]) {
    var playPromise = videos[0].play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function(){});
    }
  }
});
  </script>
</head>
<body class="body-5">
  <div class="utility-page-wrap">
    <div class="utility-page-content w-password-page w-form">
      <form id="meta-lock-form" name="meta-lock-form" data-name="Meta Lock Form" class="utility-page-form w-password-page">
        <div class="div-block-3 newlock">
          <div class="div-block-3 newlock">
            <div class="text">
              <div class="lockbg lockpage"><img src="/images/lock.png" loading="lazy" width="24" alt="" class="lockicon"></div>
              <a href="#" class="nav-item newlock">Protected page</a>
              <div class="bio-text newlock">Reach out for access</div>
            </div>
          </div>
        </div><input class="pwfield w-password-page w-input" autofocus maxlength="256" name="pass" data-name="field" placeholder="Password" type="password" id="field" autocomplete="current-password"><input type="submit" data-wait="Please wait..." class="submit-button w-password-page w-button" value="Enter">
        <a href="/index.html" class="returnhometext cs small-lock-page">&larr;</a>
        <a href="mailto:leonardocilmi@gmail.com?subject=Hi" class="button-2 w-button">Request Access</a>
        <div class="error-message w-password-page w-form-fail" aria-live="polite">
          <div class="text-block-5">Incorrect password. Please try again.</div>
        </div>
      </form>
    </div>
    <div data-poster-url="/videos/flareweb2-poster-00001.jpg" data-video-urls="/videos/flareweb2-transcode.mp4,/videos/flareweb2-transcode.webm" data-autoplay="true" data-loop="true" data-wf-ignore="true" class="background-video w-background-video w-background-video-atom"><video id="meta-lock-background-video" autoplay loop style="background-image:url(&quot;/videos/flareweb2-poster-00001.jpg&quot;)" muted playsinline data-wf-ignore="true" data-object-fit="cover">
        <source src="/videos/flareweb2-transcode.mp4" data-wf-ignore="true">
        <source src="/videos/flareweb2-transcode.webm" data-wf-ignore="true">
      </video></div>
  </div>
  <script src="/js/jquery-3.5.1.min.js" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
  <script src="/js/webflow.js" type="text/javascript"></script>
  <script>
(function(){
  var form = document.getElementById("meta-lock-form");
  var input = document.getElementById("field");
  var button = form.querySelector("input[type='submit']");
  var error = document.querySelector(".error-message");
  var errorText = document.querySelector(".text-block-5");
  var encoder = new TextEncoder();
  var decoder = new TextDecoder();

  function setError(message) {
    errorText.textContent = message || "Incorrect password. Please try again.";
    error.style.display = "block";
  }

  function clearError() {
    error.style.display = "none";
  }

  function fromBase64(value) {
    var binary = window.atob(value);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function addBaseHref(html) {
    if (/<base\\s/i.test(html)) {
      return html;
    }
    return html.replace(/<head(\\s[^>]*)?>/i, function(match) {
      return match + "\\n  <base href=\\"/\\">";
    });
  }

  async function deriveKey(password, salt, iterations) {
    var material = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: iterations },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  }

  async function unlock(password) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("This browser cannot unlock the protected page.");
    }

    var response = await fetch("/${payloadPath}", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("The protected page could not be loaded.");
    }

    var payload = await response.json();
    var salt = fromBase64(payload.salt);
    var iv = fromBase64(payload.iv);
    var data = fromBase64(payload.data);
    var key = await deriveKey(password, salt, payload.kdf.iterations);
    var decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    document.open();
    document.write(addBaseHref(decoder.decode(decrypted)));
    document.close();
  }

  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    clearError();

    if (!input.value) {
      setError("Enter the password to continue.");
      input.focus();
      return;
    }

    button.value = button.getAttribute("data-wait") || "Please wait...";
    button.disabled = true;

    try {
      await unlock(input.value);
    } catch (error) {
      setError(error.message && error.message.indexOf("protected page") !== -1 ? error.message : "Incorrect password. Please try again.");
      button.value = "Enter";
      button.disabled = false;
      input.select();
      input.focus();
    }
  });
})();
  </script>
  <script>
document.addEventListener("DOMContentLoaded", function(){
  var videos = document.querySelectorAll("video");
  videos.forEach(function(video){
    video.volume = 0;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "muted");
  });
  if (videos[0]) {
    var playPromise = videos[0].play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function(){});
    }
  }
});
  </script>
</body>
</html>
`;
}

const plaintext = await readFile(sourcePath, "utf8");

if (plaintext.includes('id="meta-lock-form"')) {
  console.error(`${sourcePath} already looks like the generated lock page.`);
  process.exit(1);
}

const salt = randomBytes(16);
const iv = randomBytes(12);
const iterations = 310000;
const key = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
const tag = cipher.getAuthTag();

const payload = {
  version: 1,
  cipher: "AES-256-GCM",
  kdf: {
    name: "PBKDF2",
    hash: "SHA-256",
    iterations
  },
  salt: toBase64(salt),
  iv: toBase64(iv),
  data: toBase64(Buffer.concat([encrypted, tag]))
};

await mkdir(dirname(payloadPath), { recursive: true });
await mkdir(dirname(cleanLockPagePath), { recursive: true });
await writeFile(payloadPath, `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(lockPagePath, buildLockPage());
await writeFile(cleanLockPagePath, buildLockPage());

console.log(`Locked ${sourcePath} into ${payloadPath}.`);
