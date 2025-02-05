// ==UserScript==
// @name               Libib - Custom status style
// @name:it            Libib - Stile stati personalizzato
// @description        Set a custom color and style for libib.com item status
// @description:it     Modifica i colori e lo stile dello stato di un oggetto di libib.com
// @author             JetpackCat
// @namespace          https://github.com/JetpackCat-IT/libib-custom-status-style
// @supportURL         https://github.com/JetpackCat-IT/libib-custom-status-style/issues
// @version            1.0.0
// @license            GPL-3.0
// @match              https://www.libib.com/library
// @icon               https://www.libib.com/img/favicon.png
// @run-at             document-idle
// @require            https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM.getValue
// @grant              GM.setValue

// ==/UserScript==

(function () {
  "use strict";

  // Get libib sidebar menu. The settings button will be added to the sidebar
  const libib_sidebar_menu = document.getElementById("primary-menu");

  // Create the element, it needs to be an <a> tag inside an <li> tag
  const settings_button_a = document.createElement("a");
  settings_button_a.appendChild(
    document.createTextNode("Reading status settings")
  );

  // Create <li> element and insert <a> element inside
  const settings_button_li = document.createElement("li");
  settings_button_li.appendChild(settings_button_a);

  // Assign click event handler to open the menu settings
  settings_button_li.addEventListener("click", function () {
    gmc.open();
  });

  // Add <li> element to the sidebar
  libib_sidebar_menu.appendChild(settings_button_li);

  // Create a container for the configuration elements
  const config_container = document.createElement("div");
  document.body.appendChild(config_container);

  // Adapt container background color and shadow based on libib theme (dark/light)
  const is_dark_scheme = document.body.classList.contains("dark");
  let background_color = "#fefefe";
  let shadow_color = "#838383";

  if (is_dark_scheme) {
    background_color = "#1b1b1b";
    shadow_color = "#e7e7e7";
  }
  const config_panel_css = `#libib_status_config{padding: 20px !important; background-color: ${background_color}; box-shadow: 0px 0px 9px 3px ${shadow_color}}; `;

  let gmc = new GM_config({
    id: "libib_status_config", // The id used for this instance of GM_config
    title: "Script Settings", // Panel Title
    types: {
      // Create color input type
      color: {
        default: null,
        toNode: function () {
          var field = this.settings,
            value = this.value,
            id = this.id,
            create = this.create,
            slash = null,
            retNode = create("div", {
              className: "config_var",
              id: this.configId + "_" + id + "_var",
              title: field.title || "",
            });

          // Create the field lable
          retNode.appendChild(
            create("label", {
              innerHTML: field.label,
              id: this.configId + "_" + id + "_field_label",
              for: this.configId + "_field_" + id,
              className: "field_label",
            })
          );
          // Create the actual input element
          var props = {
            id: this.configId + "_field_" + id,
            type: "color",
            value: value ?? "",
          };
          // Actually create and append the input element
          retNode.appendChild(create("input", props));
          return retNode;
        },
        toValue: function () {
          let input = document.getElementById(
            `${this.configId}_field_${this.id}`
          );
          return input.value;
        },
        reset: function () {
          let input = document.getElementById(
            `${this.configId}_field_${this.id}`
          );
          input.value = this.default;
        },
      },
    },
    // Fields object
    fields: {
      // This is the id of the field
      type: {
        label: "Reading status type", // Appears next to field
        type: "radio", // Makes this setting a radio field
        options: ["Triangle", "Border"], // Default = triangle
        default: "Triangle", // Default value if user doesn't change it
      },
      // This is the id of the field
      trianglePosition: {
        label: "Triangle position", // Appears next to field
        type: "select", // Makes this setting a select field
        options: ["Top left", "Top right", "Bottom left", "Bottom right"],
        default: "Top left", // Default value if user doesn't change it
      },
      // This is the id of the field
      borderPosition: {
        label: "Border position", // Appears next to field
        type: "select", // Makes this setting a select field
        options: ["Top", "Bottom"],
        default: "Top", // Default value if user doesn't change it
      },
      // This is the id of the field
      colorNotBegun: {
        label: '"Not begun" Color', // Appears next to field
        type: "color", // Makes this setting a text field
        default: "#ffffff", // Default value if user doesn't change it
      },
      // This is the id of the field
      colorCompleted: {
        label: '"Completed" Color', // Appears next to field
        type: "color", // Makes this setting a text field
        default: "#76eb99", // Default value if user doesn't change it
      },
      // This is the id of the field
      colorProgress: {
        label: '"In progress" Color', // Appears next to field
        type: "color", // Makes this setting a text field
        default: "#ffec8a", // Default value if user doesn't change it
      },
      // This is the id of the field
      colorAbandoned: {
        label: '"Abandoned" Color', // Appears next to field
        type: "color", // Makes this setting a text field
        default: "#ff7a7a", // Default value if user doesn't change it
      },
    },
    css: config_panel_css,
    frame: config_container,
    // Callback functions object
    events: {
      init: function () {
        let css = generateCSS(this);
        setCustomStyle(css);
      },
      save: function () {
        let css = generateCSS(this);
        setCustomStyle(css);
        this.close();
      },
    },
  });

  const generateCSS = function (GM_settings) {
    if (GM_settings == null) GM_settings = gmc;

    const not_begun_color = GM_settings.get("colorNotBegun");
    const completed_color = GM_settings.get("colorCompleted");
    const in_progress_color = GM_settings.get("colorProgress");
    const abandoned_color = GM_settings.get("colorAbandoned");

    let css_style = "";
    // Make libib buttons still clickable
    css_style += `
        .quick-edit-link{
            z-index: 10;
        }
        .batch-select{
            z-index: 10;
        }
        `;
    // Set the save, close and reset buttons color to white id dark mode
    css_style += `
        body.dark #libib_status_config_resetLink,body.dark #libib_status_config_saveBtn,body.dark #libib_status_config_closeBtn{
        color:white!important
        }`;

    // Triangle style
    if (GM_settings.get("type") == "Triangle") {
      let triangle_position = GM_settings.get("trianglePosition");
      if (triangle_position == "Top left") {
        css_style += `
            .cover .completed.cover-wrapper::after {
                border-left-color: ${completed_color};
                border-top-color: ${completed_color};
            }
            .cover .in-progress.cover-wrapper::after {
                border-left-color: ${in_progress_color};
                border-top-color: ${in_progress_color};
            }
            .cover .abandoned.cover-wrapper::after {
                border-left-color: ${abandoned_color};
                border-top-color: ${abandoned_color};
            }
            .cover .not-begun.cover-wrapper::after {
                border-left-color: ${not_begun_color};
                border-top-color: ${not_begun_color};
            }
            `;
      } else if (triangle_position == "Top right") {
        css_style += `
                .cover .cover-wrapper::after{
                right: 0;
                left: auto;
                }
            .cover .completed.cover-wrapper::after {
                border-left-color: transparent;
                border-right-color: ${completed_color};
                border-top-color: ${completed_color};
            }
            .cover .in-progress.cover-wrapper::after {
                border-left-color: transparent;
                border-right-color: ${in_progress_color};
                border-top-color: ${in_progress_color};
            }
            .cover .abandoned.cover-wrapper::after {
                border-left-color: transparent;
                border-right-color: ${abandoned_color};
                border-top-color: ${abandoned_color};
            }
            .cover .not-begun.cover-wrapper::after {
                border-left-color: transparent;
                border-right-color: ${not_begun_color};
                border-top-color: ${not_begun_color};
            }
            `;
      } else if (triangle_position == "Bottom left") {
        css_style += `
                .cover .cover-wrapper::after{
                bottom: 0;
                top: auto;
                }
            .cover .completed.cover-wrapper::after {
                border-top-color: transparent;
                border-left-color: ${completed_color};
                border-bottom-color: ${completed_color};
            }
            .cover .in-progress.cover-wrapper::after {
                border-top-color: transparent;
                border-left-color: ${in_progress_color};
                border-bottom-color: ${in_progress_color};
            }
            .cover .abandoned.cover-wrapper::after {
                border-top-color: transparent;
                border-left-color: ${abandoned_color};
                border-bottom-color: ${abandoned_color};
            }
            .cover .not-begun.cover-wrapper::after {
                border-top-color: transparent;
                border-left-color: ${not_begun_color};
                border-bottom-color: ${not_begun_color};
            }
            `;
      } else if (triangle_position == "Bottom right") {
        css_style += `
                .cover .cover-wrapper::after{
                bottom: 0;
                top: auto;
                left: auto;
                right: 0;
                }
            .cover .completed.cover-wrapper::after {
                border-top-color: transparent;
                border-left-color: transparent;
                border-right-color: ${completed_color};
                border-bottom-color: ${completed_color};
            }
            .cover .in-progress.cover-wrapper::after {
                border-top-color: transparent;
                border-left-color: transparent;
                border-right-color: ${in_progress_color};
                border-bottom-color: ${in_progress_color};
            }
            .cover .abandoned.cover-wrapper::after {
                border-top-color: transparent;
                border-left-color: transparent;
                border-right-color: ${abandoned_color};
                border-bottom-color: ${abandoned_color};
            }
            .cover .not-begun.cover-wrapper::after {
                border-top-color: transparent;
                border-left-color: transparent;
                border-right-color: ${not_begun_color};
                border-bottom-color: ${not_begun_color};
            }
            `;
      }
    } else if (GM_settings.get("type") == "Border") {
      let border_position = GM_settings.get("borderPosition");
      // The box-shadow prevents the click on the item, so it needs to be hidden on hover
      css_style += `
            .cover-wrapper {
                --shadow-y: ${border_position == "Top" ? "5px" : "-5px"};
            }
            .cover-wrapper:hover::after {
                display:none!important;
                --shadow-y: 0px;
                transition: all 0.25s;
                transition-behavior: allow-discrete;
             }`;

      css_style += `
            .cover .cover-wrapper::before, .cover .cover-wrapper::after {
                width: 100%;
                height: 100%;
                border-radius: 4px;
                display: block;
                border: none;
                z-index: 0;
            }
            .cover .completed.cover-wrapper::after {
                box-shadow: inset 0px var(--shadow-y) ${completed_color};
            }
            .cover .in-progress.cover-wrapper::after {
                box-shadow: inset 0px var(--shadow-y) ${in_progress_color};
            }
            .cover .abandoned.cover-wrapper::after {
                box-shadow: inset 0px var(--shadow-y) ${abandoned_color};
            }
            .cover .not-begun.cover-wrapper::after {
                box-shadow: inset 0px var(--shadow-y) ${not_begun_color};
            }
            `;
    }
    return css_style;
  };

  const setCustomStyle = function (css) {
    // Remove existing style if present
    const existingStyle = document.getElementById(
      "libib-custom-reading-status-style"
    );
    if (existingStyle != null) {
      existingStyle.remove();
    }

    // Add style tag to document
    document.head.append(
      Object.assign(document.createElement("style"), {
        type: "text/css",
        id: "libib-custom-reading-status-style",
        textContent: css,
      })
    );
  };
})();
