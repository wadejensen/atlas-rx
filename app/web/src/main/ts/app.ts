// @ts-ignore
import { Person } from "common/person"

import { populateMap } from "./maps"

let x = {
    "helloHello": 1,
    "goodbyeGoodbye": 2,
    "danceyDance": 3,
    "lamee_paradise": 4
};

let p = new Person("Wade", 26, "Software Engineer", 100000.0);

console.log(x);

console.log(p);

populateMap();

function expandSearchBox(this: GlobalEventHandlers, ev: FocusEvent): any {
    let searchExpand = document.getElementById('search-expand')!;
    searchExpand.style.display="flex";
    searchExpand.style.zIndex="2";
}

function collapseSearchBox(this: GlobalEventHandlers, ev: FocusEvent): any {
    let searchExpand = document.getElementById('search-expand')!;
    searchExpand.style.display = "none";
    searchExpand.style.zIndex = "-1";
}

document.getElementById("search")!.onfocus = expandSearchBox;
document.getElementById("search")!.onblur = collapseSearchBox;
