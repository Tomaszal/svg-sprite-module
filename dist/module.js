'use strict';

const path = require('path');
const fs = require('fs-extra');
const Svgo = require('svgo');
const cleanupIDs = require('svgo/plugins/cleanupIDs');
const removeAttrs = require('svgo/plugins/removeAttrs');
const removeDimensions = require('svgo/plugins/removeDimensions');
const removeViewBox = require('svgo/plugins/removeViewBox');
const inlineStyles = require('svgo/plugins/inlineStyles');
const Hookable = require('hookable');
const consola = require('consola');
const chokidar = require('chokidar');
const chalk = require('chalk');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

const path__default = /*#__PURE__*/_interopDefaultLegacy(path);
const fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
const Svgo__default = /*#__PURE__*/_interopDefaultLegacy(Svgo);
const cleanupIDs__default = /*#__PURE__*/_interopDefaultLegacy(cleanupIDs);
const removeAttrs__default = /*#__PURE__*/_interopDefaultLegacy(removeAttrs);
const removeDimensions__default = /*#__PURE__*/_interopDefaultLegacy(removeDimensions);
const removeViewBox__default = /*#__PURE__*/_interopDefaultLegacy(removeViewBox);
const inlineStyles__default = /*#__PURE__*/_interopDefaultLegacy(inlineStyles);
const Hookable__default = /*#__PURE__*/_interopDefaultLegacy(Hookable);
const consola__default = /*#__PURE__*/_interopDefaultLegacy(consola);
const chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);
const chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

const JSAPI = require("svgo/lib/svgo/jsAPI.js");
function inlineDefs(document, params) {
  const defs = document.querySelector("defs");
  const uses = document.querySelectorAll("use");
  if (!uses) {
    return document;
  }
  const useCount = _countUses(uses);
  for (let i = 0; i < uses.length; i++) {
    let hrefItem = uses[i].attr("xlink:href");
    if (!hrefItem) {
      hrefItem = uses[i].attr("href");
    }
    const href = hrefItem.value;
    if (params.onlyUnique === true && useCount[href] > 1) {
      continue;
    }
    const x = uses[i].hasAttr("x") ? uses[i].attr("x").value : null;
    const y = uses[i].hasAttr("y") ? uses[i].attr("y").value : null;
    let attrValue = null;
    if (x && y) {
      attrValue = "translate(" + x + ", " + y + ")";
    } else if (x) {
      attrValue = "translate(" + x + ")";
    }
    let def = _findById(defs, href.match(idRegex)[1]);
    if (!def) {
      continue;
    }
    if (params.onlyUnique === true && useCount[href] === 1) {
      def = _replaceElement(def);
    }
    for (const key in uses[i].attrs) {
      if (Object.prototype.hasOwnProperty.call(uses[i].attrs, key) && key !== "x" && key !== "y" && key !== "xlink:href" && key !== "href") {
        def.addAttr(uses[i].attrs[key]);
      }
    }
    if (attrValue) {
      const g = new JSAPI({
        elem: "g",
        attrs: {
          transform: {
            name: "transform",
            value: attrValue,
            prefix: null,
            local: "transform"
          }
        },
        content: [def]
      });
      _replaceElement(uses[i], g);
    } else {
      _replaceElement(uses[i], def);
    }
  }
  if (params.onlyUnique === false) {
    for (const element in useCount) {
      if (Object.prototype.hasOwnProperty.call(useCount, element) && useCount[element] > 1) {
        const tags = document.querySelectorAll(element);
        for (let j = 0; j < tags.length; j++) {
          tags[j].removeAttr("id");
        }
      }
    }
  }
  _removeDefs(document, params);
  return document;
}
function _removeDefs(document, params) {
  if (params.onlyUnique === false || document.querySelector("defs").content.length === 0) {
    _replaceElement(document.querySelector("defs"));
  }
}
function _countUses(elements) {
  return elements.reduce(function(result, item) {
    let hrefItem = item.attr("xlink:href");
    if (!hrefItem) {
      hrefItem = item.attr("href");
    }
    const href = hrefItem.value;
    if (Object.prototype.hasOwnProperty.call(result, href)) {
      result[href]++;
    } else {
      result[href] = 1;
    }
    return result;
  }, {});
}
function _replaceElement(oldElement, newElement = null) {
  const elementIndex = _getElementIndex(oldElement);
  if (newElement) {
    oldElement.parentNode.spliceContent(elementIndex, 1, newElement);
  } else {
    oldElement.parentNode.spliceContent(elementIndex, 1);
  }
  return oldElement;
}
function _getElementIndex(element) {
  element.addAttr({
    name: "data-defs-index",
    value: "true",
    prefix: "",
    local: "data-defs-index"
  });
  const index = element.parentNode.content.findIndex(function(contentElement) {
    return contentElement.hasAttr("data-defs-index", "true");
  });
  element.removeAttr("data-defs-index");
  return index;
}
const idRegex = /^#?(\S+)/;
function _findById(element, id) {
  if (element.hasAttr("id", id)) {
    return element;
  }
  if (element.content) {
    for (let i = 0; i < element.content.length; i++) {
      const result = _findById(element.content[i], id);
      if (result !== null) {
        return result;
      }
    }
  }
  return null;
}
const inlineDefs$1 = {
  type: "full",
  active: true,
  description: "inlines svg definitions",
  params: {
    onlyUnique: false
  },
  fn: inlineDefs
};

