import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import * as i0 from "@angular/core";
export class App {
    title = signal('project-conscious', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "title" }] : /* istanbul ignore next */ []));
    static ɵfac = function App_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || App)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: App, selectors: [["app-root"]], decls: 5, vars: 0, consts: [[1, "html"], ["src", "/assets/fundo-de-tela.png", "alt", "img fundo", 1, "img-fundo"]], template: function App_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelement(1, "img", 1)(2, "app-header")(3, "router-outlet")(4, "app-footer");
            i0.ɵɵelementEnd();
        } }, dependencies: [RouterOutlet, Footer, Header], styles: [".html[_ngcontent-%COMP%] {\n    position: relative;\n    overflow: hidden;\n}\n\n.img-fundo[_ngcontent-%COMP%] {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    object-fit: cover;\n    z-index: -1;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(App, [{
        type: Component,
        args: [{ imports: [RouterOutlet, Footer, Header], selector: 'app-root', template: "<div class=\"html\">\n\n  <img class=\"img-fundo\" src=\"/assets/fundo-de-tela.png\" alt=\"img fundo\">\n\n  <app-header></app-header>\n  <router-outlet />\n  <app-footer></app-footer>\n\n</div>", styles: [".html {\n    position: relative;\n    overflow: hidden;\n}\n\n.img-fundo {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    object-fit: cover;\n    z-index: -1;\n}"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(App, { className: "App", filePath: "src/app/app.ts", lineNumber: 13 }); })();
