"""Sincroniza os fontes e gera HTML navegável sem servidor, npm ou instalação."""
import json
import re
from html import escape
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VOID_TAGS = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


def replace_block(html, name, content):
    start, end = f'<!-- {name}:start -->', f'<!-- {name}:end -->'
    before, rest = html.split(start, 1)
    _, after = rest.split(end, 1)
    return before + start + '\n' + content + '\n    ' + end + after


class Slots(HTMLParser):
    """Localiza somente o conteúdo dos componentes, preservando o HTML autoral."""
    def __init__(self, html, attribute):
        super().__init__(convert_charrefs=False)
        self.lines = [0]
        self.lines.extend(match.end() for match in re.finditer('\n', html))
        self.stack, self.slots = [], []
        self.attribute = attribute
        self.feed(html)

    def position(self):
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def handle_starttag(self, tag, attrs):
        if tag not in VOID_TAGS:
            self.stack.append((tag, self.position() + len(self.get_starttag_text()), dict(attrs)))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1][0] == tag:
            _, start, attrs = self.stack.pop()
            if self.attribute in attrs:
                self.slots.append((start, self.position(), attrs))


def icon(catalog, name):
    return '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">' + catalog['ICONS'][name] + '</svg>'


def render_face(option, field, group):
    classes = 'face-option' + (' pain-option' if field == 'pain' else '')
    required = ' required' if field == 'pain' else ''
    return (f'<label class="{classes}"><input type="radio" name="{field}-{group}" '
            f'value="{option["value"]}" data-field="{field}"{required}>'
            f'<svg class="face-art" viewBox="-50 -50 100 100" aria-hidden="true">'
            f'<use href="#{option["face"]}"></use></svg><span data-label>{escape(option["label"])}</span></label>')


def render_medicines(catalog):
    result = []
    for index, medicine in enumerate(catalog['MEDICINES']):
        result.append('<section class="py-5"><header class="flex items-center gap-3">'
                      f'<span class="medicine-icon" data-color="{medicine["color"]}">{icon(catalog,"pill")}</span>'
                      f'<div class="min-w-0 flex-1"><h2 class="text-sm font-semibold">{escape(medicine["name"])}</h2>'
                      f'<p class="mt-1 text-xs text-stone-500">{medicine["frequency"]}</p></div>'
                      f'<span class="text-xs">{medicine["interval"]}</span></header>'
                      '<div class="mt-3 grid grid-flow-col auto-cols-fr gap-1 sm:ml-12">')
        for time in medicine['times']:
            checked = ' checked' if time in medicine['checked'] else ''
            result.append(f'<label class="dose"><input type="checkbox" data-medicine="{index}" data-time="{time}" '
                          f'aria-label="{escape(medicine["name"])}, dose das {time}"{checked}>'
                          f'<span class="dose-mark" aria-hidden="true">{icon(catalog,"check")}</span>'
                          f'<time class="text-xs" datetime="{time}">{time}</time></label>')
        result.append('</div></section>')
    return ''.join(result)


def prerender(html, catalog):
    header = re.search(r'<template id="header-template">(.*?)</template>', html, re.S)[1]
    for start, end, attrs in sorted(Slots(html, 'data-component').slots, reverse=True):
        component = attrs['data-component']
        if component == 'header':
            content = header
        elif component == 'pain':
            content = ''.join(render_face(option, 'pain', attrs.get('data-group', 'inicio')) for option in catalog['PAIN_OPTIONS'])
        elif component == 'navigation':
            content = ''
            for item in catalog['NAVIGATION']:
                attribute = f'data-screen="{item["screen"]}"' if 'screen' in item else f'data-action="{item["action"]}"'
                content += f'<button type="button" class="nav-item" {attribute}>{icon(catalog,item["icon"])}<span>{item["label"]}</span></button>'
        elif component == 'medicines':
            content = render_medicines(catalog)
        else:
            continue
        html = html[:start] + content + html[end:]
    for start, end, attrs in sorted(Slots(html, 'data-ui-icon').slots, reverse=True):
        html = html[:start] + icon(catalog, attrs['data-ui-icon']) + html[end:]
    html = re.sub(r'(<p id="dose-text"[^>]*>).*?(</p>)', r'\g<1>3 de 3 medicamentos\2', html, count=1, flags=re.S)
    html = html.replace('id="dose-progress" class="my-2 block h-2 w-full" value="0"', 'id="dose-progress" class="my-2 block h-2 w-full" value="3"')
    html = html.replace('id="dose-count" class="text-sm">0/3', 'id="dose-count" class="text-sm">3/3')
    return html


