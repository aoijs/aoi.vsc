# 🌟 aoijs

This extension provides enhanced support for developing aoi.js bots within Visual Studio Code. ✨

## 📥 Installation

To install the aoijs Visual Studio Code Extension, follow these steps:

1. Launch Visual Studio Code.
2. Open the Extensions view by clicking on the square icon on the left sidebar or by pressing `Ctrl+Shift+X` (`Cmd+Shift+X` on macOS).
3. Search for "aoijs" in the Extensions view search bar.
4. Locate the "aoijs" extension in the search results and click on the "Install" button.
5. After installation, click on the "Reload" button to activate the extension.

## ✨ Features

- **Syntax Highlighting:** 🌈 Provides syntax highlighting for aoi.js code files, making it easier to read and understand your code.
- **Code Snippets:** 💡 Offers a collection of useful code snippets that you can quickly insert into your aoi.js files.
- **Command Templates:** 📝 Simplifies the creation of commands by providing a template that you can use as a starting point.
- **Integration with aoi.js:** 🔧 Seamlessly integrates with the aoi.js library, leveraging its powerful features.

## 🚀 Usage

1. Open a folder in Visual Studio Code containing your aoi.js bot project.
2. Create a new file or open an existing aoi.js file with the `.aoi` extension.
3. Start writing aoi.js code with syntax highlighting and code snippets provided by the extension.
4. Utilize the command template to quickly create new commands. The template follows the format specified below:

```javascript
[exportCommand: CommandType] {
    name: CommandName
    aliases: CommandAliases
    code: @{
        CommandCode
    }
}
```