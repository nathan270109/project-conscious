import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as i0 from "@angular/core";
export class Header {
    static ɵfac = function Header_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Header)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: Header, selectors: [["app-header"]], decls: 13, vars: 0, consts: [[1, "header"], [1, "logo"], ["src", "/assets/logo-white.png", "alt", "logo", 1, "logo"], ["routerLink", ""], ["data-hover", "In\u00EDcio"], ["data-hover", "Sobre"], ["data-hover", "Contato"]], template: function Header_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵelement(2, "img", 2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "nav")(4, "a", 3)(5, "span", 4);
            i0.ɵɵtext(6, "In\u00EDcio");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(7, "a", 3)(8, "span", 5);
            i0.ɵɵtext(9, "Sobre");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "a", 3)(11, "span", 6);
            i0.ɵɵtext(12, "Contato");
            i0.ɵɵelementEnd()()()();
        } }, dependencies: [RouterLink], styles: [".header[_ngcontent-%COMP%] {\n    display: flex;\n    width: 100%;\n    justify-content: space-between;\n    gap: 20px;\n\n}\n\n.logo[_ngcontent-%COMP%] {\n    width: 3em;\n    padding: 0 10px;\n}\n\nnav[_ngcontent-%COMP%] {\n    display: flex;\n    gap: 15px;\n    margin-top: 20px;\n    padding: 0 20px;\n}\n\nnav[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n    text-decoration: none;\n    color: #cacaca;\n    font-weight: 500;\n    overflow: hidden;\n    display: inline-block;\n    height: 24px;\n}\n\nnav[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n    position: relative;\n    display: inline-block;\n    transition: transform 0.3s ease;\n}\n\nnav[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]::before {\n    position: absolute;\n    top: 120%;\n    content: attr(data-hover);\n    color: #ffffff;\n}\n\nnav[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover   span[_ngcontent-%COMP%] {\n    transform: translateY(-120%);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Header, [{
        type: Component,
        args: [{ imports: [RouterLink], selector: 'app-header', template: "<div class=\"header\">\n    <div class=\"logo\">\n        <img class=\"logo\" src=\"/assets/logo-white.png\" alt=\"logo\">\n    </div>\n    \n    <nav>\n        <a routerLink=\"\"><span data-hover=\"In\u00EDcio\">In\u00EDcio</span></a>\n        <a routerLink=\"\"><span data-hover=\"Sobre\">Sobre</span></a>\n        <a routerLink=\"\"><span data-hover=\"Contato\">Contato</span></a>\n    </nav>\n\n</div>", styles: [".header {\n    display: flex;\n    width: 100%;\n    justify-content: space-between;\n    gap: 20px;\n\n}\n\n.logo {\n    width: 3em;\n    padding: 0 10px;\n}\n\nnav {\n    display: flex;\n    gap: 15px;\n    margin-top: 20px;\n    padding: 0 20px;\n}\n\nnav a {\n    text-decoration: none;\n    color: #cacaca;\n    font-weight: 500;\n    overflow: hidden;\n    display: inline-block;\n    height: 24px;\n}\n\nnav span {\n    position: relative;\n    display: inline-block;\n    transition: transform 0.3s ease;\n}\n\nnav span::before {\n    position: absolute;\n    top: 120%;\n    content: attr(data-hover);\n    color: #ffffff;\n}\n\nnav a:hover span {\n    transform: translateY(-120%);\n}"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(Header, { className: "Header", filePath: "src/app/components/header/header.ts", lineNumber: 10 }); })();
