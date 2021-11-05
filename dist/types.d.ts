interface SvgSpriteRuntimeOptions {
    importSprite: (key: string) => Promise<any>;
    modern: boolean;
    defaultSprite: string;
    spriteClassPrefix: string;
    spriteClass: string;
}

interface SVGSymbol {
  name: string
  sprite: string
  path: string
  content: string
  defs: string[]
}

interface SVGSprite {
  name: string
  defaultSprite?: boolean
  symbols: { [key: string]: SVGSymbol }
}

export { SVGSprite, SVGSymbol, SvgSpriteRuntimeOptions };
