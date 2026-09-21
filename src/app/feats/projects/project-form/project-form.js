import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function ProjectForm_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 11);
    i0.ɵɵtext(1, " Informe um nome com pelo menos 3 caracteres. ");
    i0.ɵɵelementEnd();
} }
function ProjectForm_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 11);
    i0.ɵɵtext(1, " Informe uma URL v\u00E1lida do reposit\u00F3rio GitHub. ");
    i0.ɵɵelementEnd();
} }
function ProjectForm_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17)(1, "p");
    i0.ɵɵtext(2, "Projeto pronto para a an\u00E1lise:");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.project.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.project.repositoryUrl);
} }
export class ProjectForm {
    project = {
        name: '',
        repositoryUrl: '',
        description: '',
    };
    submitted = false;
    // onSubmit: função que será chamada quando o formulário for enviado.
    onSubmit(form) {
        this.submitted = true;
        // submitted: informa se a pessoa tentou enviar o formulário.
        if (form.invalid) {
            return;
        }
        // form.invalid: impede o próximo passo enquanto campos obrigatórios estiverem inválidos.
    }
    static ɵfac = function ProjectForm_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProjectForm)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ProjectForm, selectors: [["app-project-form"]], decls: 31, vars: 6, consts: [["projectForm", "ngForm"], ["projectName", "ngModel"], ["repositoryUrl", "ngModel"], [1, "project-form"], [1, "project-form_content"], [1, "project-form__eyebrow"], [1, "project-form__intro"], ["novalidate", "", 1, "project-form__form", 3, "ngSubmit"], [1, "project-form_field"], ["for", "project-name"], ["id", "project-name", "name", "projectName", "type", "text", "minlength", "3", "required", "", "placeholder", "Ex.: Plataforma de vendas", 3, "ngModelChange", "ngModel"], [1, "project-form_error"], ["for", "repository-url"], ["id", "repository-url", "name", "repositoryUrl", "type", "url", "required", "", "placeholder", "Ex.:https://github.com/usuario/projeto", 3, "ngModelChange", "ngModel"], ["for", "project-description"], ["id", "project-description", "name", "description", "rows", "4", "placeholder", "Ex.: Este projeto \u00E9 uma plataforma de vendas online.", 3, "ngModelChange", "ngModel"], ["type", "submit"], [1, "project-form_sucess"]], template: function ProjectForm_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "section", 3)(1, "div", 4)(2, "p", 5);
            i0.ɵɵtext(3, "NOVO PROJETO");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "h1");
            i0.ɵɵtext(5, "Analise a sa\u00FAde do seu software.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 6);
            i0.ɵɵtext(7, "Informe os dados do reposit\u00F3rio para iniciar uma an\u00E1lise.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "form", 7, 0);
            i0.ɵɵlistener("ngSubmit", function ProjectForm_Template_form_ngSubmit_8_listener() { i0.ɵɵrestoreView(_r1); const projectForm_r2 = i0.ɵɵreference(9); return i0.ɵɵresetView(ctx.onSubmit(projectForm_r2)); });
            i0.ɵɵelementStart(10, "div", 8)(11, "label", 9);
            i0.ɵɵtext(12, "Nome do projeto");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "input", 10, 1);
            i0.ɵɵtwoWayListener("ngModelChange", function ProjectForm_Template_input_ngModelChange_13_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.project.name, $event) || (ctx.project.name = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(15, ProjectForm_Conditional_15_Template, 2, 0, "small", 11);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "div", 8)(17, "label", 12);
            i0.ɵɵtext(18, "URL do reposit\u00F3rio GitHub");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "input", 13, 2);
            i0.ɵɵtwoWayListener("ngModelChange", function ProjectForm_Template_input_ngModelChange_19_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.project.repositoryUrl, $event) || (ctx.project.repositoryUrl = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(21, ProjectForm_Conditional_21_Template, 2, 0, "small", 11);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "div", 8)(23, "label", 14);
            i0.ɵɵtext(24, "Descri\u00E7\u00E3o");
            i0.ɵɵelementStart(25, "span");
            i0.ɵɵtext(26, "(opcional)");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(27, "textarea", 15);
            i0.ɵɵtwoWayListener("ngModelChange", function ProjectForm_Template_textarea_ngModelChange_27_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.project.description, $event) || (ctx.project.description = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "button", 16);
            i0.ɵɵtext(29, "Continuar para a an\u00E1lise");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(30, ProjectForm_Conditional_30_Template, 7, 2, "div", 17);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const projectForm_r2 = i0.ɵɵreference(9);
            const projectName_r4 = i0.ɵɵreference(14);
            const repositoryUrl_r5 = i0.ɵɵreference(20);
            i0.ɵɵadvance(13);
            i0.ɵɵtwoWayProperty("ngModel", ctx.project.name);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(projectName_r4.invalid && (projectName_r4.touched || ctx.submitted) ? 15 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtwoWayProperty("ngModel", ctx.project.repositoryUrl);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(repositoryUrl_r5.invalid && (repositoryUrl_r5.touched || ctx.submitted) ? 21 : -1);
            i0.ɵɵadvance(6);
            i0.ɵɵtwoWayProperty("ngModel", ctx.project.description);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.submitted && projectForm_r2.valid ? 30 : -1);
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.MinLengthValidator, i1.NgModel, i1.NgForm], styles: [".project-form[_ngcontent-%COMP%] {\n    min-height: 75vh;\n    padding: 80px 24px;\n    background: #f3f1ef;\n    color: #0b1f3a;\n    font-family: var(--%NS%fonte);\n}\n\n.project-form__content[_ngcontent-%COMP%] {\n    width: min(100%, 680px);\n    margin: 0 auto;\n}\n\n.project-form__eyebrow[_ngcontent-%COMP%] {\n    margin-bottom: 12px;\n    color: #2561e8;\n    font-size: 0.75rem;\n    font-weight: 700;\n    letter-spacing: 0.08em;\n}\n\n.project-form[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n    margin-bottom: 16px;\n    font-size: clamp(2rem, 5vw, 3.4rem);\n    font-weight: 500;\n    line-height: 1.1;\n}\n\n.project-form__intro[_ngcontent-%COMP%] {\n    max-width: 56ch;\n    margin-bottom: 36px;\n    color: #42526a;\n    line-height: 1.6;\n}\n\n.project-form__form[_ngcontent-%COMP%] {\n    display: grid;\n    gap: 22px;\n    padding: 32px;\n    border: 1px solid #d9e1ea;\n    border-radius: 16px;\n    background: #ffffff;\n    box-shadow: 0 12px 30px rgb(11 31 58 / 8%);\n}\n\n.project-form__field[_ngcontent-%COMP%] {\n    display: grid;\n    gap: 8px;\n}\n\n.project-form[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n    font-size: 0.9rem;\n    font-weight: 600;\n}\n\n.project-form[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n    color: #65758b;\n    font-weight: 400;\n}\n\n.project-form[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.project-form[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n    width: 100%;\n    border: 1px solid #b8c5d5;\n    border-radius: 8px;\n    padding: 12px;\n    color: #0b1f3a;\n    font: inherit;\n}\n\n.project-form[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.project-form[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus {\n    outline: 3px solid rgb(37 97 232 / 20%);\n    border-color: #2561e8;\n}\n\n.project-form__error[_ngcontent-%COMP%] {\n    color: #b42318;\n    font-size: 0.82rem;\n}\n\n.project-form[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    border: 0;\n    border-radius: 999px;\n    padding: 14px 22px;\n    background: #2561e8;\n    color: #ffffff;\n    cursor: pointer;\n    font: inherit;\n    font-weight: 600;\n}\n\n.project-form[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n    background: #174cc4;\n}\n\n.project-form__success[_ngcontent-%COMP%] {\n    display: grid;\n    gap: 6px;\n    margin-top: 24px;\n    padding: 20px;\n    border-radius: 12px;\n    background: #e8f2ff;\n    color: #0b1f3a;\n}\n\n.project-form__success[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n    margin: 0;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ProjectForm, [{
        type: Component,
        args: [{ imports: [FormsModule], selector: 'app-project-form', template: "<section class=\"project-form\">\n  <div class=\"project-form_content\">\n    <p class=\"project-form__eyebrow\">NOVO PROJETO</p>\n    <h1>Analise a sa\u00FAde do seu software.</h1>\n    <p class=\"project-form__intro\">Informe os dados do reposit\u00F3rio para iniciar uma an\u00E1lise.</p>\n    <!-- novalidate desativa a valida\u00E7\u00E3o nativa para que o Angular controle as mensagens. -->\n    <form\n      #projectForm=\"ngForm\"\n      class=\"project-form__form\"\n      novalidate \n      (ngSubmit)=\"onSubmit(projectForm)\"\n    >\n\n      <div class=\"project-form_field\">\n        <label for=\"project-name\">Nome do projeto</label>\n\n        <!-- ngModel mant\u00E9m o campo sincronizado com project.name; a refer\u00EAncia exp\u00F5e seu estado. -->\n        <input\n          id=\"project-name\"\n          name=\"projectName\"\n          type=\"text\"\n          minlength=\"3\"\n          required\n          [(ngModel)]=\"project.name\"\n          #projectName=\"ngModel\" \n          placeholder=\"Ex.: Plataforma de vendas\"\n        />\n        <!-- Exibe o erro ap\u00F3s intera\u00E7\u00E3o com o campo ou tentativa de envio. -->\n        @if (projectName.invalid && (projectName.touched || submitted)) {\n          <small class=\"project-form_error\"> Informe um nome com pelo menos 3 caracteres. </small>\n        }\n      </div>\n\n      <div class=\"project-form_field\">\n        <label for=\"repository-url\">URL do reposit\u00F3rio GitHub</label>\n\n        <input\n          id=\"repository-url\"\n          name=\"repositoryUrl\"\n          type=\"url\"\n          required\n          [(ngModel)]=\"project.repositoryUrl\"\n          #repositoryUrl=\"ngModel\"\n          placeholder=\"Ex.:https://github.com/usuario/projeto\"\n        />\n\n        @if (repositoryUrl.invalid && (repositoryUrl.touched || submitted)) {\n          <small class=\"project-form_error\"> Informe uma URL v\u00E1lida do reposit\u00F3rio GitHub. </small>\n        }\n      </div>\n\n      <div class=\"project-form_field\">\n        <label for=\"project-description\">Descri\u00E7\u00E3o<span>(opcional)</span></label>\n\n        <textarea\n          id=\"project-description\"\n          name=\"description\"\n          rows=\"4\"\n          [(ngModel)]=\"project.description\"\n          placeholder=\"Ex.: Este projeto \u00E9 uma plataforma de vendas online.\"\n        ></textarea>\n      </div>\n\n      <button type=\"submit\">Continuar para a an\u00E1lise</button>\n    </form>\n\n    @if (submitted && projectForm.valid) {\n      <div class=\"project-form_sucess\">\n        <p>Projeto pronto para a an\u00E1lise:</p>\n\n        <strong>{{ project.name }}</strong>\n\n        <span>{{ project.repositoryUrl }}</span>\n      </div>\n    }\n  </div>\n</section>\n", styles: [".project-form {\n    min-height: 75vh;\n    padding: 80px 24px;\n    background: #f3f1ef;\n    color: #0b1f3a;\n    font-family: var(--fonte);\n}\n\n.project-form__content {\n    width: min(100%, 680px);\n    margin: 0 auto;\n}\n\n.project-form__eyebrow {\n    margin-bottom: 12px;\n    color: #2561e8;\n    font-size: 0.75rem;\n    font-weight: 700;\n    letter-spacing: 0.08em;\n}\n\n.project-form h1 {\n    margin-bottom: 16px;\n    font-size: clamp(2rem, 5vw, 3.4rem);\n    font-weight: 500;\n    line-height: 1.1;\n}\n\n.project-form__intro {\n    max-width: 56ch;\n    margin-bottom: 36px;\n    color: #42526a;\n    line-height: 1.6;\n}\n\n.project-form__form {\n    display: grid;\n    gap: 22px;\n    padding: 32px;\n    border: 1px solid #d9e1ea;\n    border-radius: 16px;\n    background: #ffffff;\n    box-shadow: 0 12px 30px rgb(11 31 58 / 8%);\n}\n\n.project-form__field {\n    display: grid;\n    gap: 8px;\n}\n\n.project-form label {\n    font-size: 0.9rem;\n    font-weight: 600;\n}\n\n.project-form label span {\n    color: #65758b;\n    font-weight: 400;\n}\n\n.project-form input,\n.project-form textarea {\n    width: 100%;\n    border: 1px solid #b8c5d5;\n    border-radius: 8px;\n    padding: 12px;\n    color: #0b1f3a;\n    font: inherit;\n}\n\n.project-form input:focus,\n.project-form textarea:focus {\n    outline: 3px solid rgb(37 97 232 / 20%);\n    border-color: #2561e8;\n}\n\n.project-form__error {\n    color: #b42318;\n    font-size: 0.82rem;\n}\n\n.project-form button {\n    border: 0;\n    border-radius: 999px;\n    padding: 14px 22px;\n    background: #2561e8;\n    color: #ffffff;\n    cursor: pointer;\n    font: inherit;\n    font-weight: 600;\n}\n\n.project-form button:hover {\n    background: #174cc4;\n}\n\n.project-form__success {\n    display: grid;\n    gap: 6px;\n    margin-top: 24px;\n    padding: 20px;\n    border-radius: 12px;\n    background: #e8f2ff;\n    color: #0b1f3a;\n}\n\n.project-form__success p {\n    margin: 0;\n}"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ProjectForm, { className: "ProjectForm", filePath: "src/app/feats/projects/project-form/project-form.ts", lineNumber: 17 }); })();
