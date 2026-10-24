const fs = require("fs")
const path = require("path")
const yaml = require("yaml")

const codeExamplesPath = path.join(__dirname, "../", "code-examples")
const yamlAPIPath = path.join(__dirname, "../", "yaml", "types")
const mdAPIPath = path.join(__dirname, "../", "src/content/docs/api", "types")
const iconDataPath = path.join(__dirname, "../", "src", "icons")
const yamlEnumPath = path.join(__dirname, "../", "yaml", "enums")
const mdEnumPath = path.join(__dirname, "../", "src/content/docs/api", "enums")

// Cleanup md (excluding index.md files)
if (fs.existsSync(mdAPIPath)) {
    const files = fs.readdirSync(mdAPIPath)
    for (const file of files) {
        if (file !== 'index.mdx') {
            const filePath = path.join(mdAPIPath, file)
            fs.rmSync(filePath, { recursive: true, force: true })
        }
    }
}

if (fs.existsSync(mdEnumPath)) {
    const files = fs.readdirSync(mdEnumPath)
    for (const file of files) {
        if (file !== 'index.mdx') {
            const filePath = path.join(mdEnumPath, file)
            fs.rmSync(filePath, { recursive: true, force: true })
        }
    }
}

// Create directories
if (!fs.existsSync(mdAPIPath)) {
    fs.mkdirSync(mdAPIPath, { recursive: true })
}

if (!fs.existsSync(yamlAPIPath)) {
    fs.mkdirSync(yamlAPIPath, { recursive: true })
}

if (!fs.existsSync(mdEnumPath)) {
    fs.mkdirSync(mdEnumPath, { recursive: true })
}

if (!fs.existsSync(yamlEnumPath)) {
    fs.mkdirSync(yamlEnumPath, { recursive: true })
}

// Process API Classes
const yamlFiles = fs.readdirSync(yamlAPIPath).filter(file => file.endsWith('.yaml'));

const inheritedBy = {}
const classDataMap = {}
const linkTable = {
    api: {},
    enums: {}
}

// First pass, check for inherited by
for (const yamlFile of yamlFiles) {
    const yamlPath = path.join(yamlAPIPath, yamlFile)
    const yamlContent = fs.readFileSync(yamlPath, "utf-8")
    const c = yaml.parse(yamlContent)
    const className = path.basename(yamlFile, '.yaml')
    classDataMap[className] = c

    if (c.BaseType) {
        if (!inheritedBy[c.BaseType]) {
            inheritedBy[c.BaseType] = []
        }
        inheritedBy[c.BaseType].push(c.Name || className)
    }

    linkTable.api[className] = `../../${c.Category}/${className.toLowerCase()}/`
}

