(function () {
    var radWindow;
    var settings = {};
    var pageElements = {};
    var options = [
        ['Plain (Text)', 'plain'],
        ['Bash (Shell)', 'bash'],
        ['AppleScript', 'applescript'],
        ['ActionScript3', 'as3'],
        ['ColdFusion', 'cf'],
        ['C#', 'csharp'],
        ['C++', 'cpp'],
        ['CSS', 'css'],
        ['Delphi', 'delphi'],
        ['Diff', 'diff'],
        ['Erland', 'erlang'],
        ['Groovy', 'groovy'],
        ['Javascript', 'jscript'],
        ['Java', 'java'],
        ['Java FX', 'javafx'],
        ['Perl', 'perl'],
        ['PHP', 'php'],
        ['PowerShell', 'ps'],
        ['Python', 'python'],
        ['Ruby', 'ruby'],
        ['Sass', 'scss'],
        ['Scala', 'scala'],
        ['SQL', 'sql'],
        ['VB', 'vb'],
        ['XML/XHTML', 'xml']
    ];
    options = options.map(function (i) {
        return new Option(i[0], i[1]);
    });

    var htmlHelper = {
        encode: function (html) {
            return html.replace(/>/g, '&gt;').replace(/</g, '&lt;');
        },
        decode: function (html) {
            return html.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
        },
        buildClassFromSettings: function (s) {
            var c = "brush: " + s.lang + ";";
            c += "highlight: [" + s.highlight.replace(/\s/gi, "") + "];";
            if (!s.gutter) {
                c += "gutter:false;";
            }
            if (s.firstLine > 1) {
                c += "first-line:" + s.firstLine + ";";
            }
            return c;
        },
        buildSettingsFromClass: function (s, c) {
            if (c.indexOf("brush") > -1) {
                var result = /brush:\s*(\w*)/.exec(c);
                if (result != null && result.length > 0) {
                    s.lang = result[1];
                }
            }
            if (c.indexOf("gutter") > -1) {
                var g = /gutter:\s*(\w*)/.exec(c);
                if (g != null && g.length > 0) {
                    s.gutter = g[1] === 'true';
                }
            }
            if (c.indexOf("highlight") > -1) {
                if (c.match(/highlight:\s*\[[0-9]+(,[0-9]+)*\]/)) {
                    var h = /highlight:\s*\[(.*)\]/.exec(c);
                    if (h != null && h.length > 0) {
                        s.highlightChecked = true;
                        s.highlight = h[1];
                    }
                }
            }
            if (c.indexOf("first-line") > -1) {
                var f = /first-line:\s*([0-9]{1,4})/.exec(c);
                if (f != null && f.length > 0 && f[1] > 1) {
                    s.firstLine = f[1];
                }
            }
            return s;
        },
        createCodeElement: function (s) {
            var e = document.createElement("pre");
            e.setAttribute('class', this.buildClassFromSettings(s));
            return e;
        },
        createElementWithFormattedCode: function (s) {
            var e = this.createCodeElement(s);
            e.innerHTML = this.encode(pageElements.shDirtyCode.value);
            return e;
        }
    };

    function getRadWindow() {
        if (window.radWindow) {
            return window.radWindow;
        }
        if (window.frameElement && window.frameElement.radWindow) {
            return window.frameElement.radWindow;
        }
        return null;
    }

    function getSettings() {
        var s = {
            gutter: true,
            highlight: '',
            firstLine: '',
            code: '',
            lang: options[0].value
        };
        var selectedElement = radWindow.BrowserWindow.scEditor.getSelection().getParentElement();
        if (selectedElement.tagName == "PRE") {
            var c = selectedElement.className;
            s = htmlHelper.buildSettingsFromClass(s, c);
            s.code = htmlHelper.decode(selectedElement.innerHTML);
        }
        return s;
    };

    function getPageElements() {
        var pe = {};
        pe.shDirtyCode = document.getElementById('dirtyCode');
        pe.shPreviewCode = document.getElementById('previewArea');
        pe.shLanguage = document.getElementById('language');

        pe.shBasicOptions = document.getElementById('basicOptions');
        pe.shAdvancesOptions = document.getElementById('advancedOptions');

        pe.shGutter = document.getElementById('gutter');
        pe.shHighlightLines = document.getElementById('highlightLines');
        pe.shFirstLine = document.getElementById('firstLine');

        pe.shTabs = {
            basic: document.getElementById('basicTabSwitch'),
            advanced: document.getElementById('advancedTabSwitch')
        };

        pe.shButtons = {
            preview: document.getElementById('btnPreview'),
            paste: document.getElementById('btnPasteCode'),
            cancel: document.getElementById('btnCancel'),
        };
        return pe;
    }

    function setEventListeners(pe, events) {
        pe.shTabs.basic.addEventListener("click", events.tabs.showBasic);
        pe.shTabs.advanced.addEventListener("click", events.tabs.showAdvanced);
        pe.shGutter.addEventListener("change", function (e) {
            settings.gutter = e.currentTarget.checked;
        });
        pe.shHighlightLines.addEventListener("change", function (e) {
            settings.highlight = e.currentTarget.value;
        });
        pe.shFirstLine.addEventListener("change", function (e) {
            settings.firstLine = e.currentTarget.value;
        });
        pe.shLanguage.addEventListener("change", function (e) {
            settings.lang = e.currentTarget.value;
        });
        pe.shButtons.preview.addEventListener("click", events.preview);
        pe.shButtons.paste.addEventListener("click", events.scPasteCode);
        pe.shButtons.cancel.addEventListener("click", events.scCancel);
    }

    var shEvents = {
        preview: function () {
            pageElements.shPreviewCode.innerHTML = '';
            pageElements.shPreviewCode.appendChild(htmlHelper.createElementWithFormattedCode(settings));
            SyntaxHighlighter.highlight();
        },
        scPasteCode: function () {
            var returnValue = {
                text: htmlHelper.createElementWithFormattedCode(settings).outerHTML.toString()
            };
            radWindow.close(returnValue);
        },
        scCancel: function () {
            radWindow.close();
        },
        tabs: {
            showBasic: function () {
                pageElements.shBasicOptions.className = 'tabContent';
                pageElements.shAdvancesOptions.className = 'tabContent hide';
                shEvents.preview();
            },
            showAdvanced: function () {
                pageElements.shAdvancesOptions.className = 'tabContent';
                pageElements.shBasicOptions.className = 'tabContent hide';
            }
        }
    };

    function bindElements(pe, s, o) {
        pe.shDirtyCode.value = s.code;
        pe.shGutter.checked = s.gutter;
        pe.shHighlightLines.value = s.highlight;
        pe.shFirstLine.value = s.firstLine;

        o.forEach(function (e) {
            pe.shLanguage.options.add(e);
        });
        pe.shLanguage.value = s.lang;
    }

    if (window.focus) {
        window.focus();
    }

    window.onload = function () {
        SyntaxHighlighter.all();

        radWindow = getRadWindow();
        settings = getSettings();
        pageElements = getPageElements();

        setEventListeners(pageElements, shEvents);
        bindElements(pageElements, settings, options);

        shEvents.preview();
    };
})();