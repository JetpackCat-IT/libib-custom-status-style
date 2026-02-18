# Libib custom status indicator style

A simple UserScript for customization of Libib.com status indicator

## Why did I make this?

Libib.com is a great website to keep track of your collection of books, CDs and other things.
Unfortunately the status indicator's color selection is not great and this make it hard to see if you already read a book or not.

Here you can see a before and after:\
![Before](img/readme/before.png)\
![After](img/readme/after.png)

## How to install

1. Install a Userscript Manager like [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/)
2. Install **Libib - Custom status indicator style** by clicking **[here](https://raw.githubusercontent.com/JetpackCat-IT/libib-custom-status-style/main/Libib-Custom-Status-Style.user.js)**

Mirrors:

<a href="https://greasyfork.org/it/scripts/526007-libib-custom-status-indicator-style">
<img src="https://img.shields.io/badge/-greasyfork-950000?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAXNSR0IArs4c6QAAAYdJREFUeNpNkU1LVHEUh3+jn8GdtYg+QOHiCiESBokQFaFQYBFYGAlGZMnQVLNIVFB8uQPqoCPeq+JCdBgUHXUUBF9WioLrOzsXLl0M18v/Uf6oeB44HM554Cx+klQmSaoe8SqD4bA7/BH0+ZWO7OWmxb6kRxmkjjlyLLDFBPdcYjeK2rbesm46IpkanvDRvIm+GgcVrCK1pj+RLzWQp516niJLTelqcu3vIZbNB7L85JQZFkizQj8tzBufhCN538hEi/zlHDhgGP+K/7QxFQ3Q4UmBkElyBsAR4jHCYoQCNYbveE4VGY45AfI84wV1vEb0kAw1frHLfXrpp4teq2wjchSoZ4LJUPFiHJn3tJLE5RX7wBrlNCLzm85AZZ5QJGrRNXvAKnaLPDU7CVKmk2myeGywzi+rrPDZJJAjyXU9ZktLZJkhS4414hxCaZOBlGzFqgq1NJlHUYV5STMZ0xTJ5JnfuROWXFHBA2RpoQGlVH59/We9h9Xf/a5iOpwM/xTH/PbbuC8B++4oDDg4lrsAAAAASUVORK5CYII=" alt="GreasyFork"/>
</a>

## How to use

1. Access your library on [libib.com](https://libib.com/library)
2. You should see a new menu item on the sidebar called **"Libib status settings"**
   ![Sidebar settings](img/readme/script-settings-1.png)
3. After clicking it, a window will open, in this window you can change the settings as you like
   ![Window settings](img/readme/script-settings-2.png)

You can choose between **Triangle** (default) or **Border**, you can also choose the position of the indicator.
If you choose the **Border** style, you can also choose the thickness

Here are all the possible combinations:

![All combinations](img/readme/all-combination.png)

In addition, you can also **blur** the cover of specific series (also known as groups).
You can do this in two way:

1. By clicking the **flag** icon on the item cover
   ![Blur button](img/readme/blur-1.png)
2. By adding manually the series name in the options
   ![Blur option](img/readme/blur-3.png)

Note that this option will blur **the entire series**
![Blur series](img/readme/blur-2.png)

If you use this script on multiple computers and want to transfer the settings, you can use the **Copy and Paste settings** buttons at the bottom of the settings page (see image above)
