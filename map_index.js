//loads latest concert index and metadata from github repo

let mapIndex;
let cnrtMeta;

// taking care of retrieving 
const loadIndexJSON = (callback) => {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'https://raw.githubusercontent.com/Maniac7/Maniac7.github.io/master/concertlist.json', false); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
 
 loadIndexJSON(function(response) {
    mapIndex = JSON.parse(response);
 });

 function loadMetaJSON(callback) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'https://raw.githubusercontent.com/Maniac7/Maniac7.github.io/master/concertmeta.json', false); 
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
 
 loadMetaJSON(function(response) {
    cnrtMeta = JSON.parse(response);
 });

console.log(mapIndex);

mapIndex.newTreeItem = (depth,iname,name,parent,slevel,hasChild,srcb) => {

    let treeItem = document.createElement("div"),
        treeItemDiv = document.createElement("div"),
        itemName = document.createTextNode(name),
        itemParent = document.getElementById(parent);

//add name of item to the element and append item
    treeItem.appendChild(itemName);
    itemParent.appendChild(treeItem);
    treeItem.insertAdjacentElement("afterend", treeItemDiv)

//set item id for appending children **REQUIRES PARENTS CREATED BEFORE CHILDREN**
    treeItemDiv.id = iname;

//set order according to starting level
    treeItemDiv.style.order = slevel;
    treeItem.style.order = slevel;

//add classes for styling
    if(depth === "top") {
        treeItem.classList.add("topTreeItem");
    } else if (depth === "sub") {
        treeItem.classList.add("subTreeItem");
        // add event loading feature
        treeItem.addEventListener('click', function() {
            cnrtMeta.loadEventDetails(this);
        });
    };
    treeItemDiv.classList.add("subParent")
    treeItem.classList.add("navTreeItem");

    //add event listener to call mapIndex.toggleShowChildren
    if (hasChild == "true") {
        let masterNavButton = document.getElementById("masterNavButton").firstChild.nextSibling;
        let navButtonClone = masterNavButton.cloneNode(true);
        treeItem.appendChild(navButtonClone);
        treeItem.addEventListener("click", function(){mapIndex.toggleShowChildren(this);});
    }

    console.log(srcb);
};

//loop through array of maps and create item for each
mapIndex.genNavTree = () => {
    for (let iname of mapIndex.mapArr) {
        let curItem = mapIndex[iname];
        let srcb = null;
        if (curItem.hasOwnProperty("srcb")) {srcb = curItem.srcb};
        mapIndex.newTreeItem(curItem.depth,iname,curItem.name,curItem.parent,curItem.slevel,curItem.hasChild,srcb);
    }
};

//toggle whether the item's children are hidden or shown
mapIndex.toggleShowChildren = (el) => {
    let curItem = mapIndex[el.nextSibling.id];
    let mHeightChange;

    // handles rotating arrow
    el.firstChild.nextSibling.classList.toggle("rBackQuarter");

    // handles min/max height and height change within base element
    if (!el.nextSibling.style.maxHeight) {
        el.nextSibling.style.maxHeight = el.nextSibling.scrollHeight + "px";
        el.nextSibling.style.minHeight = el.nextSibling.scrollHeight + "px";
        mHeightChange = el.nextSibling.scrollHeight;
    } else {
        el.nextSibling.style.maxHeight = null;
        el.nextSibling.style.minHeight = null;
        mHeightChange = - el.nextSibling.scrollHeight
        }

    el.classList.toggle("expandedNavItem");
 
    if (curItem.parent !== "treeMaster") {
        // declare variables for changing min/max heights of parent elements
        let nextItem = mapIndex[curItem.parent],
            nextEl = document.getElementById(curItem.parent),
            newHeight,
            nextElId;
    do {
        // update next element id and new height
        nextElId = nextItem.parent;
        newHeight = (parseFloat(nextEl.style.maxHeight) + mHeightChange) + "px";

        // update min/max heights
        nextEl.style.maxHeight = newHeight;
        nextEl.style.minHeight = newHeight;

        // handles selecting new element
        nextItem = mapIndex[nextElId];
        nextEl = document.getElementById(nextElId);
    } while (nextItem.depth !== "notSub")
}

    // for case where a top item is clicked
    // this will toggle the style changes for all of them (size, etc)
//    if (el.parentelement.id === "treemaster") {
//        if (mapindex.checktopopen(el)) {
//            console.log("another element is expanded");
//        }
//        else {
//            mapindex.toggletopstyle(el);
//        }
//    }
}

//Checks if the top tree items are all closed except current element
mapIndex.checkTopOpen = (el) => {
    let topNavItems = document.getElementsByClassName("topTreeItem");
    for (let j = 0; j < topNavItems.length; j++) {
        if (topNavItems[j] != el) {
            if (topNavItems[j].classList.contains("expandedNavItem")) {
                return true;
            }
        }
    }
    return false;
}

//Toggles styles of all top tree item elements
mapIndex.toggleTopStyle = (el) => {
    let topNavItems = document.getElementsByClassName("topTreeItem");
    for (let j = 0; j < topNavItems.length; j++) {
        topNavItems[j].classList.toggle("topTreeItemE");
        topNavItems[j].parentElement.classList.toggle("topTreeDivS");        
    }
}

cnrtMeta.loadEventDetails = (el) => {
    const eventId = cnrtMeta[el.nextSibling.id];
    cnrtMeta.loadEvent(eventId);
}

cnrtMeta.loadEvent = (eventId) => {
    //update all necessary fields
    document.getElementById("detailsTitle").innerText = eventId.title;
    document.getElementById("detailsDesc").innerText = eventId.desc;
    document.getElementById("detailsTime").innerText = eventId.time;
    document.getElementById("detailsDate").innerText = eventId.date + " "+ eventId.timeZone;
    document.getElementById("priceLink").innerText = eventId.price;
    document.getElementById("venueTitle").innerText = "Venue - " + eventId.venue;
    document.getElementById("venueInfo").style.backgroundImage = "url(" + eventId.venueImg + ")"
    document.getElementById("googleFrame").src = "https://www.google.com/maps/embed/v1/place?key=" + cnrtMeta.apiKey + "&q=place_id:" + eventId.mapKey + "&zoom=17"
}

mapIndex.genNavTree();