var name = "@nuxtjs/svg-sprite";
var version = "1.0.0-beta.2";

const pkg = {name, version};
const logger = consola__default['default'].withScope("@nuxtjs/svg-sprite");
function generateName(name2) {
  return name2.toLowerCase().replace(/\.svg$/, "").replace(/[^a-z0-9-]/g, "-");
}
async function writeSVG(path, content) {
  const result = await fs__default['default'].writeFile(path, content, {flag: "w"});
  return result;
}
async function readSVG(path) {
  const result = await fs__default['default'].readFile(path);
  return result;
}
function convertToSymbol(name2, content) {
  const $data = content.replace("<svg", `<symbol id="i-${name2}"`).replace("</svg>", "</symbol>").replace(/<defs>(.+)<\/defs>/, "");
  return $data;
}
function extractDefs(content) {
  const $data = content.match(/<defs>(.+)<\/defs>/);
  return $data ? $data[1] : "";
}
function isSVGFile(file) {
  return file.match(/.*\.svg$/);
}
function wrap(content, defs) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<defs>\n' + defs + "\n</defs>\n" + content + "\n</svg>";
}

function defaultPlugins() {
  removeAttrs__default['default'].active = true;
  removeAttrs__default['default'].params.attrs = "svg:id";
  removeViewBox__default['default'].active = false;
  removeDimensions__default['default'].active = true;
  inlineStyles__default['default'].active = true;
  inlineStyles__default['default'].params.onlyMatchedOnce = false;
  return [
    removeDimensions__default['default'],
    cleanupIDs__default['default'],
    removeAttrs__default['default'],
    removeViewBox__default['default'],
    inlineStyles__default['default'],
    {inlineDefs: inlineDefs$1}
  ];
}
class SVGManager extends Hookable__default['default'] {
  constructor({svgoConfig, input, output, defaultSprite}) {
    super();
    this.sprites = {};
    if (!svgoConfig) {
      svgoConfig = {plugins: defaultPlugins()};
    }
    if (typeof svgoConfig === "function") {
      svgoConfig = svgoConfig();
    }
    this.svgo = new Svgo__default['default'](svgoConfig);
    this.input = input;
    this.output = output;
    this.defaultSprite = defaultSprite;
  }
  async generateSprites() {
    const files = await fs__default['default'].readdir(this.input);
    let hasDefaultSprite = false;
    for (const file of files) {
      const source = path.join(this.input, file);
      if (isSVGFile(file)) {
        hasDefaultSprite = true;
      }
      const stat = await fs__default['default'].lstat(source);
      if (stat.isDirectory() || stat.isSymbolicLink()) {
        await this.createSprite(file, source);
      }
    }
    if (hasDefaultSprite) {
      await this.createSprite(this.defaultSprite, this.input, {defaultSprite: true});
    }
    await this.writeSprites();
  }
  async createSprite(name, source, {defaultSprite = false} = {}) {
    const files = await fs__default['default'].readdir(source);
    if (!this.sprites[name]) {
      this.sprites[name] = {
        name,
        defaultSprite,
        symbols: {}
      };
    }
    for (const file of files) {
      const symbol = generateName(file);
      if (isSVGFile(file) && !this.sprites[name].symbols[symbol]) {
        await this.newSymbol(path.join(source, file), symbol, name);
      }
    }
  }
  async registerSymbol(symbol, sprite = "") {
    sprite = sprite || symbol.sprite || this.defaultSprite;
    if (!this.sprites[sprite]) {
      this.sprites[sprite] = {
        name: sprite,
        symbols: {}
      };
    }
    this.sprites[sprite].symbols[symbol.name] = symbol;
    this.callHook("svg-sprite:symbol-add", symbol);
    await this.writeSprite(sprite, this.output);
    await this.writeJsonInfo();
  }
  async unregisterSymbol(symbol, sprite = "") {
    sprite = sprite || this.defaultSprite;
    if (this.sprites[sprite] && this.sprites[sprite].symbols[symbol.name]) {
      delete this.sprites[sprite].symbols[symbol];
      this.callHook("svg-sprite:symbol-remove", symbol);
      await this.writeJsonInfo();
    }
  }
  async unregisterSprite(sprite) {
    if (this.sprites[sprite] && this.sprites[sprite]) {
      delete this.sprites[sprite];
      this.callHook("svg-sprite:sprite-remove", sprite);
      try {
        await fs__default['default'].unlink(path.join(this.output, sprite + ".svg"));
      } catch (e) {
      }
      await this.writeJsonInfo();
    }
  }
  async newSymbol(file, name, sprite = "") {
    const rawContent = await readSVG(file);
    const optimizeContent = await this.optimizeSVG(name, rawContent);
    const symbol = await convertToSymbol(name, optimizeContent);
    const defs = await extractDefs(optimizeContent);
    await this.registerSymbol({
      name,
      sprite,
      path: file,
      content: symbol,
      defs
    });
  }
  async writeSprites() {
    for (const sprite of Object.values(this.sprites)) {
      await this.writeSprite(sprite, this.output);
    }
    await this.writeJsonInfo();
  }
  async writeJsonInfo() {
    const json = Object.values(this.sprites).reduce(function(arr, sprite) {
      const spriteSymbols = [];
      Object.values(sprite.symbols).forEach((symbol) => {
        spriteSymbols.push(symbol.name);
      });
      arr.push({
        name: sprite.name,
        defaultSprite: sprite.defaultSprite,
        symbols: spriteSymbols
      });
      return arr;
    }, []);
    await fs__default['default'].writeFile(path.join(this.output, "sprites.json"), JSON.stringify(json, null, 2), {flag: "w"});
    this.callHook("svg-sprite:update", this.sprites);
  }
  async writeSprite(sprite, directory) {
    if (typeof sprite === "string") {
      sprite = this.sprites[sprite];
    }
    if (!sprite) {
      return;
    }
    const symbols = Object.values(sprite.symbols).map((s) => s.content).join("\n");
    const defs = Object.values(sprite.symbols).map((s) => s.defs).filter((d) => Boolean(d)).join("\n");
    const svg = wrap(symbols, defs);
    await writeSVG(path.join(directory, `${sprite.name}.svg`), svg);
  }
  async optimizeSVG(name, content) {
    cleanupIDs__default['default'].params.prefix = `${name}-`;
    const $data = await this.svgo.optimize(content);
    return $data.data;
  }
}

