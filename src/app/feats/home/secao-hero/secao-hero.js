import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as i0 from "@angular/core";
export class SecaoHero {
    static ɵfac = function SecaoHero_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SecaoHero)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SecaoHero, selectors: [["app-secao-hero"]], decls: 49, vars: 0, consts: [[1, "hero"], [1, "container"], [1, "box-texto"], ["id", "subtitulo"], ["id", "repositorio", "routerLink", "/projects/new"], [1, "box-card"], [1, "box"], ["id", "titulo"], ["id", "p-especial"], ["id", "media"], ["id", "paragrafo"], [1, "score-bar"], [1, "score-progress"], [1, "texto"], [1, "nota"]], template: function SecaoHero_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "h2");
            i0.ɵɵtext(4, "Seu software funciona.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "h2", 3);
            i0.ɵɵtext(6, "Mas ele est\u00E1 saud\u00E1vel?");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p");
            i0.ɵɵtext(8, " O Project Conscious analisa seu reposit\u00F3rio e transforma sinais t\u00E9cnicos em uma vis\u00E3o clara, explic\u00E1vel e priorizada da sa\u00FAde do software. ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "button", 4);
            i0.ɵɵtext(10, "Analisar reposit\u00F3rio");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "div", 5)(12, "div", 6)(13, "h3", 7);
            i0.ɵɵtext(14, "CONSCIOUS SCORE");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "p", 8)(16, "span", 9);
            i0.ɵɵtext(17, "70");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(18, " / 100");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "p", 10);
            i0.ɵɵtext(20, "An\u00E1lise conclu\u00EDda");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "div", 11);
            i0.ɵɵelement(22, "div", 12);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(23, "div", 6)(24, "div", 13)(25, "p");
            i0.ɵɵtext(26, "Documenta\u00E7\u00E3o");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "p", 14);
            i0.ɵɵtext(28, "54");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(29, "div", 13)(30, "p");
            i0.ɵɵtext(31, "Testes");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "p", 14);
            i0.ɵɵtext(33, "61");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(34, "div", 13)(35, "p");
            i0.ɵɵtext(36, "Acessibilidade");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "p", 14);
            i0.ɵɵtext(38, "72");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(39, "div", 13)(40, "p");
            i0.ɵɵtext(41, "Organiza\u00E7\u00E3o");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(42, "p", 14);
            i0.ɵɵtext(43, "88");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(44, "div", 13)(45, "p");
            i0.ɵɵtext(46, "Manutenibilidade");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(47, "p", 14);
            i0.ɵɵtext(48, "76");
            i0.ɵɵelementEnd()()()()()();
        } }, dependencies: [RouterLink], styles: [".hero[_ngcontent-%COMP%] {\n    font-family: var(--%NS%fonte);\n}\n\n\n.container[_ngcontent-%COMP%] {\n    display: flex;\n    justify-content: center;\n    gap: 0px;\n    background-color: rgb(243, 241, 239);\n    padding: 50px;\n}\n\n\n.box-texto[_ngcontent-%COMP%] {\n    padding: 25px;\n    width: 450px;\n    color: rgb(0, 1, 73)\n}\n\n.box-texto[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n    font-size: 34px;\n    font-weight: 400;\n}\n\n#subtitulo[_ngcontent-%COMP%] {\n    margin-bottom: 20px;\n}\n\n.box-texto[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n    font-size: 16px;\n    font-weight: 200;\n}\n\n#repositorio[_ngcontent-%COMP%] {\n    background-color: #2561E8;\n    padding: 12px 25px;\n    border-radius: 50px;\n    color: white;\n    font-size: 15px;\n    font-family: var(--%NS%fonte);\n    font-weight: 300;\n    border: 0px solid;\n    margin: 40px auto;\n    display: block;\n    cursor: pointer;\n}\n\n\n.box-card[_ngcontent-%COMP%] {\n    background-color: rgb(29, 25, 46);\n    padding: 25px;\n    border-radius: 10px;\n    width: 310px;\n}\n\n.box[_ngcontent-%COMP%] {\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n}\n\n#titulo[_ngcontent-%COMP%] {\n    color: #B8D8FF;\n    font-size: 23px;\n    font-weight: 300;\n}\n\n\n#p-especial[_ngcontent-%COMP%] {\n    color: #8FA4BD;\n    font-size: 18px;\n}\n\n#media[_ngcontent-%COMP%] {\n    font-size: 30px;\n    color: white;\n}\n\n#paragrafo[_ngcontent-%COMP%] {\n    margin-bottom: 13px;\n    color: #B8D8FF;\n    font-weight: 200;\n    font-size: 14px;\n}\n\n\n.score-bar[_ngcontent-%COMP%] {\n    width: 100%;\n    height: 13px;\n    margin: -10px 0 30px;\n    background: #294d72;\n    border-radius: 10px;\n    overflow: hidden;\n}\n\n.score-progress[_ngcontent-%COMP%] {\n    width: 70%;\n    height: 100%;\n    background: #55a8f5;\n    border-radius: 10px;\n}\n\n\n.texto[_ngcontent-%COMP%] {\n    display: flex;\n    justify-content: space-between;\n    font-size: 15px;\n    color: #8FA4BD;\n    font-weight: 500;\n}\n\n.nota[_ngcontent-%COMP%] {\n    color: white;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SecaoHero, [{
        type: Component,
        args: [{ imports: [RouterLink], selector: 'app-secao-hero', template: "<section class=\"hero\">\n  <div class=\"container\">\n    <div class=\"box-texto\">\n      <h2>Seu software funciona.</h2>\n      <h2 id=\"subtitulo\">Mas ele est\u00E1 saud\u00E1vel?</h2>\n\n      <p>\n        O Project Conscious analisa seu reposit\u00F3rio e transforma sinais t\u00E9cnicos em uma vis\u00E3o clara,\n        explic\u00E1vel e priorizada da sa\u00FAde do software.\n      </p>\n\n      <button id=\"repositorio\" routerLink=\"/projects/new\">Analisar reposit\u00F3rio</button>\n    </div>\n\n    <div class=\"box-card\">\n      <div class=\"box\">\n        <h3 id=\"titulo\">CONSCIOUS SCORE</h3>\n\n        <p id=\"p-especial\"><span id=\"media\">70</span> / 100</p>\n\n        <p id=\"paragrafo\">An\u00E1lise conclu\u00EDda</p>\n\n        <div class=\"score-bar\">\n          <div class=\"score-progress\"></div>\n        </div>\n      </div>\n\n      <div class=\"box\">\n        <div class=\"texto\">\n          <p>Documenta\u00E7\u00E3o</p>\n          <p class=\"nota\">54</p>\n        </div>\n\n        <div class=\"texto\">\n          <p>Testes</p>\n          <p class=\"nota\">61</p>\n        </div>\n\n        <div class=\"texto\">\n          <p>Acessibilidade</p>\n          <p class=\"nota\">72</p>\n        </div>\n\n        <div class=\"texto\">\n          <p>Organiza\u00E7\u00E3o</p>\n          <p class=\"nota\">88</p>\n        </div>\n\n        <div class=\"texto\">\n          <p>Manutenibilidade</p>\n          <p class=\"nota\">76</p>\n        </div>\n      </div>\n    </div>\n  </div>\n</section>\n", styles: [".hero {\n    font-family: var(--fonte);\n}\n\n/* Div container, que engloba a div box-texto e a div box-card*/\n.container {\n    display: flex;\n    justify-content: center;\n    gap: 0px;\n    background-color: rgb(243, 241, 239);\n    padding: 50px;\n}\n\n/* Div que cont\u00E9m os textos */\n.box-texto {\n    padding: 25px;\n    width: 450px;\n    color: rgb(0, 1, 73)\n}\n\n.box-texto h2 {\n    font-size: 34px;\n    font-weight: 400;\n}\n\n#subtitulo {\n    margin-bottom: 20px;\n}\n\n.box-texto p {\n    font-size: 16px;\n    font-weight: 200;\n}\n\n#repositorio {\n    background-color: #2561E8;\n    padding: 12px 25px;\n    border-radius: 50px;\n    color: white;\n    font-size: 15px;\n    font-family: var(--fonte);\n    font-weight: 300;\n    border: 0px solid;\n    margin: 40px auto;\n    display: block;\n    cursor: pointer;\n}\n\n/* Div que cont\u00E9m o card Conscious Score */\n.box-card {\n    background-color: rgb(29, 25, 46);\n    padding: 25px;\n    border-radius: 10px;\n    width: 310px;\n}\n\n.box {\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n}\n\n#titulo {\n    color: #B8D8FF;\n    font-size: 23px;\n    font-weight: 300;\n}\n\n/* P\u00E1ragrafo que cont\u00E9m a m\u00E9dia do Conscious Score */\n#p-especial {\n    color: #8FA4BD;\n    font-size: 18px;\n}\n\n#media {\n    font-size: 30px;\n    color: white;\n}\n\n#paragrafo {\n    margin-bottom: 13px;\n    color: #B8D8FF;\n    font-weight: 200;\n    font-size: 14px;\n}\n\n/* Div que cont\u00E9m a m\u00E9dia em uma forma de \"input\" */\n.score-bar {\n    width: 100%;\n    height: 13px;\n    margin: -10px 0 30px;\n    background: #294d72;\n    border-radius: 10px;\n    overflow: hidden;\n}\n\n.score-progress {\n    width: 70%;\n    height: 100%;\n    background: #55a8f5;\n    border-radius: 10px;\n}\n\n/* Div com os atributos e a nota */\n.texto {\n    display: flex;\n    justify-content: space-between;\n    font-size: 15px;\n    color: #8FA4BD;\n    font-weight: 500;\n}\n\n.nota {\n    color: white;\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SecaoHero, { className: "SecaoHero", filePath: "src/app/feats/home/secao-hero/secao-hero.ts", lineNumber: 10 }); })();
