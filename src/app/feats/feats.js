import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class Feats {
    static ɵfac = function Feats_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Feats)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: Feats, selectors: [["app-feats"]], decls: 2, vars: 0, template: function Feats_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "p");
            i0.ɵɵtext(1, "feats works!");
            i0.ɵɵdomElementEnd();
        } }, encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Feats, [{
        type: Component,
        args: [{ imports: [], selector: 'app-feats', template: "<p>feats works!</p>\n" }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(Feats, { className: "Feats", filePath: "src/app/feats/feats.ts", lineNumber: 9 }); })();
