import { KeyDictionary } from 'domain/utils';
import { parser as saxParser } from 'sax';

export type XmlAttribute = {
  name: string,
  value: string,
  start: number;
  end: number;
}

export type XmlNode = {
  path: string,
  name: string,
  isSelfClosing: boolean,
  tagOpenStart: number;
  tagOpenEnd: number;
  attributes: KeyDictionary<XmlAttribute>,
  text?: string,
  textStart?: number,
  textEnd?: number,
  parent: XmlNode
}

export class XmlDoc {

  readonly errors: Error[] = [];

  readonly paths: string[] = [];

  readonly nodes: XmlNode[] = [];

  readonly nodeRefs: XmlNode[] = [];

  readonly parser: any;

  attribs: KeyDictionary<XmlAttribute> = {};

  constructor() {
    const parser = this.parser = saxParser(true);
    parser.onerror = (e: Error) => this.errors.push(e);
    parser.onopentag = onOpenTag.bind(parser, this);
    parser.onclosetag = onCloseTag.bind(parser, this);
    parser.ontext = onText.bind(parser, this);
    parser.onattribute = onAttribute.bind(parser, this);
  }

  parse(xml: string) {
    try {
      this.parser.write(xml).close();
    } catch (e) {
    }

    return this.nodes;
  }

  findPathsStartsWith(path: string, nodes: XmlNode[] = this.nodes): XmlNode[] {
    return nodes.filter(x => x.path.startsWith(path))
  }

  findExactPaths(path: string, nodes: XmlNode[] = this.nodes): XmlNode[] {
    return nodes.filter(x => x.path === path);
  }

  getChildren(node: XmlNode, nodes: XmlNode[] = this.nodes) {
    return nodes.filter(x => x.parent === node);
  }

}

function onOpenTag(xmlDoc: XmlDoc, saxNode: any) {
  xmlDoc.paths.push(saxNode.name);
  const path = xmlDoc.paths.join('.');
  const parent = xmlDoc.nodeRefs.length > 0
    ? xmlDoc.nodeRefs[xmlDoc.nodeRefs.length - 1]
    : null;

  const node = {
    path,
    name: saxNode.name,
    isSelfClosing: saxNode.isSelfClosing,
    tagOpenStart: this.startTagPosition - 1,
    tagOpenEnd: this.position,
    attributes: { ...xmlDoc.attribs },
    parent
  };

  xmlDoc.nodeRefs.push(node);
  xmlDoc.nodes.push(node);
  xmlDoc.attribs = {};
}

function onAttribute(xmlDoc: XmlDoc, saxAttr: any) {
  const { name, value } = saxAttr;

  // positions without quotes
  const end = this.position - 1;
  const start = this.position - saxAttr.value.length - 1;

  // create the attribute
  const attr = {
    name,
    value,
    start,
    end
  };

  xmlDoc.attribs[name.toLowerCase()] = attr;
}

function onCloseTag(xmlDoc: XmlDoc, saxNode: any) {

  xmlDoc.paths.pop();

  const nodeRef = xmlDoc.nodeRefs.pop();

  Object.assign(
    nodeRef,
    {
      tagCloseStart: this.startTagPosition - 1,
      tagCloseEnd: this.position,
    }
  );
}

function onText(xmlDoc: XmlDoc, text: any) {
  if (xmlDoc.nodeRefs.length === 0) return;
  const nodeRef = xmlDoc.nodeRefs[xmlDoc.nodeRefs.length - 1];
  const textEnd = this.startTagPosition - 1;
  const textStart = textEnd - text.length;
  
  Object.assign(
    nodeRef,
    {
      text,
      textStart,
      textEnd,
    }
  );
}