class Watcher {
  constructor(svgManager) {
    const filesWatcher = chokidar__default['default'].watch(svgManager.input, {
      ignoreInitial: true
    });
    if (filesWatcher) {
      logger.info(`Watching ${svgManager._input} for new icons`);
      filesWatcher.on("add", (file) => this.onFileAdded(file));
      filesWatcher.on("change", (file) => this.onFileAdded(file));
      filesWatcher.on("unlink", (file) => this.onFileRemoved(file));
      filesWatcher.on("unlinkDir", (file) => this.onDirectoryRemoved(file));
    }
    this.svgManager = svgManager;
    this._filesWatcher = filesWatcher;
  }
  close() {
    this._filesWatcher.close();
    delete this._filesWatcher;
  }
  onFileAdded(file) {
    const path$1 = file.replace(this.svgManager.input + path.sep, "");
    const arr = path$1.split(path.sep);
    const sprite = arr.length === 2 ? arr[0] : "";
    const iconName = generateName(arr[arr.length - 1]);
    this.svgManager.newSymbol(file, iconName, sprite);
    logger.log({
      type: "added",
      message: `SVG icon ${chalk__default['default'].bold(sprite + "/" + iconName)} added`,
      icon: chalk__default['default'].green.bold("+")
    });
  }
  onFileRemoved(file) {
    const path$1 = file.replace(this.svgManager.input + path.sep, "");
    const arr = path$1.split(path.sep);
    const sprite = arr.length === 2 ? arr[0] : "";
    const iconName = generateName(arr[arr.length - 1]);
    this.svgManager.unregisterSymbol(iconName, sprite);
    logger.log({
      type: "removed",
      message: `SVG icon ${chalk__default['default'].bold(sprite + "/" + iconName)} removed`,
      icon: chalk__default['default'].red.bold("-")
    });
  }
  onDirectoryRemoved(file) {
    const sprite = file.split(path.sep).pop();
    this.svgManager.unregisterSprite(sprite);
  }
}

