/* eslint-disable */
'use client'
import MarkdownIt from "markdown-it";
import Prism from "prismjs";
// @ts-ignore
import {RenderRule} from "markdown-it/lib/renderer";
// @ts-ignore
import Token from "markdown-it/lib/token";
import {MdOutlineContentCopy} from "react-icons/md";

// @ts-ignore
import mila from "markdown-it-link-attributes";
// @ts-ignore
import markdownItLatex from "markdown-it-latex";
// @ts-ignore
import markdownFootnote from "markdown-it-footnote";
import {footnote} from "@mdit/plugin-footnote";

import mathjax3 from "markdown-it-mathjax3";
import {renderToString} from "react-dom/server";
import {Icon} from "@chakra-ui/react";
import React, {ReactNode} from "react";


// require(`prismjs/components/prism-go.min.js`);
// require(`prismjs/components/prism-python
// .min.js`);

const getLanguage = (lang: string) => {
    return !lang || lang === "html" ? "markup" : lang;
};

const IconCopy = MdOutlineContentCopy as any

const copyButton = renderToString(
    <IconCopy />
)

function renderCode(origRule?: RenderRule): RenderRule {
    return (tokens: Token[], idx: number, ...props: any[]) => {
        if (!origRule) return "";

        console.log({props})
        const code = origRule(tokens, idx, ...props);

        console.log({code})

        return `
          <div style="position: relative" data-pre-container>
            <div data-copy>${copyButton}</div>
            ${code}
          </div>
    `;
    };
}

class Markdown {
    markdownItWithPlugins = new MarkdownIt({
        breaks: true,
        langPrefix: "language-",
        linkify: true,
        typographer: false,
        highlight: function (code: string, lang: string) {
            const language = getLanguage(lang);
            const grammar = Prism.languages[language];

            try {
                if (!grammar) {
                    const gen = (function* () {
                        yield import(
                            `prismjs/components/prism-${language || "text"}.min.js`
                            );

                        const grammar = Prism.languages[language];
                        console.log(grammar);

                        yield Prism.highlight(code, grammar, language);
                    })();

                    gen.next();
                    gen.next();
                    gen.next();

                    return gen.next().value as any;
                }

                if (grammar) return Prism.highlight(code, grammar, language);
            } catch (err) {
                console.error(err);
            }

            return "";
        },
    })
        .use((plugin) => {
            plugin.renderer.rules.code_block = renderCode(
                plugin.renderer.rules.code_block
            );
            plugin.renderer.rules.fence = renderCode(plugin.renderer.rules.fence);
        })
        .use(mila, {attrs: {target: "_blank"}})
        .use(markdownItLatex)
        .use(mathjax3)
        .use(markdownFootnote)
        .use(footnote)

    markdownIt = new MarkdownIt({
        breaks: true,
        langPrefix: "language-",
        linkify: true,
        typographer: false,
        highlight: function (code: string, lang: string) {
            const language = getLanguage(lang);
            const grammar = Prism.languages[language];

            try {
                if (!grammar)
                    require(`prismjs/components/prism-${language || "text"}.min.js`);
                if (grammar) return Prism.highlight(code, grammar, language);
            } catch (err) {
                console.error(err);
            }

            return "";
        },
    });

    markdownItHtml = new MarkdownIt({
        breaks: true,
        html: true,
        langPrefix: "language-",
        linkify: true,
        typographer: false,
        highlight: function (code: string, lang: string) {
            const language = getLanguage(lang);
            const grammar = Prism.languages[language];

            try {
                if (!grammar)
                    require(`prismjs/components/prism-${language || "text"}.min.js`);
                if (grammar) return Prism.highlight(code, grammar, language);
            } catch (err) {
                console.error(err);
            }

            return "";
        },
    })
        .use((plugin) => {
            plugin.renderer.rules.code_block = renderCode(
                plugin.renderer.rules.code_block
            );
            plugin.renderer.rules.fence = renderCode(plugin.renderer.rules.fence);
        })
        .use(mila, {attrs: {target: "_blank"}})
        .use(markdownItLatex)
        .use(mathjax3)
        .use(markdownFootnote)
        .use(footnote);

    render(markdown: string) {
        return this.markdownItWithPlugins.render(
            markdown
                .replace(/\[\^\d+\^]\[\d+]:/g, "")
                .replace(/\[\^\d+\^]\[\d+]/g, "")
                .replace(/\[\d+]\s*.*?""/g, (r) => {
                    const link = r.replace(/\[\d+]: /g, "").replace(/ ""/, "");
                    return `[${new URL(link).host}](${link})`;
                })
                .replace(/Searching the web for:\s.(?<=`).*?`/, (match) => {
                    return `Поиск в интернете : ${match
                        .split(": ")[1]
                        .replaceAll("`", "")}`;
                })
        );
    }

    renderWithoutPlugins(markdown: string) {
        return this.markdownIt.render(markdown);
    }

    renderHtml(markdown: string) {
        return this.markdownItHtml.render(markdown);
    }
}

export const markdown = new Markdown()
