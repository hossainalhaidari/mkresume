# Make Resume

CLI to generate resume based on templates.

## Usage

```sh
npm install -g mkresume
mkresume -c content.yaml -t template.html -u output.html
```

The content file is a YAML file that defines the variables that are used in templates. The templates should use [squirrelly](https://squirrelly.js.org/) syntax.