import { DEFAULT_LANGUAGE } from "./apputil";

import default_labels from '../json/default_label.json';
import program_labels from '../json/program_label.json';

export function getLabel(name, defaultLabel, lang = DEFAULT_LANGUAGE) {
    let result = undefined;
    if(!lang || lang.trim().length==0) lang = "EN";
    let label_item = getLabelItem(name,lang,program_labels);
    if(label_item) {
        result = label_item.value;
    }
    if(!result) {
        label_item = getLabelItem(name,lang,default_labels);
        if(label_item) {
            result = label_item.value;
        }
    }
    return result?result:defaultLabel;
}

export function getLabelItem(name, lang, label_category) {
    if(!lang || lang.trim().length==0) lang = "EN";
    let lang_item = label_category.find((item) => { return item.language == lang; });
    if(lang_item) {
        return lang_item.label.find((item) => { return item.name == name; });
    }
    return undefined;
}

export function getLabelObject(lang = DEFAULT_LANGUAGE, label_category) {
    if(!lang || lang.trim().length==0) lang = "EN";
    let lang_item = label_category.find((item) => { return item.language == lang; });
    if(lang_item) {
        return lang_item.label;
    }
    return undefined;
}

export function getLabelModel(lang = DEFAULT_LANGUAGE) {
    let default_item = getLabelObject(lang, default_labels);
    let program_item = getLabelObject(lang, program_labels);
    let default_model = {};
    let program_model = {};
    if(default_item) {
        default_item.forEach(element => { default_model[element.name] = element.value; });
    }
    if(program_item) {
        program_item.forEach(element => { program_model[element.name] = element.value; });
    }
    return Object.assign(default_model, program_model);
}