const DEFAULTS = {
  input: "~/assets/sprite/svg",
  output: "~/assets/sprite/gen",
  defaultSprite: "icons",
  svgoConfig: null,
  elementClass: "icon",
  spriteClassPrefix: "sprite-",
  publicPath: null,
  iconsPath: "/_icons"
};
let svgManager;
async function SVGSpriteModule(moduleOptions) {
  const {nuxt} = this;
  const options = {
    ...DEFAULTS,
    ...moduleOptions,
    ...this.options.svgSprite
  };
  const resolve = ($path) => $path.replace(/\//g, path__default['default'].sep).replace("~", this.nuxt.options.srcDir);
  this.extendBuild((config) => extendBuild.call(this, config, options));
  options._input = options.input;
  options._output = options.output;
  options.input = resolve(options.input);
  options.output = resolve(options.output);
  this.addPlugin({
    src: path__default['default'].resolve(__dirname, "runtime/plugin.js"),
    fileName: "nuxt-svg-sprite.js",
    options
  });
  if (this.nuxt.options.dev && options.iconsPath) {
    const layout = path__default['default'].resolve(__dirname, "runtime", "layouts", "svg-sprite.vue");
    this.addLayout(layout, "svg-sprite");
    const componentPath = path__default['default'].resolve(__dirname, "runtime", "components", "icons-list.vue");
    this.extendRoutes(function svgModuleExtendRoutes(routes) {
      routes.unshift({
        name: "icons-list",
        path: options.iconsPath,
        component: componentPath
      });
    });
  }
  if (this.nuxt.options._start) {
    return;
  }
  svgManager = new SVGManager(options);
  svgManager.hook("svg-sprite:update", (sprites) => {
    options.sprites = Object.keys(sprites);
  });
  if (nuxt.options.dev) {
    nuxt.options.build.watch.push(path__default['default'].resolve(path.join(options.output, "sprites.json")));
    nuxt.hook("build:done", () => {
      options._filesWatcher = new Watcher(svgManager);
    });
    nuxt.hook("close", () => {
      if (options._filesWatcher) {
        options._filesWatcher.close();
      }
    });
  }
  await init(options);
  await svgManager.generateSprites();
  this.nuxt.hook("storybook:config", ({stories}) => {
    stories.push("@nuxtjs/svg-sprite/dist/runtime/stories/*.stories.js");
  });
  nuxt.options.alias["~svgsprite"] = options.output;
  const runtimeDir = path__default['default'].resolve(__dirname, "runtime");
  nuxt.options.alias["~svg-sprite-runtime"] = runtimeDir;
}
async function init(options) {
  await fs.mkdirp(options.input);
  await fs.mkdirp(options.output);
  await fs.writeFile(path__default['default'].join(options.output, ".gitignore"), "*");
}
function extendBuild(config, options) {
  config.module.rules.forEach((rule) => {
    if (String(rule.test).includes("svg")) {
      if (!rule.exclude) {
        rule.exclude = [];
      }
      rule.exclude.push(path__default['default'].resolve(options.output));
    }
  });
  const fileLoaderOptions = {};
  if (options.publicPath) {
    fileLoaderOptions.publicPath = options.publicPath;
  }
  config.module.rules.push({
    test: /\.svg$/,
    include: [path__default['default'].resolve(options.output)],
    use: [
      {
        loader: "file-loader",
        options: fileLoaderOptions
      }
    ]
  });
}
SVGSpriteModule.meta = pkg;

module.exports = SVGSpriteModule;
