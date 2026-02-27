// ==UserScript==
// @name               Libib - Custom status indicator style
// @name:it            Libib - Stile indicatore stato personalizzato
// @description        Set a custom color and style for libib.com item status indicator and more
// @description:it     Modifica i colori e lo stile dell'indicatore dello stato di un oggetto di libib.com
// @author             JetpackCat
// @namespace          https://github.com/JetpackCat-IT/libib-custom-status-style
// @supportURL         https://github.com/JetpackCat-IT/libib-custom-status-style/issues
// @icon               https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style/img/icon_64.png
// @version            3.0.0
// @license            GPL-3.0-or-later; https://raw.githubusercontent.com/JetpackCat-IT/libib-custom-status-style/master/LICENSE
// @match              https://www.libib.com/library
// @run-at             document-idle
// @grant              GM.getValue
// @grant              GM.setValue
// @grant              GM.xmlHttpRequest
// @connect            libib-sync.jetpackcat.workers.dev
// @downloadURL https://update.greasyfork.org/scripts/526007/Libib%20-%20Custom%20status%20indicator%20style.user.js
// @updateURL https://update.greasyfork.org/scripts/526007/Libib%20-%20Custom%20status%20indicator%20style.meta.js
// ==/UserScript==

(function () {
  "use strict";
  const STATUS_SETTINGS_ICONS = {
    "cog": "https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/assets/cog.svg",
    "cloudUp": "https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/assets/cloud-up.svg",
    "cloudDown": "https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/assets/cloud-down.svg",
    "trash": "https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/assets/trash.svg",
    "crossedEye": "https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/assets/crossed-eye.svg",
    "eye": "https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/assets/eye.svg"
  }
  const CLOUD_SYNC_URL = "https://libib-sync.jetpackcat.workers.dev/";

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const STATUS_SETTINGS_FIELDS = [
    {"id": "type", "label": "Indicator type", "default": "Triangle", "inputId": "status-settings-indicator-type", "inputType": "select", "options": ["Triangle", "Border"]},
    {"id": "trianglePosition", "label": "Triangle position", "default": "Top left", "inputId": "status-settings-triangle-position", "inputType": "select", "options": ["Top left", "Top right", "Bottom left", "Bottom right"]},
    {"id": "borderPosition", "label": "Border position", "default": "Bottom", "inputId": "status-settings-border-position", "inputType": "select", "options": ["Top", "Bottom"]},
    {"id": "borderHeight", "label": "Border height", "default": 5, "inputId": "status-settings-border-height", "inputType": "number"},
    {"id": "colorNotBegun", "label": '"Not begun" color', "default": "#ffffff", "inputId": "status-settings-color-notbegun", "inputType": "color"},
    {"id": "colorCompleted", "label": '"Completed" color', "default": "#76eb99", "inputId": "status-settings-color-completed", "inputType": "color"},
    {"id": "colorProgress", "label": '"In progress" color', "default": "#ffec8a", "inputId": "status-settings-color-inprogress", "inputType": "color"},
    {"id": "colorAbandoned", "label": '"Abandoned" color', "default": "#ff7a7a", "inputId": "status-settings-color-abandoned", "inputType": "color"},
    {"id": "blurGroups", "label": "Blur all covers from specified groups (separated by \";\")", "default": "", "inputId": "status-settings-blurgroups", "inputType": "text"},
    {"id": "noBlurOnHover", "label": "Disable blur on hover", "default": false, "inputId": "status-settings-nobluronhover", "inputType": "checkbox"}
  ];

   // For cover blur
  let BLUR_GROUPS = [];

  let settingsCleanupTimeout = null;
  let hasInternalHistory = false;

  const statusSettingsInit = async () => {
    const JSONConfig = await getJSONConfigFromGM();
    const css = await generateCSS(JSONConfig);
    setCustomStyle(css);
    BLUR_GROUPS = JSONConfig.blurGroups;
    loadBlurredCovers(JSONConfig);
  }

  // Get libib sidebar menu. The settings button will be added to the sidebar
  const libibSidebarMenu = document.getElementById("primary-menu");

  // General CSS
  const scriptCssStyle = `
    .button-icon, .button-icon:hover {
      &.cloud-up {
        background-image: url(${STATUS_SETTINGS_ICONS.cloudUp}) !important;
      }
      &.cloud-down {
        background-image: url(${STATUS_SETTINGS_ICONS.cloudDown}) !important;
      }
      &.cloud-delete {
        background-image: url(${STATUS_SETTINGS_ICONS.trash}) !important;
      }
      background-repeat: no-repeat !important;
      background-position: left 20px center !important;
      background-size: 18px auto !important;
      padding-left: 50px !important;
    }

    .status-settings-detail-container {
      display: grid;
    }

    .status-settings-detail-body {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .status-settings-items {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-weight: 700;
        padding-left: 3px;
        margin: 0;
      }
    }

    .status-settings-preview {
      width: 100%;
      box-sizing: border-box;
      text-align: center;

      .item-group {
        background: none;
        padding-left: 0px;
        padding-right: 0px;
        display: flex;
        justify-content: center;
      }

      .cover {
          max-width: 100%;
          height: auto;
          box-sizing: border-box;
      }
    }

    #status-settings-preview-item {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }

    @media (max-width: 600px) {
      .status-settings-detail-container {
        .jump-save-wrapper {
            flex-direction: column;
        }

        .jump-save-wrapper .button {
            width: 100%; /* On mobile take 100% width */
            margin-bottom: 5px !important;
        }
      }
    }

    @media (min-width: 768px) {
      .status-settings-detail-body {
        flex-direction: row;
      }

      .status-settings-items {
        flex: 2;
      }

      .status-settings-preview {
        flex: 1;
      }
    }

    #libib-status-settings-link>a {
        text-decoration: underline;
        user-select: none;
    }
    ul#primary-menu li#libib-status-settings-link a.active  {
        text-indent: 0px; !important;
    }
    ul#primary-menu li#libib-status-settings-link:hover a.active  {
        text-indent: 35px !important;
    }
    li#libib-status-settings-link a:hover {
        background: url('${STATUS_SETTINGS_ICONS.cog}') no-repeat left 40px center #fff;
        background-size: 20px auto;
    }
    .dark li#libib-status-settings-link a:hover {
        background: url('${STATUS_SETTINGS_ICONS.cog}') no-repeat left 40px center #1b1b1b;
        background-size: 20px auto;
    }
  `;

  const generateSettingsHTML = () => {
    // Input container structure
    let html = `
      <div class="status-settings-detail-container">
        <div class="status-settings-detail-header">
          <div id="status-settings-close-btn" class="close"></div>
        </div>
        <div class="status-settings-detail-body">
          <div class="status-settings-items">
    `;

    // Loop array to generate input fields
    STATUS_SETTINGS_FIELDS.forEach(field => {
      html += '<div class="status-settings-item">';

      if (field.inputType === "checkbox") {
        html += `<label>${field.label} <input id="${field.inputId}" type="checkbox" /></label>`;
      } else {
        // Standard structure for input/select
        html += `<label>${field.label}</label>`;

        if (field.inputType === "select") {
          html += `<select id="${field.inputId}">`;
          field.options.forEach(opt => {
            html += `<option value="${opt}">${opt}</option>`;
          });
          html += "</select>";
        } else {
          // Text, Number and Color
          html += `<input id="${field.inputId}" type="${field.inputType}" />`;
        }
      }

      html += "</div>";
    });

    // Close structure, add preview divs and buttons
    html += `
          </div>
          <div class="status-settings-preview">
            <p>Live preview</p>
            <div id="status-settings-preview-item"></div>
          </div>
        </div>
        <div class="jump-save-wrapper" style="display: flex; gap: 10px; margin-top: 10px;">
          <button id="status-settings-save-btn" class="button">Save</button>
          <button id="status-settings-copy-settings-btn" class="button secondary">Copy settings</button>
          <button id="status-settings-paste-settings-btn" class="button secondary">Paste settings</button>
        </div>
        <div class="status-settings-items">
          <div class="status-settings-item">
              <label>Cloud Sync ID</label>
              <small class="help-text">Save this ID or paste one you already have to sync across other devices</small>
              <input id="status-settings-sync-id" type="text">
          </div>
        </div>
        <small>By syncing, your UI preferences and this anonymous ID are securely stored on the cloud. No personal Libib data is collected. 
              <a href="https://jetpackcat-it.github.io/libib-custom-status-style/" target="_blank">Read Privacy Policy</a>.</small>
        <div class="jump-save-wrapper" style="display: flex; gap: 10px; margin-top: 10px;">
          <button id="status-settings-cloud-save-btn" class="button button-icon cloud-up">Save and Sync to Cloud</button>
          <button id="status-settings-cloud-load-btn" class="button secondary button-icon cloud-down">Load from Cloud</button>
          <button id="status-settings-cloud-delete-btn" class="button delete button-icon cloud-delete">Delete from Cloud</button>
        </div>
      </div>
    `;

    return html;
  };

  const getJSONConfigFromGM = async () => {
    let JSONConfig = {};

    for (const item of STATUS_SETTINGS_FIELDS)
        JSONConfig[item.id] = await GM.getValue(item.id, item.default);

    return JSONConfig;
  }

  const setGMFromJSONConfig = async (JSONConfig) => {
    if (JSONConfig == null) return;

    for (const item of STATUS_SETTINGS_FIELDS)
         await GM.setValue(item.id, JSONConfig[item.id] ?? item.default);
  }

  const getJSONConfigFromInputs = () => {
    const JSONConfig = {};

    STATUS_SETTINGS_FIELDS.forEach( item => {
      if(item.inputType != "checkbox")
        JSONConfig[item.id] = document.getElementById(item.inputId).value;
      else
        JSONConfig[item.id] = document.getElementById(item.inputId).checked;
    });

    return JSONConfig;

  }

  const setInputValuesFromGM = async () => {
    for (const item of STATUS_SETTINGS_FIELDS) {
      if(item.inputType != "checkbox")
        document.getElementById(item.inputId).value = await GM.getValue(item.id, item.default);
      else
        document.getElementById(item.inputId).checked = await GM.getValue(item.id, item.default);
    }
  }

  const setInputValuesFromJSONConfig = (JSONConfig) => {
    if (JSONConfig == null) return;

    for (const item of STATUS_SETTINGS_FIELDS) {
      if(item.inputType != "checkbox")
        document.getElementById(item.inputId).value = JSONConfig[item.id] ?? item.default;
      else
        document.getElementById(item.inputId).checked = JSONConfig[item.id] ?? item.default;
    }
  }

  // Geretate CSS based on saved settings
  const generateCSS = async (JSONConfig, preview = false) => {
      if (JSONConfig == null) JSONConfig = await getJSONConfigFromGM();

      const noBlurOnHover = JSONConfig.noBlurOnHover;

      // Set array with states and associated colors
      const statuses = [
          { name: 'completed', color: JSONConfig.colorCompleted },
          { name: 'in-progress', color: JSONConfig.colorProgress },
          { name: 'abandoned', color: JSONConfig.colorAbandoned },
          { name: 'not-begun', color: JSONConfig.colorNotBegun }
      ];

      let cssStyle = "";

      if(!preview)
        cssStyle += scriptCssStyle;
      // Open wrapper
      cssStyle += preview ? '.status-settings-preview {' : '#library-items-wrapper {';
      // Make libib buttons still clickable
      cssStyle += `
      .quick-edit-link{
          z-index: 10;
      }
      .quick-blur-link{
          position: absolute;
          height: 24px;
          width: 24px;
          top: 5px;
          left: 5px;
          border: none;
          background-color: #fff;
          background-image: url(${STATUS_SETTINGS_ICONS.crossedEye});
          background-repeat: no-repeat;
          background-position: center;
          background-size: 70%;
          opacity: 0;
          border-radius: 100px;
          transition: all 0.3s ease-in-out;
          cursor: pointer;
          text-indent: -99999px;
          z-index: 10;
          &.blurred {
            background-image: url(${STATUS_SETTINGS_ICONS.eye});
          }
      }
      .item.cover:hover .quick-blur-link {
          opacity: 1;
      }
      .batch-select{
          z-index: 10;
      }
      .cover-blur{
          overflow: hidden;
      }
      .cover-blur img{
          filter: blur(8px);
      }`;
      // Disable blur on cover hover
      if(noBlurOnHover){
          cssStyle += `
        .cover-blur:hover img{
          filter: blur(0px);
        }`;
      }
      // Set the save, close and reset buttons color to white id dark mode
      cssStyle += `
      body.dark #libib_status_config_resetLink,body.dark #libib_status_config_saveBtn,body.dark #libib_status_config_closeBtn{
      color:white!important
      }`;
      // --- TRIANGLE STYLE ---
      if (JSONConfig.type == "Triangle") {

        // Mapping triangle positions and colors
        const positionSettings = {
            "Top left": {
                position: "top: 0; left: 0; bottom: auto; right: auto;",
                colorShorthand: (color) => `border-color: ${color} transparent transparent ${color};`
            },
            "Top right": {
                position: "top: 0; right: 0; bottom: auto; left: auto;",
                colorShorthand: (color) => `border-color: ${color} ${color} transparent transparent;`
            },
            "Bottom right": {
                position: "bottom: 0; right: 0; top: auto; left: auto;",
                colorShorthand: (color) => `border-color: transparent ${color} ${color} transparent;`
            },
            "Bottom left": {
                position: "bottom: 0; left: 0; top: auto; right: auto;",
                colorShorthand: (color) => `border-color: transparent transparent ${color} ${color};`
            }
        };

        // Get position from settings
        const currentPosition = positionSettings[JSONConfig.trianglePosition];

        // Set triangle position
        cssStyle += `
          .cover .cover-wrapper::after {
              ${currentPosition.position}
          }
          `;

        // Dynamically create color classes
        statuses.forEach(status => {
            cssStyle += `
            .cover .${status.name}.cover-wrapper::after {
                ${currentPosition.colorShorthand(status.color)}
            }
            `;
        });
      // --- BORDER STYLE ---
      } else if (JSONConfig.type == "Border") {
          // The box-shadow prevents the click on the item, so it needs to be hidden on hover
          cssStyle += `
          .cover-wrapper {
              --shadow-y: ${JSONConfig.borderPosition == "Top" ? '' : '-'}${JSONConfig.borderHeight}px;
          }
          .cover-wrapper:hover::after {
              display:none!important;
              --shadow-y: 0px;
              transition: all 0.25s;
              transition-behavior: allow-discrete;
           }`;

          cssStyle += `
          .cover .cover-wrapper::before, .cover .cover-wrapper::after {
              width: 100%;
              height: 100%;
              border-radius: 4px;
              display: block;
              border: none;
              z-index: 0;
          }
          `;
        statuses.forEach(status => {
            cssStyle += `
            .cover .${status.name}.cover-wrapper::after {
                box-shadow: inset 0px var(--shadow-y) ${status.color};
            }
            `;
        });
      }
      // Close wrapper
      cssStyle += '}';

      return cssStyle;
  };

  // Create the element to open the settings, it needs to be an <a> tag inside an <li> tag
  const settingsButtonA = document.createElement("a");
  settingsButtonA.appendChild(
      document.createTextNode("Status settings")
  );

  // Create <li> element and insert the <a> element inside
  const settingsButtonLi = document.createElement("li");
  settingsButtonLi.id = "libib-status-settings-link"
  settingsButtonLi.appendChild(settingsButtonA);

  // Assign click event handler to open the settings' panel
  settingsButtonLi.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    // If click is performed by a user, register that we are now inside the site
    // this is useful to know if we can perform history.back() or not
    // Ex. If we came directly on the page with the #custom-settings in the url
    // we can't perform a history.back
    if (event.isTrusted) {
        hasInternalHistory = true;
    }

    const detailsViewContainer = document.getElementById("item-details-view");
    if (!detailsViewContainer) return;

    // Check if custom panel is currently visible
    const isSettingsActive = window.location.hash.includes("custom-settings");

    // If custom panel is visible, close it
    // Use isTrusted becouse this should happen only if clicked manually, not simulated
    if (isSettingsActive && event.isTrusted) {
      if (hasInternalHistory) {
          window.history.back(); // Go back in history
        } else {
          // Entered from external link, clean the url and manually close the panel
          window.history.pushState(null, "", window.location.pathname + window.location.search);
          statusSettingsCleanup();
        }
        return;
    }

    const existingPanel = document.getElementById("libib-custom-settings-panel");

    // Make sure to actually remove the custom panel
    // Keeping it might create problems such as page refresh
    if (existingPanel) {
        existingPanel.remove();
    }

    // Hide libib's HTML (DO NOT remove childrens or libib will break)
    Array.from(detailsViewContainer.children).forEach(child => {
      if (child.id !== "libib-custom-settings-panel") { // Do not hide my panel
          child.style.display = "none";
      }
    });

    // Create a new panel
    const myPanel = document.createElement("div");
    myPanel.id = "libib-custom-settings-panel";
    // Set HTML only in this div
    myPanel.innerHTML = generateSettingsHTML(); 
    detailsViewContainer.appendChild(myPanel);

    await setInputValuesFromGM();

    // Load Sync ID (if empty, create one) and load 
    const currentSyncId = await getSyncId();
    const syncIdInput = document.getElementById("status-settings-sync-id");
    if (syncIdInput) syncIdInput.value = currentSyncId;

    const copyDestination = document.getElementById("status-settings-preview-item");

    const populatePreview = (sourceBook) => {
      if(!copyDestination) return;
      // Clean destination div
      copyDestination.innerHTML = "";

      // Create base book template
      const baseBook = sourceBook.cloneNode(true)
  
      // Remove useless elements
      baseBook.querySelectorAll("div, span").forEach(item => item.remove());
      // Remove all classes from book element (needed to remove 'completed', 'abandoned', ecc.)
      baseBook.className = "cover-wrapper";

      const bookStates = [
        { label: "Not begun", classes: ["not-begun"] },
        { label: "In progress", classes: ["in-progress"] },
        { label: "Completed", classes: ["completed"] },
        { label: "Abandoned", classes: ["abandoned"] },
        { label: "Blurred", classes: ["not-begun", "cover-blur"] }
      ];

      // Create fragment to insert elemento into the DOM
      const documentFragment = document.createDocumentFragment();
  
      bookStates.forEach(state => {
        // Cover wrapper container
        const bookFather = document.createElement("div");
        bookFather.classList.add("item", "cover", "book", "preview");
  
        // Book cover
        const bookCover = baseBook.cloneNode(true);
        bookCover.classList.add(...state.classes);
  
        // Laber of the preview item
        const labelContainer = document.createElement("div");
        labelContainer.classList.add("item-group");
  
        const labelSpan = document.createElement("span");
        labelSpan.textContent = state.label;
        labelContainer.appendChild(labelSpan);
  
        // Merge all items
        bookFather.appendChild(bookCover);
        bookFather.appendChild(labelContainer);
  
        documentFragment.appendChild(bookFather);
  
      });
      // Add fragment to the DOM
      copyDestination.appendChild(documentFragment);
    }

    //Copy book element to use as preview
    const bookElement = document.querySelector(".cover-wrapper:not(.preview .cover-wrapper)");

    if (bookElement) {
      // If covers are already loaded populate the preview
      populatePreview(bookElement);
    } else {
      // If covers still have to load wait for them to load, then pupulate the preview
      if (copyDestination)
        copyDestination.innerHTML = "<span style='margin-top:20px; font-style: italic;'>Loading preview...</span>";

      // Create an obserber waiting for covers to load
      const previewObserver = new MutationObserver((mutations, obs) => {
          const newBook = document.querySelector(".cover-wrapper:not(.preview .cover-wrapper)");
          if (newBook) {
              obs.disconnect(); // Cover found → Disable observer
              populatePreview(newBook); // Populate preview
          }
      });
      
      // Start observer
      previewObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Apply preview CSS
    const JSONConfig = await getJSONConfigFromGM();
    const css = await generateCSS(JSONConfig, true);
    setCustomStyle(css, true);

    // Set click event on close button
    // Libib will automatically close the panel when detecting history.back
    // This feels more native, but it might break if libib changes how this works
    const closeBtn = document.getElementById("status-settings-close-btn");
    if(closeBtn) closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (hasInternalHistory) {
        window.history.back();
      } else {
        // If entered from direct link, clear the url and manually close panel
        window.history.pushState(null, "", window.location.pathname + window.location.search);
        statusSettingsCleanup();
      }
    });
    // Open settings windows
    detailsViewContainer.classList.add("open");

    // Add hash to browser history
    // Do not add "+ window.location.search" to avoid conflict with libib's logic with the panel
    if (!window.location.hash.includes("custom-settings")) {
        window.history.pushState(null, "", window.location.pathname + "#custom-settings");
    }

    // Hide menu on mobile
    const libibSidebar = document.getElementById("left-sidebar");
    if (libibSidebar) libibSidebar.classList.remove("show-menu");
  });

  // Handle the panel "closing"
  // Sometimes it should not close but only remove the custom settings panel
  const statusSettingsCleanup = () => {
    const detailsViewContainer = document.getElementById("item-details-view");
    if (!detailsViewContainer) return;
    
    // If the location contains "id=" we should not close the panel as it will be used to display libib item's details
    if (!window.location.search.includes("id=")) {
      detailsViewContainer.classList.remove("open");
    }

    if (settingsCleanupTimeout) clearTimeout(settingsCleanupTimeout);

    settingsCleanupTimeout = setTimeout(() => {
      // Check if user went back to panel
      if (window.location.hash.includes("custom-settings")) return;

      // Remove custom panel div to avoid showing when libib's detail opens
      const myPanel = document.getElementById("libib-custom-settings-panel");
      if (myPanel) myPanel.remove();

      // Respore libib's div visibility
      Array.from(detailsViewContainer.children).forEach(child => {
          child.style.display = ""; 
      });

    }, 400);
  }

  // Add <li> element to the sidebar
  libibSidebarMenu.appendChild(settingsButtonLi);

  // Create a container for the configuration elements
  const configContainer = document.createElement("div");
  document.body.appendChild(configContainer);

  const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error("Failed to copy text: ", err);
        return false;
    }
    return true;
  }

  const readFromClipboard = async () => {
      return await navigator.clipboard.readText();
  }

  // Apply blur to initial loaded covers
  const loadBlurredCovers = async (JSONConfig) => {
    if (JSONConfig == null) JSONConfig = await getJSONConfigFromGM();

    // Remove old blur (except from preview items)
    //document.querySelectorAll(".cover-blur:not(.preview .cover-blur)").forEach(el => el.classList.remove("cover-blur"));

    // Remove "blurred" class from blur button
    //document.querySelectorAll(".quick-blur-link").forEach(el => el.classList.remove("blurred"));

    // Get groups to blur from config
    const blurGroupsString = JSONConfig.blurGroups || "";
    // Create array of groups
    const blurGroups = blurGroupsString.split(";").map(g => g.trim()).filter(g => g.length > 0);

    // Update "BLUR_GROUPS" global variable
    BLUR_GROUPS = blurGroups;

    // Early exit if there are groups to blur
    //if (blurGroups.length === 0) return;

    // Get all items in the DOM
    const allItemGroups = document.querySelectorAll('.item-group:not(.preview .item-group)');

    // Loop through DOM items
    allItemGroups.forEach(itemGroup => {
      const groupName = itemGroup.textContent.trim();
      // Check if group name is in the array
      const needsBlur = blurGroups.includes(groupName);

      // Get parent of item
      const parent = itemGroup.parentNode;
      // Set the "cover-blur" class to the right element
      const coverWrapper = parent.querySelector('.cover-wrapper') || parent.firstChild;
      if (coverWrapper){
        const haveBlur = coverWrapper.classList.contains("cover-blur");
        // Change DOM only if the state is changed to prevent page crash (oops)
        if (needsBlur && !haveBlur) {
            coverWrapper.classList.add("cover-blur");
            const blurBtn = coverWrapper.querySelector('.quick-blur-link');
            if (blurBtn) blurBtn.classList.add("blurred");
        } 
        else if (!needsBlur && haveBlur) {
            coverWrapper.classList.remove("cover-blur");
            const blurBtn = coverWrapper.querySelector('.quick-blur-link');
            if (blurBtn) blurBtn.classList.remove("blurred");
        }
      }
    });
  };

  const setCustomStyle = (css, preview = false) => {
      // Remove existing style if present
      let id = "libib-custom-status-indicator-style";
      if(preview) id += "-preview";
      const existingStyle = document.getElementById(id);
      if (existingStyle != null) {
          existingStyle.remove();
      }

      // Add style tag to document
      document.head.append(
          Object.assign(document.createElement("style"), {
              type: "text/css",
              id: id,
              textContent: css,
          })
      );
  };

  // Generate UUID for Cloud Sync
  const generateUUID = () => {
      if (crypto.randomUUID) {
          return crypto.randomUUID();
      }
      // Fallback if crypto.randomUUID is not available
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      });
  };

  // Get UUID from GM storage or generate new if not found
  const getSyncId = async () => {
      let syncId = await GM.getValue("syncId", "");
      if (!syncId) {
          syncId = generateUUID();
          await GM.setValue("syncId", syncId);
      }
      return syncId;
  };

  // Save settings to cloud
  const saveToCloud = async (syncId, JSONConfig) => {
      return new Promise((resolve, reject) => {
          GM.xmlHttpRequest({
              method: "POST",
              url: CLOUD_SYNC_URL + syncId,
              headers: { "Content-Type": "application/json" },
              data: JSON.stringify(JSONConfig),
              onload: (response) => {
                  if (response.status === 200) resolve();
                  else reject(response.responseText || "Sync error");
              },
              onerror: (err) => reject("Network error")
          });
      });
  };

  // Get settings from cloud
  const loadFromCloud = async (syncId) => {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
          method: "GET",
          url: CLOUD_SYNC_URL + syncId,
          onload: (response) => {
            if (response.status === 200) {
              try {
                  resolve(JSON.parse(response.responseText));
              } catch (e) {
                  reject("Data not valid");
              }
            } else if (response.status === 404) {
              reject("Data not found with this Sync ID");
            } else {
              reject("Server error or invalid Sync ID");
            }
          },
          onerror: (err) => reject("Network error")
      });
    });
  };

  // Delete settings from cloud
  const deleteFromCloud = async (syncId) => {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: "DELETE",
        url: CLOUD_SYNC_URL + syncId,
        onload: (response) => {
          if (response.status === 200) resolve();
          else reject("Server error or invalid Sync ID");
        },
        onerror: (err) => reject("Network error")
      });
    });
  };

  // Listen to settings change to edit live preview
  document.addEventListener("change", async (event) => {
    // Check if event is from setting's input
    const isSettingInput = STATUS_SETTINGS_FIELDS.some(item => item.inputId === event.target.id);
    if (isSettingInput) {
        const JSONConfig = getJSONConfigFromInputs();
        const css = await generateCSS(JSONConfig, true);
        setCustomStyle(css, true);
    }
  });

  // Click event on "Save" button
  document.addEventListener("click", async (event) => {
    // -- SAVE LOCALLY --
    if(event.target.matches("#status-settings-save-btn"))
    {
      const JSONConfig = getJSONConfigFromInputs();
      setGMFromJSONConfig(JSONConfig);
      statusSettingsInit();
      window.history.back();
      notification("Custom settings saved!", "notification-success");
    }
    // -- SAVE IN CLOUD --
    else if (event.target.matches("#status-settings-cloud-save-btn"))
    {
      const modalResult = await customModal("Upload your settings to the Cloud?", "Upload", "modal-confirm");
      if(!modalResult)
        return;

      const syncIdInput = document.getElementById("status-settings-sync-id").value.trim();
      const JSONConfig = getJSONConfigFromInputs();
      
      // Validate UUID before send
      if (!UUID_REGEX.test(syncIdInput)) {
          notification("Invalid Sync ID format! Must be a valid UUID.", "notification-error");
          return;
      }

      try {
          // Save locally both Sync ID and settings
          await GM.setValue("syncId", syncIdInput);
          setGMFromJSONConfig(JSONConfig);
          
          // Send to cloud
          await saveToCloud(syncIdInput, JSONConfig);
          notification("Settings saved to Cloud!", "notification-success");
      } catch (err) {
          notification("Error: " + err, "notification-error");
      }
    }
    // --- LOAD FROM CLOUD ---
    else if (event.target.matches("#status-settings-cloud-load-btn"))
    {
      const modalResult = await customModal("Load from Cloud and overwrite local settings?", "Confirm", "modal-confirm");
      if(!modalResult)
        return;

      const syncIdInput = document.getElementById("status-settings-sync-id").value.trim();
      
      if (!UUID_REGEX.test(syncIdInput)) {
          notification("Invalid Sync ID format!", "notification-error");
          return;
      }

      try {
          // Download from cloud
          const JSONConfig = await loadFromCloud(syncIdInput);
          
          // If download is succesfull, overwrite everything saved localltìy
          await GM.setValue("syncId", syncIdInput);
          setGMFromJSONConfig(JSONConfig);
          
          // Update css
          setInputValuesFromJSONConfig(JSONConfig);
          const cssPreview = await generateCSS(JSONConfig, true);
          const css = await generateCSS(JSONConfig, false);
          setCustomStyle(cssPreview, true);
          setCustomStyle(css, false);
          
          notification("Settings loaded from Cloud!", "notification-success");
      } catch (err) {
          notification("Error: " + err, "notification-error");
      }
    }
    // --- DELETE FROM CLOUD ---
    else if (event.target.matches("#status-settings-cloud-delete-btn")) {

      const modalResult = await customModal("Delete your saved settings from the Cloud?", "Delete", "modal-delete");
      if (!modalResult)
          return;

      const syncIdInput = document.getElementById("status-settings-sync-id").value.trim();
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(syncIdInput)) {
          notification("Invalid Sync ID format!", "notification-error");
          return;
      }

      try {
          // Chiama il Worker con il metodo DELETE
          await deleteFromCloud(syncIdInput);
          notification("Data successfully deleted from Cloud!", "notification-success");
      } catch (err) {
          notification("Error: " + err, "notification-error");
      }
    }
    // -- COPY TO CLIPBOARD --
    else if(event.target.matches("#status-settings-copy-settings-btn"))
    {
      const JSONConfig = await getJSONConfigFromGM();
      const copyResult = await copyToClipboard(JSON.stringify(JSONConfig));
      copyResult ? notification("Settings copied to clipboard!", "notification-success") : notification("Failed to copy", "notification-error");
    }
    // -- PASTE FROM CLIPBOARD --
    else if(event.target.matches("#status-settings-paste-settings-btn"))
    {
      let JSONConfig = {};
      const settings = await readFromClipboard();

      try {
        JSONConfig = JSON.parse(settings);
      } catch (ex) {
        notification("Error while reading settings from clipboard", "notification-error");
        return;
      }
      setInputValuesFromJSONConfig(JSONConfig);

      const css = await generateCSS(JSONConfig, true);
      setCustomStyle(css, true);
      notification("Settings pasted from clipboard!", "notification-success");
    }
  });

  // Add the item group to the 'blurGroups' if not present, if already present remove it
  const toggleBlurForGroup = async (div) => {
    div.preventDefault();
    div.stopPropagation();
    // Search for the span containing the item group
    const span = div.target.parentNode.parentNode.querySelectorAll(".item-group>span");
    if(span.length != 1) return;

    // Create array from blurredGroups string
    let blurredGroupsString = await GM.getValue("blurGroups", "");
    if(blurredGroupsString == null) return;
    let blurredGroups = blurredGroupsString.split(";");
    let itemGroup = span[0].innerText;
    const index = blurredGroups.indexOf(itemGroup);
    // If item found, remove it
    if(index > -1) blurredGroups.splice(index, 1);
    // If not found, add to array
    else blurredGroups.push(itemGroup);

    // Save to settings
    await GM.setValue("blurGroups", blurredGroups.join(";"));
    loadBlurredCovers();
  }
  // Create the button for flagging groups to blur
  const createSetBlurButton = (isBlurred) => {
      const newDiv = document.createElement("div");
      newDiv.classList.add("quick-blur-link");
      if(isBlurred)
        newDiv.classList.add("blurred");
      newDiv.title = "Toggle blur for group";
      newDiv.addEventListener("click",toggleBlurForGroup);
      return newDiv;
  }
  // Check if the item needs to be blurred based on the group
  const divNeedsBlur = (coverNode) => {
    if (BLUR_GROUPS.length === 0) return false;

    const groupElement = coverNode.querySelector('.item-group');
    if (!groupElement) return false;

    return BLUR_GROUPS.includes(groupElement.textContent.trim());
  };

  // Run when new books get loaded on the page
  // Check new nodes
  const findDivInNode = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === "div") {
      // Check if new div is actually a cover
      if (node.classList.contains('cover') && !node.classList.contains('preview')) {
        // Find cover wrapper element
        const coverWrapper = node.querySelector('.cover-wrapper') || node.firstChild;
        if(coverWrapper) {
          const needsBlur = divNeedsBlur(node);
          // Add flag element only if not already present
          if (!coverWrapper.querySelector('.quick-blur-link')) {
            coverWrapper.appendChild(createSetBlurButton(needsBlur));
          }
          
          // Apply blur if necessary
          if (needsBlur) {
            coverWrapper.classList.add("cover-blur");
          }
        }
      }
    }
  }

  // "Promisifing" libib's modal to avoid callback hell. This might break if libib changes how modals work
  const customModal = (message, buttonText, modalClass) => {
    return new Promise((resolve) => {
      // Libib's original method
      modal(
        message, 
        buttonText, 
        modalClass, 
        () => resolve(true),  // Confirm callback returns "true"
        () => resolve(false)  // Confirm callback returns "false"
      );
    });
  };

  // Setup observer
  const blurObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
              findDivInNode(node);
          }
      }
  });

  // Start observer
  blurObserver.observe(document.body, { childList: true, subtree: true });

  // Listen for changes in history to handle panel show/close
  window.addEventListener("popstate", () => {
    hasInternalHistory = true;
    const myPanel = document.getElementById("libib-custom-settings-panel");
    const detailsViewContainer = document.getElementById("item-details-view");
    
    // If the user goes to the settings panel URL
    if (window.location.hash.includes("custom-settings")) {
      // If the panel is missing, we create it
      if (!myPanel){
        document.getElementById("libib-status-settings-link").click();

        // This is needed to avoid libib from closing the panel
        // when navigating back and forth betweenlibib's detail panel
        // and the custom settings panel
        if (detailsViewContainer) {
          detailsViewContainer.classList.add("open");
          const keepOpenInterval = setInterval(() => {
            detailsViewContainer.classList.add("open");
          }, 10);
          
          // Automatically disable the loop after 200ms
          setTimeout(() => clearInterval(keepOpenInterval), 200);
        }
      }
    } 
    // If the user goes away from the settings panel URL
    else {
      // If the panel is still present, we clean it
      if (myPanel) statusSettingsCleanup();
    }
  });

  statusSettingsInit();

  // On first load, if url contains #custom-settings, open the custom panel
  if (window.location.hash.includes("custom-settings"))
    document.getElementById("libib-status-settings-link").click();

})();