// Second pass, generate md files
for (const yamlFile of yamlFiles) {
    const className = path.basename(yamlFile, '.yaml')
    const c = classDataMap[className]

    let mdPath
    if (c.Category) {
        const catDir = path.join(mdAPIPath, c.Category)
        if (!fs.existsSync(catDir)) {
            fs.mkdirSync(catDir, { recursive: true })
        }
        mdPath = path.join(catDir, className + ".mdx")
    } else {
        mdPath = path.join(mdAPIPath, className + ".mdx")
    }

    let mk = ""
    var iconPath = path.join(iconDataPath, c.Name + ".svg")
    if (c.Icon) {
        iconPath = path.join(iconDataPath, c.Icon + ".svg")
    }
    const emojiExists = fs.existsSync(iconPath)

    function appendLine(str) {
        mk += str + "\n"
    }

    function appendTagLine(tags) {
        //mk += "{{ tagSection([" + tags.toString() + "]) }}"
    }
    function appendPropExplainer(apiClass, propTitle, propType) {
        //mk += "{{ propExplainer(\"" + apiClass + "\",\"" + propTitle + "\",\"" + propType + "\") }}"
    }
    function appendInherits(apiClass) {
        let str = `**Inherits:** [${apiClass.Name}](${linkTable.api[apiClass.Name]})`
        let currentClass = apiClass
        while (currentClass.BaseType != null){
            str += ` < [${currentClass.BaseType}](${linkTable.api[currentClass.BaseType]})`
            newclass = classDataMap[currentClass.BaseType]
            if (newclass == null){
                break
            } else {
                currentClass = newclass
            }
        }
        mk += `${str}\n`
    }
    function appendInheritedBy() {
        let str = "**Inherited By:** "
        for (const name of inheritedBy[className]){
            if (str == "**Inherited By:** "){
                str += `[${name}](${linkTable.api[name]})`
            } else {
                str += `, [${name}](${linkTable.api[name]})`
            }
        }
        mk += `${str}\n`
    }

    appendLine("---")
    appendLine("title: " + c.Name)
    if (emojiExists & !c.Icon) {
        appendLine("sidebar:")
        appendLine(` label: \"[${c.Name}] ${c.Name}\"`)
    } else if (c.Icon) {
        appendLine("sidebar:")
        appendLine(` label: \"[${c.Icon}] ${c.Name}\"`)
    } else {
        appendLine("sidebar:")
        appendLine(` label: \"[Unknown] ${c.Name}\"`)
    }
    appendLine("---")
    appendLine("")
    appendLine('import Icon from "/src/components/Icon.astro";')
    appendLine('import { Badge, Aside } from "@astrojs/starlight/components";')
    appendLine("")
    if (emojiExists & !c.Icon) {
        appendLine(`# ${c.Name} <Icon width="64px" height="64px" name="${c.Name}"/>`)
    } else if (c.Icon) {
        appendLine(`# ${c.Name} <Icon width="64px" height="64px" name="${c.Icon}"/>`)
    } else {
        appendLine(`# ${c.Name}`)
    }

    if (c.BaseType) {
        appendLine("")
        appendInherits(c)
    }

    // Inherited by
    const children = inheritedBy[c.Name || className]
    if (children && children.length > 0) {
        appendLine("")
        appendInheritedBy()
    }

    appendLine("")
    appendLine(c.Description)
    appendLine("")

    if (c.IsStatic) {
        if (c.StaticAlias){
            appendLine(`<Aside type="caution" title="Static">This class is static and can be accessed by \`${c.StaticAlias}\`. Additionally it cannot be created by \`Instance.New()\` or the insert menu.</Aside>`)
        } else {
            appendLine('<Aside type="caution" title="Static">This class is static and cannot be created by `Instance.New()` or the insert menu.</Aside>')
        }
        appendLine("")
    }

    if (c.IsAbstract) {
        appendLine('<Aside type="danger" title="Abstract">This class is abstract meaning it is a base class for other classes.</Aside>')
        appendLine("")
    }

    if (!c.IsInstantiable) {
        appendLine('<Aside type="tip" title="Not Newable">This class cannot be created with `Instance.New()` .</Aside>')
        appendLine("")
    }

    const constructors = c.Constructors ? (Array.isArray(c.Constructors) ? c.Constructors : [c.Constructors]) : [];
    constructors.sort((a, b) => {
        const nameA = a.Name.toUpperCase();
        const nameB = b.Name.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    if (constructors.length > 0) {
        appendLine("")
        appendLine("## Constructors")
        appendLine("")
    }
    for (const con of constructors) {
        if (con.IsObsolete) continue
        let params = []

        const parameters = con.Parameters ? (Array.isArray(con.Parameters) ? con.Parameters : [con.Parameters]) : [];
        for (const p of parameters) {
            params.push(`${p.Name};${p.Type}${p.IsOptional ? "?" : ""}`)
        }

        //appendLine(`### ${con.Name}(${params.join(",")}) { construct }`)
        appendLine(`### ${con.Name}`)
        appendLine(``)
        appendLine(con.Description || "Missing documentation!")
        appendLine(``)
    }


    const properties = c.Properties ? (Array.isArray(c.Properties) ? c.Properties : [c.Properties]) : [];
    properties.sort((a, b) => {
        const nameA = a.Name.toUpperCase();
        const nameB = b.Name.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    if (properties.length > 0) {
        appendLine("")
        appendLine("## Properties")
        appendLine("")
    }

    for (const prop of properties) {
        //appendLine(`### ${prop.Name}:${prop.Type} { property }`)
        appendLine(`### ${prop.Name}`)
        //appendPropExplainer(c.Name, prop.Name, prop.Type)
        appendLine(``)
        appendLine(prop.Description || "Missing documentation!")
        appendLine(``)

        if (prop.IsReadOnly) {
            appendLine('<Badge text="Read Only" size="small" />')
            appendLine(``)
        }
    }

    const methods = c.Methods ? (Array.isArray(c.Methods) ? c.Methods : [c.Methods]) : [];
    methods.sort((a, b) => {
        const nameA = a.Name.toUpperCase();
        const nameB = b.Name.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    if (methods.length > 0) {
        appendLine("")
        appendLine("## Methods")
        appendLine("")
    }
    for (const m of methods) {
        if (m.IsObsolete) continue
        let params = []

        const parameters = m.Parameters ? (Array.isArray(m.Parameters) ? m.Parameters : [m.Parameters]) : [];
        for (const p of parameters) {
            params.push(`${p.Name};${p.Type}${p.IsOptional ? "?" : ""}`)
        }

        //appendLine(`### ${m.Name}(${params.join(",")}):${m.ReturnType || "void"} { method }`)
        appendLine(`### ${m.Name}`)
        appendLine(``)
        appendLine(m.Description || "Missing documentation!")
        appendLine(``)

        if (m.Example) {
            const examplecode = fs.readFileSync(path.join(codeExamplesPath, m.Example + ".lua"))
            appendLine("``` lua")
            appendLine(examplecode.toString())
            appendLine("```")
        }

        if (m.IsAsync && m.IsStatic) {
            tags = new Array("\"Asynchronous\"", "\"Static\"")
            appendLine(``)
            appendTagLine(tags)
            appendLine(``)
        } else if (m.IsAsync && !m.IsStatic) {
            tags = new Array("\"Asynchronous\"")
            appendLine(``)
            appendTagLine(tags)
            appendLine(``)
        } else if (!m.IsAsync && m.IsStatic) {
            tags = new Array("\"Static\"")
            appendLine(``)
            appendTagLine(tags)
            appendLine(``)
        }
    }

    const events = c.Events ? (Array.isArray(c.Events) ? c.Events : [c.Events]) : [];
    events.sort((a, b) => {
        const nameA = a.Name.toUpperCase();
        const nameB = b.Name.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    if (events.length > 0) {
        appendLine("")
        appendLine("## Events")
        appendLine("")
    }

    for (const e of events) {
        let args = []

        const aargs = e.Arguments ? (Array.isArray(e.Arguments) ? e.Arguments : [e.Arguments]) : [];
        for (const arg of aargs) {
            args.push(`${arg.Name};${arg.Type}`)
        }

        //appendLine(`### ${e.Name}(${args.join(",")}) { event }`)
        appendLine(`### ${e.Name}`)
        appendLine(``)
        appendLine(e.Description || "")
        appendLine(``)
    }

    fs.writeFileSync(mdPath, mk)
}

console.log(`Converted ${yamlFiles.length} YAML files to MarkdownX`)

// Process Enums
const yamlEnumFiles = fs.readdirSync(yamlEnumPath).filter(file => file.endsWith('.yaml'));

for (const yamlFile of yamlEnumFiles) {
    const yamlPath = path.join(yamlEnumPath, yamlFile);
    const yamlContent = fs.readFileSync(yamlPath, "utf-8");

    const e = yaml.parse(yamlContent);
    const enumName = path.basename(yamlFile, '.yaml');
    let mdPath = path.join(mdEnumPath, enumName + ".mdx")
    let mk = ""

    function appendLine(str) {
        mk += str + "\n"
    }

    appendLine("---")
    appendLine("title: " + e.Name)
    if (e.Description) {
        appendLine("description: " + (e.Description && e.Description !== "Missing Documentation" ? e.Description : ""))
    }
    appendLine("icon: polytoria/Enum")
    appendLine("---")
    appendLine("")
    appendLine('import { Icon } from "astro-icon/components";')
    appendLine("")
    appendLine("# " + e.Name)
    appendLine("")

    if (e.Description && e.Description !== "Missing Documentation") {
        appendLine(e.Description)
        appendLine("")
    }

    appendLine("| Name | Description |")
    appendLine("| --- | --- |")

    const options = e.Options ? (Array.isArray(e.Options) ? e.Options : [e.Options]) : [];
    for (const option of options) {
        const optionName = typeof option === 'string' ? option : option.Name;
        const optionDesc = typeof option === 'string' ? "" : (option.Description || "");
        const displayDesc = optionDesc === "Missing Documentation" ? "" : optionDesc;
        appendLine(`| \`${e.Name}.${optionName}\` | ${displayDesc} |`)
    }

    fs.writeFileSync(mdPath, mk)
}

console.log(`Converted ${yamlEnumFiles.length} enum YAML files to MarkdownX`)