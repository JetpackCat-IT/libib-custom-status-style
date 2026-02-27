# Libib custom status indicator style

A simple UserScript for customization of Libib.com status indicator

> [!WARNING]
> This project is an independent, third-party, open-source userscript created for personal use. It is not affiliated with, associated with, authorized, endorsed by, or in any way officially connected to Libib, or any of its subsidiaries or its affiliates. The official Libib website can be found at https://www.libib.com.
> All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.

## AI Usage Acknowledgment

The core logic, architecture, and overall development of this script are entirely my own work. However, I utilized AI tools as a coding assistant to help optimize specific code snippets (such as the CSS generation and the Cloudflare Worker integration) and to refine the English text in this documentation, as English is not my native language.

## Why did I make this?

Libib.com is a great website to keep track of your collection of books, CDs and other things.
Unfortunately the status indicator's color selection is not great and this makes it hard to see if you already read a book or not.

Here you can see a before and after:

![Before](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/before.png)

![After](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/after.png)

## How to install

1. Install a Userscript Manager like [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/)
2. Install **Libib - Custom status indicator style** by clicking **[here](https://raw.githubusercontent.com/JetpackCat-IT/libib-custom-status-style/main/Libib-Custom-Status-Style.user.js)**

Mirrors:

<a href="https://greasyfork.org/it/scripts/526007-libib-custom-status-indicator-style">
<img src="https://img.shields.io/badge/-greasyfork-950000?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAXNSR0IArs4c6QAAAYdJREFUeNpNkU1LVHEUh3+jn8GdtYg+QOHiCiESBokQFaFQYBFYGAlGZMnQVLNIVFB8uQPqoCPeq+JCdBgUHXUUBF9WioLrOzsXLl0M18v/Uf6oeB44HM554Cx+klQmSaoe8SqD4bA7/BH0+ZWO7OWmxb6kRxmkjjlyLLDFBPdcYjeK2rbesm46IpkanvDRvIm+GgcVrCK1pj+RLzWQp516niJLTelqcu3vIZbNB7L85JQZFkizQj8tzBufhCN538hEi/zlHDhgGP+K/7QxFQ3Q4UmBkElyBsAR4jHCYoQCNYbveE4VGY45AfI84wV1vEb0kAw1frHLfXrpp4teq2wjchSoZ4LJUPFiHJn3tJLE5RX7wBrlNCLzm85AZZ5QJGrRNXvAKnaLPDU7CVKmk2myeGywzi+rrPDZJJAjyXU9ZktLZJkhS4414hxCaZOBlGzFqgq1NJlHUYV5STMZ0xTJ5JnfuROWXFHBA2RpoQGlVH59/We9h9Xf/a5iOpwM/xTH/PbbuC8B++4oDDg4lrsAAAAASUVORK5CYII=" alt="GreasyFork"/>
</a>

## How to use

### Basic settings

1. Access your library on [libib.com](https://libib.com/library)
2. You should see a new menu item on the sidebar called **"Status settings"**

   ![Sidebar settings](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/script-settings-1.png)

3. After clicking it, a panel will open, in this panel you can change the settings as you like

   ![Panel settings](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/script-settings-2.png)

You can choose between **Triangle** (default) or **Border**, you can also choose the position of the indicator.
If you choose the **Border** style, you can also choose the thickness

Here are all the possible combinations:

![All combinations](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/all-combination.png)

### Blur covers

In addition, you can also **blur** the cover of specific series (also known as groups).
You can do this in two ways:

1. By clicking the **eye** icon on the item cover

   ![Blur button](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/blur-1.png)

2. By manually adding the series name in the options

   ![Blur option](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/blur-3.png)

Note that this option will blur **the entire series**

![Blur series](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/blur-2.png)

### Sync settings

There are two ways to transfer your settings across devices:

#### Manual sync

The first method is by using the **"Copy settings"** button. This will copy a JSON object to your clipboard. Then, on another device, use the **"Paste settings"** button to apply the settings.

![Manual sync](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/sync-manual-1.png)

#### Cloud sync

The second method is through the **Cloud Sync** feature: Upon first use, a unique ID will be generated. You can upload your settings using the **"Save and Sync to Cloud"** button and download them using the **"Load from Cloud"** button (Note: The Cloud Sync ID must match on both devices). If you ever wish to erase your data, the **"Delete from Cloud"** function is available.

Note: The synchronization feature is completely optional and will not activate without explicit user interaction. Before using it, please read our [Privacy Policy](https://jetpackcat-it.github.io/libib-custom-status-style/).

![Cloud sync](https://cdn.jsdelivr.net/gh/JetpackCat-IT/libib-custom-status-style@main/img/readme/sync-cloud-1.png)
