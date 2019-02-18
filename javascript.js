// Add javascript here
$('.ui.form .checkbox').checkbox();
$('.ui.form .checkbox').on('change', itemCheckedHander);

var regionTypes = {
    header: {name: 'header', html: '<header class="ui top region"></header>'},
    content: {name: 'content', html: '<main class="ui center region"></main>'},
    footer: {name: 'footer', html: '<footer class="ui bottom region"></footer>'},
    aside: {name: 'aside', html: '<aside class="ui aside region"></aside>'},
    horizontalRegion: {name: 'horizontalRegion', html: '<section class="ui horizontal base region"></section>'},
    verticalRegion: {name: 'verticalRegion', html: '<section class="ui vertical base region"></section>'}
}

var layoutCheckboxes = {
    header: { element: null, requires: [], deniedBy: [], enabledBy: []},
    footer: { element: null, requires: [], deniedBy: [], enabledBy: []},
    leftAside: { element: null, requires: [], deniedBy: [], enabledBy: []},
    rightAside: { element: null, requires: [], deniedBy: [], enabledBy: []},
    leftAsideFillTop: { element: null, requires: ['leftAside', 'header'], deniedBy: ['rightAsideFillBottom'], enabledBy: ['rightAsideFillBottom', 'rightAsideFillTop']},
    rightAsideFillTop: { element: null, requires: ['rightAside', 'header'], deniedBy: ['leftAsideFillBottom'], enabledBy: ['leftAsideFillBottom', 'leftAsideFillTop']},
    leftAsideFillBottom: { element: null, requires: ['leftAside', 'footer'], deniedBy: ['rightAsideFillTop'], enabledBy: ['rightAsideFillBottom', 'rightAsideFillTop']},
    rightAsideFillBottom: { element: null, requires: ['rightAside', 'footer'], deniedBy: ['leftAsideFillTop'], enabledBy: ['leftAsideFillBottom', 'leftAsideFillTop']},
}

var state = {
	header: false,
	footer: false,
	leftAside: false,
	rightAside: false,
	leftAsideFillTop: false,
	rightAsideFillTop: false,
	leftAsideFillBottom: false,
	rightAsideFillBottom: false
};

function init(){
    //Get checkbox elements
    let keys = Object.keys(layoutCheckboxes);
    for(let i = 0; i < keys.length; i++){
        layoutCheckboxes[keys[i]].element = $(`.ui.form .ui.checkbox input[name=${keys[i]}]`).parent();
    }

    console.log(layoutCheckboxes);
    setCheckBoxStates();
}

function itemCheckedHander(){
    state[$(this).children('input').attr('name')] = $(this).checkbox('is checked');    
    updateState();
}

function updateState(){
    generateRegions();
    setCheckBoxStates();
}

function setCheckBoxStates(){
    let keys = Object.keys(layoutCheckboxes);
    for(let i = 0; i < keys.length; i++){
        let validState = true;

        //Denied by
        for(let j = 0; j <layoutCheckboxes[keys[i]].deniedBy.length; j++ ){
            if(state[layoutCheckboxes[keys[i]].deniedBy[j]]){
                validState = false;
            }
        }

        if(layoutCheckboxes[keys[i]].enabledBy.length > 0){
            //enabled by
            let reenabled = layoutCheckboxes[keys[i]].enabledBy.every(function(item){ return state[item] == true; });

            if(reenabled ) {
                console.log(`${keys[i]} enabled`);
                validState = true;
            }
        }



        for(let j = 0; j <layoutCheckboxes[keys[i]].requires.length; j++ ){
            if(!state[layoutCheckboxes[keys[i]].requires[j]]){
                validState = false;
            }
        }

        if(validState){
            layoutCheckboxes[keys[i]].element.removeClass('disabled');
        } else {
            layoutCheckboxes[keys[i]].element.addClass('disabled');
        }
    }
}

