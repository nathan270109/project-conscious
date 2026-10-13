import { Injectable } from '@nestjs/common';
import { parse, parseFragment } from 'parse5';
import type { RepositoryFile } from '../../github/github.service.js';
import { aggregateFindings, createFinding } from '../finding.utils.js';
import type { RepositoryProfile } from '../repository-profiler.service.js';
import type { AnalyzerResult, Finding, Severity } from '../types/analysis.types.js';
import type { Analyzer } from './analyzer.interface.js';

interface HtmlLocation { startLine: number; startOffset: number; endOffset: number; startTag?: HtmlLocation }
interface HtmlNode {
  nodeName: string;
  tagName?: string;
  attrs?: Array<{ name: string; value: string }>;
  childNodes?: HtmlNode[];
  sourceCodeLocation?: HtmlLocation | null;
}

@Injectable()
export class AccessibilityAnalyzer implements Analyzer {
  analyze(files: RepositoryFile[], profile: RepositoryProfile): AnalyzerResult {
    const htmlFiles = files.filter((file) => /\.html?$/i.test(file.path));
    const findings = htmlFiles.flatMap((file) => this.analyzeHtmlFile(file));
    if (profile.hasFrontend && htmlFiles.length === 0) findings.push(this.finding(
      'A11Y000', 'LOW', 'Templates não avaliados por esta regra',
      'O frontend foi detectado, mas nenhum template HTML externo entrou na análise.',
      'Templates JSX ou inline podem conter barreiras que esta etapa não conseguiu inspecionar.',
      'Inclua uma integração específica para o parser do framework ou templates externos no escopo.',
      'frontend', null, null,
    ));
    return { category: 'ACCESSIBILITY', analyzedItems: htmlFiles.length,
      findings: aggregateFindings(findings) };
  }

  private analyzeHtmlFile(file: RepositoryFile): Finding[] {
    const content = file.content ?? '';
    const parser = /<!doctype|<html\b/i.test(content) ? parse : parseFragment;
    const root = parser(content, { sourceCodeLocationInfo: true }) as unknown as HtmlNode;
    const elements = this.elements(root);
    const labelTargets = new Set(elements.filter((node) => node.tagName === 'label')
      .map((node) => this.attr(node, 'for')).filter((value): value is string => Boolean(value)));
    const findings: Finding[] = [];

    for (const node of elements) {
      const tag = node.tagName ?? '';
      const line = node.sourceCodeLocation?.startLine ?? null;
      const evidence = this.evidence(content, node);
      if (tag === 'img' && this.attr(node, 'alt') === undefined) findings.push(this.finding(
        'A11Y001', 'HIGH', 'Imagem sem alternativa textual definida',
        'A imagem não possui o atributo alt; não é possível distinguir conteúdo informativo de decoração.',
        'Usuários de leitor de tela podem perder uma informação ou ouvir apenas o nome do arquivo.',
        'Use alt descritivo para conteúdo ou alt="" para imagem puramente decorativa.',
        file.path, line, evidence,
      ));
      if (['input', 'select', 'textarea'].includes(tag) && !this.isExemptControl(node)) {
        const id = this.attr(node, 'id');
        const named = this.nonEmptyAttr(node, 'aria-label') || this.nonEmptyAttr(node, 'aria-labelledby') ||
          this.nonEmptyAttr(node, 'title') || this.ancestors(root, node).some((parent) => parent.tagName === 'label') ||
          (Boolean(id) && labelTargets.has(id!));
        if (!named) findings.push(this.finding(
          'A11Y002', 'HIGH', 'Controle de formulário sem nome acessível',
          `O elemento <${tag}> não está associado a label, aria-label ou aria-labelledby.`,
          'Tecnologias assistivas podem anunciar o campo sem informar sua finalidade.',
          'Associe um label por for/id, envolva o controle em label ou use aria-labelledby quando apropriado.',
          file.path, line, evidence,
        ));
      }
      if (tag === 'button' && !this.accessibleName(node)) findings.push(this.finding(
        'A11Y003', 'HIGH', 'Botão sem nome acessível',
        'O botão não possui texto, aria-label, aria-labelledby, title ou imagem com alt.',
        'O usuário pode encontrar um controle anunciado apenas como “botão”, sem compreender sua ação.',
        'Adicione texto visível ou um nome acessível equivalente à ação executada.',
        file.path, line, evidence,
      ));
      if (tag === 'a' && this.attr(node, 'href') !== undefined && !this.accessibleName(node)) findings.push(this.finding(
        'A11Y004', 'MEDIUM', 'Link sem nome acessível',
        'O link possui destino, mas não apresenta texto ou outro nome acessível.',
        'Usuários não conseguem identificar o destino ao navegar pela lista de links.',
        'Inclua texto descritivo ou aria-label que informe claramente o destino.',
        file.path, line, evidence,
      ));
      if (this.hasClickHandler(node) && !['button', 'a', 'input', 'select', 'textarea'].includes(tag)) {
        const keyboard = ['(keydown)', '(keyup)', '(keypress)', 'onkeydown', 'onkeyup', 'onkeypress']
          .some((name) => this.attr(node, name) !== undefined);
        if (!keyboard || this.attr(node, 'tabindex') !== '0' || !['button', 'link'].includes(this.attr(node, 'role') ?? '')) {
          findings.push(this.finding(
            'A11Y005', 'HIGH', 'Elemento não interativo usado apenas com clique',
            `O elemento <${tag}> possui ação de clique sem semântica e suporte completo de teclado.`,
            'Pessoas que usam teclado ou tecnologia assistiva podem não alcançar ou acionar o controle.',
            'Prefira button/link; ou forneça role, tabindex="0" e evento de teclado equivalente.',
            file.path, line, evidence,
          ));
        }
      }
    }
    const html = elements.find((node) => node.tagName === 'html');
    if (html && !this.nonEmptyAttr(html, 'lang')) findings.push(this.finding(
      'A11Y006', 'MEDIUM', 'Idioma principal da página não definido',
      'O elemento html não possui atributo lang válido.',
      'Leitores de tela podem usar pronúncia inadequada para o conteúdo.',
      'Defina lang com o idioma principal, por exemplo lang="pt-BR".',
      file.path, html.sourceCodeLocation?.startLine ?? null, this.evidence(content, html),
    ));
    return findings;
  }

