import { Component } from '@angular/core';
import { SecaoHero } from './secao-hero/secao-hero';
import * as i0 from "@angular/core";
export class Home {
    static ɵfac = function Home_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Home)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: Home, selectors: [["app-home"]], decls: 1, vars: 0, template: function Home_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-secao-hero");
        } }, dependencies: [SecaoHero], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Home, [{
        type: Component,
        args: [{ imports: [SecaoHero], selector: 'app-home', template: "<app-secao-hero></app-secao-hero>" }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(Home, { className: "Home", filePath: "src/app/feats/home/home.ts", lineNumber: 10 }); })();