function generateRegions(){
    var regions = [
        {
            active: true,
            vertical: false,
            content: []
        },
        {
            active: false,
            vertical: false,
            content: []
        },
        {
        
            active: false,
            vertical: false,
            content: []
        }
    ]

	let firstRegionVertical = false;
	let secondRegionVertical = false;
    let thirdRegionVertical = false;

    if(!hasHeaderOrFooter() && !hasAside()){ //No Header, No Footer
        regions[0].content.push(regionTypes.content);
    } else if (!hasHeaderOrFooter() && hasAside()){
        regions[0].vertical = false;

        if(state.leftAside) regions[0].content.push(regionTypes.aside);
        regions[0].content.push(regionTypes.content);
        if(state.rightAside) regions[0].content.push(regionTypes.aside);

    } else if(hasHeaderOrFooter() && !hasAside()){ //Header || Footer, No Aside
        regions[0].vertical = true;

        if(state.header) regions[0].content.push(regionTypes.header);
        regions[0].content.push(regionTypes.content);
        if(state.footer) regions[0].content.push(regionTypes.footer);

    } else if(hasHeaderOrFooter() && hasAside()) {
        regions[1].active = true;
        regions[1].vertical = false;

        if(!asideCoversHeader() || !asideCoversFooter()){
            regions[0].vertical = true;

            //1st region
            if(state.header) regions[0].content.push(regionTypes.header);
            regions[0].content.push(regions[1].vertical ? regionTypes['verticalRegion'] : regionTypes['horizontalRegion']); //2nd region
            if(state.footer) regions[0].content.push(regionTypes.footer);

            //2nd region
            if(state.leftAside) regions[1].content.push(regionTypes.aside);
            regions[1].content.push(regionTypes.content);
            if(state.rightAside) regions[1].content.push(regionTypes.aside);
        } else if(asideCoversHeader() && asideCoversFooter()){
            regions[0].vertical = false;
            regions[1].active = true;
            regions[1].vertical = true;

            //1st region
            if(hasLeftAside()) regions[0].content.push(regionTypes.aside);
            regions[0].content.push(regions[1].vertical ? regionTypes['verticalRegion'] : regionTypes['horizontalRegion']); //2nd region
            if(hasRightAside()) regions[0].content.push(regionTypes.aside);

            //2nd region
            if(hasHeader()) regions[1].content.push(regionTypes.header);
            regions[1].content.push(regionTypes.content);
            if(hasFooter()) regions[1].content.push(regionTypes.footer);
        } else if(asideCoversHeader()){
            regions[0].vertical = true;
            regions[1].active = true;
            regions[1].vertical = false;
            regions[2].active = true;
            regions[2].vertical = true;

            //1st region
            regions[0].content.push(regions[1].vertical ? regionTypes['verticalRegion'] : regionTypes['horizontalRegion']); //2nd region
            if(hasFooter()) regions[0].content.push(regionTypes.footer);

            //2nd Region
            if(hasLeftAside()) regions[1].content.push(regionTypes.aside);
            regions[1].content.push(regions[2].vertical ? regionTypes['verticalRegion'] : regionTypes['horizontalRegion']); //3rd region
            if(hasRightAside()){}

        } else if(asideCoversFooter()){

        }
    }

    renderLayout(regions);
}

/**********************************
      ===== Rendering =====
 ********************************/

function renderLayout(regions){
    $layoutRoot = $('.layout.render .page.view');
    $layoutRoot.empty();

    renderRegions(regions, $layoutRoot);
}

function renderRegions(regions, $layoutRoot){
    $firstRegion = $(regions[0].vertical ? regionTypes['verticalRegion'].html : regionTypes['horizontalRegion'].html);
    renderRegion($firstRegion, regions, 0)

    $layoutRoot.append($firstRegion);
}

function renderRegion($region, regions, regionNumber){
    let regionContent = regions[regionNumber].content;
    for(let i = 0; i < regionContent.length; i++){
        if(regionContent[i].name == 'verticalRegion' || regionContent[i].name == 'horizontalRegion'){
            debugger;
            $nextRegion = $(regionContent[i].html);
            renderRegion($nextRegion, regions, regionNumber + 1);
            $region.append($nextRegion);
        } else {
            debugger;
            $region.append($(regionContent[i].html));
        }
    }
}

function getContentHtml(name){
    switch(name){
        case 'header':
            return `<header class="ui top region"></header>`
        case 'content':
            return `<main class="ui center region"></main>`
        case 'footer':
            return `<footer class="ui bottom region"></footer>`
        case 'aside':
            return `<aside class="ui aside region"></aside>`
        case 'verticalRegion':
            return `<section class="ui vertical base region"></section>`
        case 'horizontalRegion':
            return `<section class="ui horizontal base region"></section>`
    }
}

/**********************************
    ===== State Helpers =====
 ********************************/

function hasHeader(){
    return state.header;
}

function hasFooter(){
    return state.footer;
}

function hasHeaderOrFooter(){
    return (hasHeader() || hasFooter());
}


function hasAside(){
    return (hasLeftAside() || hasRightAside());
}

function hasLeftAside(){
    return state.leftAside;
}

function hasRightAside(){
    return state.rightAside
}

function leftAsideCoversHeader(){
    return hasLeftAside() && (state.leftAsideFillTop || !hasHeader());
}

function leftAsideCoversFooter(){
    return hasLeftAside() && (state.leftAsideFillBottom || !hasFooter());
}

function rightAsideCoversHeader(){
    return hasRightAside() && (state.rightAsideFillTop || !hasHeader());
}

function rightAsideCoversFooter(){
    return hasRightAside() && (state.rightAsideFillBottom || !hasFooter());
}


function asideCoversHeader(){
    return (hasAside() && (leftAsideCoversHeader() || rightAsideCoversHeader()));
}


function asideCoversFooter(){
    return (hasAside() && (leftAsideCoversFooter() || rightAsideCoversFooter()));
}

init();