  private finding(ruleId: string, severity: Severity, title: string, message: string,
    whyItMatters: string, remediation: string, file: string, line: number | null,
    evidence: string | null): Finding {
    return createFinding({ ruleId, category: 'ACCESSIBILITY', severity, title, message,
      whyItMatters, remediation, evidence, file, line });
  }
  private elements(root: HtmlNode): HtmlNode[] {
    const result: HtmlNode[] = [];
    const visit = (node: HtmlNode) => { if (node.tagName) result.push(node); node.childNodes?.forEach(visit); };
    visit(root); return result;
  }
  private ancestors(root: HtmlNode, target: HtmlNode): HtmlNode[] {
    let result: HtmlNode[] = [];
    const visit = (node: HtmlNode, parents: HtmlNode[]): boolean => {
      if (node === target) { result = parents; return true; }
      return node.childNodes?.some((child) => visit(child, [...parents, node])) ?? false;
    };
    visit(root, []); return result;
  }
  private attr(node: HtmlNode, name: string): string | undefined {
    return node.attrs?.find((attr) => attr.name.toLowerCase() === name)?.value;
  }
  private nonEmptyAttr(node: HtmlNode, name: string): boolean { return Boolean(this.attr(node, name)?.trim()); }
  private isExemptControl(node: HtmlNode): boolean {
    return node.tagName === 'input' && ['hidden', 'submit', 'reset', 'button', 'image']
      .includes((this.attr(node, 'type') ?? 'text').toLowerCase());
  }
  private text(node: HtmlNode): string {
    return node.nodeName === '#text' ? ((node as unknown as { value?: string }).value ?? '') :
      (node.childNodes ?? []).map((child) => this.text(child)).join('');
  }
  private accessibleName(node: HtmlNode): boolean {
    return this.nonEmptyAttr(node, 'aria-label') || this.nonEmptyAttr(node, 'aria-labelledby') ||
      this.nonEmptyAttr(node, 'title') || Boolean(this.text(node).trim()) ||
      this.elements(node).some((child) => child.tagName === 'img' && this.nonEmptyAttr(child, 'alt'));
  }
  private hasClickHandler(node: HtmlNode): boolean {
    return ['(click)', 'onclick', 'on-click'].some((name) => this.attr(node, name) !== undefined);
  }
  private evidence(content: string, node: HtmlNode): string | null {
    const location = node.sourceCodeLocation?.startTag ?? node.sourceCodeLocation;
    if (!location) return null;
    return content.slice(location.startOffset, location.endOffset).replace(/\s+/g, ' ').trim().slice(0, 240) || null;
  }
}
