#!/usr/bin/env node

const { program } = require("commander");
const { stat, readFile, writeFile } = require("fs").promises;
const glob = require("glob-promise");
const { load } = require("js-yaml");
const { mdToPdf } = require("md-to-pdf");
const { basename, extname, join } = require("path");
const { render } = require("squirrelly");

process.on("uncaughtException", (e) => console.log(e.message));

const generate = async (contentPath, templatePath, outputPath) => {
  const content = await readFile(contentPath, "utf8");
  const template = await readFile(templatePath, "utf8");
  const templateExt = extname(templatePath);

  let output = render(template, load(content));

  if (templateExt.toLocaleLowerCase() == ".pdf") {
    const pdf = await mdToPdf({ content: output });
    if (pdf) output = pdf.content;
  }

  await writeFile(outputPath, output);
};

const handleTemplates = async (contentPath, templatePath, outputPath) => {
  const fileName = basename(contentPath, extname(contentPath));
  const templateStat = await stat(templatePath);

  if (templateStat.isDirectory()) {
    const templates = await glob(templatePath);

    templates.map(async (template) => {
      generate(
        contentPath,
        template,
        join(outputPath, `${fileName}${extname(template)}`)
      );
    });
  } else {
    generate(contentPath, templatePath, outputPath);
  }
};

const handler = async (options) => {
  const { content, template, output } = options;

  const contentStat = await stat(content);

  if (contentStat.isDirectory()) {
    const files = await glob(join(content, "*.yaml"));
    files.map((file) => handleTemplates(file, template, output));
  } else {
    handleTemplates(content, template, output);
  }
};

program
  .name("mkresume")
  .description("CLI to generate resume based on templates")
  .version("0.1.2")
  .requiredOption("-c, --content <string>", "path to content file")
  .requiredOption("-t, --template <string>", "path to template file")
  .requiredOption("-o, --output <string>", "path to output file")
  .action(async (options) => await handler(options));

program.parse();