def main():
    index = ROOT / 'pac' / 'index.html'
    javascript = (ROOT / 'app.js').read_text()
    catalog = json.loads(javascript.split('const COMPONENTS = ', 1)[1].split(';\n// catalog:end', 1)[0])
    demo = json.loads((ROOT / 'dados-demo.json').read_text())
    patient_ids = [profile['id'] for profile in demo['patients']]
    doctor_ids = [profile['id'] for profile in demo['doctors']]
    if len(set(patient_ids)) != len(patient_ids) or len(set(doctor_ids)) != len(doctor_ids):
        raise ValueError('IDs duplicados no JSON de demonstração.')
    if demo['defaultPatientId'] not in patient_ids or demo['defaultDoctorId'] not in doctor_ids or any(profile['doctorId'] not in doctor_ids for profile in demo['patients']):
        raise ValueError('Vínculo de paciente ou médico inválido no JSON.')
    shared_path = ROOT / 'shared.js'
    shared = shared_path.read_text()
    before, block = shared.split('// demo-data:start', 1)
    _, after = block.split('// demo-data:end', 1)
    shared = before + '// demo-data:start\nconst CRABCARE_DEMO = ' + json.dumps(demo, ensure_ascii=False, indent=4) + ';\n// demo-data:end' + after
    shared_path.write_text(shared)
    config = json.loads(shared.split('const CRABCARE_CONFIG = ', 1)[1].split(';\n// shared-config:end', 1)[0])
    catalog['PAIN_OPTIONS'] = config['PAIN_OPTIONS']
    html = prerender(index.read_text(), catalog)
    html = re.sub(r'(<input id="usuario"[^>]*value=")[^"]*(")', lambda match: match[1] + escape(demo['defaultPatientId']) + match[2], html, count=1)
    default_patient = next(profile for profile in demo['patients'] if profile['id'] == demo['defaultPatientId'])
    html = re.sub(r'(data-bind="patient">)[^<]*(<)', lambda match: match[1] + escape(default_patient['name']) + match[2], html)
    html = replace_block(html, 'styles', '<style>\n' + (ROOT / 'style.css').read_text() + '</style>')
    html = replace_block(html, 'shared', '<script>\n' + shared + '</script>')
    html = replace_block(html, 'app', '<script>\n' + javascript + '</script>')
    faces = (ROOT / 'icones.svg').read_text().replace(
        '<svg xmlns="http://www.w3.org/2000/svg">',
        '<svg xmlns="http://www.w3.org/2000/svg" class="svg-library" aria-hidden="true" width="0" height="0">', 1)
    html = replace_block(html, 'faces', faces)
    index.write_text(html)
    preview = html.replace('<body class=', '<body data-preview="true" class=', 1)
    preview = preview.replace('id="login" class=', 'id="login" hidden class=', 1)
    preview = re.sub(r'(<div id="aplicativo" class=")([^"]+)("[^>]*?) hidden>', r'\1preview-grid \2\3>', preview, count=1)
    for page in ['inicio', 'alimentacao', 'medicamentos']:
        preview = re.sub(r'(<section id="'+page+r'"[^>]*?) hidden>', r'\1>', preview, count=1)
    preview = preview.replace('<title>Crabcare — Paciente</title>', '<title>Crabcare — Demonstração do paciente</title>', 1)
    (ROOT / 'demonstracao.html').write_text(preview)
    doctor_path = ROOT / 'doc' / 'index.html'
    doctor = doctor_path.read_text()
    doctor = re.sub(r'(<input id="doc-usuario"[^>]*value=")[^"]*(")', lambda match: match[1] + escape(demo['defaultDoctorId']) + match[2], doctor, count=1)
    default_doctor = next(profile for profile in demo['doctors'] if profile['id'] == demo['defaultDoctorId'])
    doctor = re.sub(r'(<span id="doc-identity"[^>]*>)[^<]*(</span>)', lambda match: match[1] + escape(default_doctor['name']) + match[2], doctor, count=1)
    doctor = replace_block(doctor, 'styles', '<style>\n' + (ROOT / 'style.css').read_text() + '</style>')
    doctor = replace_block(doctor, 'shared', '<script>\n' + shared + '</script>')
    doctor = replace_block(doctor, 'app', '<script>\n' + (ROOT / 'doc' / 'app.js').read_text() + '</script>')
    doctor_path.write_text(doctor)


if __name__ == '__main__':
    main()
