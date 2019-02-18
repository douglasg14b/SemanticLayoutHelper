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
    header: { element: null, requires: [], deniedBy: [], enabledByAll: [], enabledBy:[]},
    footer: { element: null, requires: [], deniedBy: [], enabledByAll: [], enabledBy:[]},
    leftAside: { element: null, requires: [], deniedBy: [], enabledByAll: [], enabledBy:[]},
    rightAside: { element: null, requires: [], deniedBy: [], enabledByAll: [], enabledBy:[]},
    leftAsideFillTop: { element: null, requires: ['leftAside', 'header'], deniedBy: ['rightAsideFillBottom'], enabledByAll: ['rightAsideFillBottom', 'rightAsideFillTop'], enabledBy: ['leftAsideFillBottom']},
    rightAsideFillTop: { element: null, requires: ['rightAside', 'header'], deniedBy: ['leftAsideFillBottom'], enabledByAll: ['leftAsideFillBottom', 'leftAsideFillTop'], enabledBy: ['rightAsideFillBottom']},
    leftAsideFillBottom: { element: null, requires: ['leftAside', 'footer'], deniedBy: ['rightAsideFillTop'], enabledByAll: ['rightAsideFillBottom', 'rightAsideFillTop'], enabledBy: ['leftAsideFillTop']},
    rightAsideFillBottom: { element: null, requires: ['rightAside', 'footer'], deniedBy: ['leftAsideFillTop'], enabledByAll: ['leftAsideFillBottom', 'leftAsideFillTop'], enabledBy: ['rightAsideFillTop']},
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

class RegionsState {

    constructor(state, regionTypes){
        this.state = state;
        this.regionTypes = regionTypes;
    }

    state = {};
    regionTypes = {};
    regions = [
        { active: true, vertical: true, content: [] },
        { active: false, vertical: false, content: [] },
        { active: false, vertical: false, content: [] },
        { active: false, vertical: false, content: [] },
    ];

    header = { used: false, orientation: 'row' };
    content = { used: false, orientation: 'row' };
    footer = { used: false, orientation: 'row' };
    leftAside = { used: false, orientation: 'column' };
    rightAside = { used: false, orientation: 'column' };

    /**********************************
        ===== State Setters =====
    ********************************/

    addHeader = function(regionIndex){
        this.regions[regionIndex].content.push(this.regionTypes.header);
        this.header.used = true;
    }

    addContent = function(regionIndex){
        this.regions[regionIndex].content.push(this.regionTypes.content);
        this.content.used = true;
    }


    addFooter = function(regionIndex){
        this.regions[regionIndex].content.push(this.regionTypes.footer);
        this.footer.used = true;
    }

    addLeftAside = function(regionIndex){
        this.regions[regionIndex].content.push(this.regionTypes.aside);
        this.leftAside.used = true;
    }

    addRightAside = function(regionIndex){
        this.regions[regionIndex].content.push(this.regionTypes.aside);
        this.rightAside.used = true;
    }

    addHorizontalRegion = function(regionIndex){
        this.regions[regionIndex].content.push(this.regionTypes.horizontalRegion);
    }

    addVerticalRegion = function(regionIndex){
        this.regions[regionIndex].content.push(this.regionTypes.verticalRegion);
    }

    /**********************************
        ===== State Helpers =====
    ********************************/


    hasHeader = function(){
        return this.state.header && !this.header.used;
    }
    
    hasFooter = function(){
        return this.state.footer && !this.footer.used;
    }
    
    hasHeaderOrFooter = function(){
        return (this.hasHeader() || this.hasFooter());
    }

    //Used to check if content has been added
    hasContent = function(){
        return !this.content.used;
    }
    
    hasAside = function(){
        return (this.hasLeftAside() || this.hasRightAside());
    }
    
    hasLeftAside = function(){
        return this.state.leftAside && !this.leftAside.used;
    }
    
    hasRightAside = function(){
        return this.state.rightAside && !this.rightAside.used
    }
    
    leftAsideCoversHeader = function(){
        return this.hasLeftAside() && (this.state.leftAsideFillTop || !this.hasHeader());
    }
    
    leftAsideCoversFooter = function(){
        return this.hasLeftAside() && (this.state.leftAsideFillBottom || !this.hasFooter());
    }
    
    rightAsideCoversHeader = function(){
        return this.hasRightAside() && (this.state.rightAsideFillTop || !this.hasHeader());
    }
    
    rightAsideCoversFooter = function(){
        return this.hasRightAside() && (this.state.rightAsideFillBottom || !this.hasFooter());
    }
    
    //Will return true If there is no header but there is an aside
    asideCoversHeader = function(){
        return (this.hasAside() && (this.leftAsideCoversHeader() || this.rightAsideCoversHeader()));
    }
    
    //Will return true If there is no footer but there is an aside
    asideCoversFooter = function(){
        return (this.hasAside() && (this.leftAsideCoversFooter() || this.rightAsideCoversFooter()));
    }    
}

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
    setCheckBoxStates();

    let regionsState = determineLongestSection(new RegionsState(state, regionTypes), 0);
    renderLayout(regionsState.regions);
    //generateRegions();

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

        //reenabled by
        if(layoutCheckboxes[keys[i]].enabledByAll.length > 0){
            let reenabled = layoutCheckboxes[keys[i]].enabledByAll.every(function(item){ return state[item] == true; });

            if(!reenabled){
                reenabled = layoutCheckboxes[keys[i]].enabledBy.some(function(item){ return state[item] == true; });
            }

            if(reenabled ) {
                validState = true;
            }
        }

        //Requires
        for(let j = 0; j <layoutCheckboxes[keys[i]].requires.length; j++ ){
            if(!state[layoutCheckboxes[keys[i]].requires[j]]){
                validState = false;
            }
        }

        if(validState){
            layoutCheckboxes[keys[i]].element.removeClass('disabled');
        } else {
            layoutCheckboxes[keys[i]].element.addClass('disabled');
            layoutCheckboxes[keys[i]].element.checkbox('set unchecked')
            state[layoutCheckboxes[keys[i]].element.find('input').attr('name')] = false;
        }
    }
}

function determineLongestSection(regionsState, index){
    if(index == 0){
        regionsState = new RegionsState(state, regionTypes);
    }

    if(!regionsState.hasHeader() && !regionsState.hasFooter() && !regionsState.hasAside()){

        if(regionsState.hasContent()) regionsState.addContent(index);
        return regionsState;
    }

    //Check header/footer only
    if((regionsState.hasHeader() || regionsState.hasFooter()) && !regionsState.hasAside()){
        regionsState.regions[index].vertical = true; //footer & header are rows

        if (regionsState.hasHeader()) regionsState.addHeader(index);
        regionsState.addContent(index);
        if (regionsState.hasFooter()) regionsState.addFooter(index);

        return regionsState;
    }

    if((regionsState.hasHeader() || regionsState.hasFooter()) && regionsState.hasAside()){ //Has header or footer and 1 or 2 asides

        //header or footer is longest
        if(!regionsState.asideCoversHeader() || !regionsState.asideCoversFooter()){

            //Header AND footer are longest
            if(!regionsState.asideCoversHeader() && !regionsState.asideCoversFooter()){
                console.log('Header AND footer are longest. Use Row.');
                regionsState.regions[index].vertical = true;
                regionsState.regions[index+1].active = true
                regionsState.regions[index+1].vertical = false

                if (regionsState.hasHeader()) regionsState.addHeader(index);
                regionsState.addHorizontalRegion(index);
                if (regionsState.hasFooter()) regionsState.addFooter(index);
                
                determineLongestSection(regionsState, index + 1);
            
             //Covers footer. Header is longest
            } else if(!regionsState.asideCoversHeader()){
                console.log('Covers footer. Header is longest. Use Row.');
                regionsState.regions[index].vertical = true;
                regionsState.regions[index+1].active = true
                regionsState.regions[index+1].vertical = false
                
                if (regionsState.hasHeader()) regionsState.addHeader(index);
                regionsState.addHorizontalRegion(index);
                
                determineLongestSection(regionsState, index + 1);

            //Covers Header. Footer is longest
            } else if(!regionsState.asideCoversFooter()){
                console.log('Covers Header. Footer is longest. Use Row.');
                regionsState.regions[index].vertical = true;
                regionsState.regions[index+1].active = true
                regionsState.regions[index+1].vertical = false

                regionsState.addHorizontalRegion(index);

                //footer comes after section as flex row is top to bottom
                if (regionsState.hasFooter()) regionsState.addFooter(index);

                determineLongestSection(regionsState, index + 1);
            }
        //Covers header and footer. Asides are longest
        } else if(regionsState.asideCoversHeader() && regionsState.asideCoversFooter()) {
            console.log('Covers header and footer. Asides are longest. Use Column.');
            //Covers header & footer so asides are longest, which means starting with columns
            regionsState.regions[index].vertical = false;
            regionsState.regions[index+1].active = true
            regionsState.regions[index+1].vertical = true

            if(regionsState.leftAsideCoversFooter() && regionsState.leftAsideCoversHeader()){
                regionsState.addLeftAside(index);
            }

            regionsState.addVerticalRegion(index);

            if(regionsState.rightAsideCoversFooter() && regionsState.rightAsideCoversHeader()){
                regionsState.addRightAside(index);
            }

            determineLongestSection(regionsState, index + 1);
        }

    //Aside only, add asides and content
    } else if(regionsState.hasAside()) {
        console.log('Aside only, add asides and content. Use Column.');
        regionsState.regions[index].vertical = false;

        if(regionsState.hasLeftAside()) regionsState.addLeftAside(index);
        regionsState.addContent(index);
        if(regionsState.hasRightAside()) regionsState.addRightAside(index);   
        
        determineLongestSection(regionsState, index + 1);
    }

    return regionsState;
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

        } else if(hasLeftAside() && hasRightAside()){
            if(leftAsideCoversHeader() && leftAsideCoversFooter()){
                regions[0].vertical = false;
                regions[1].active = true;
                regions[1].vertical = true;

                regions[0].content.push(regionTypes.aside);
                regions[0].content.push(regions[1].vertical ? regionTypes['verticalRegion'] : regionTypes['horizontalRegion']); //2nd region
                if(rightAsideCoversHeader() && rightAsideCoversFooter()){
                    regions[0].content.push(regionTypes.aside);
                }
    
                if(!rightAsideCoversFooter() && !rightAsideCoversHeader()){ //right aside is between header and footer
                    regions[2].active = true;
                    regions[2].vertical = false;

                    if(hasHeader()) regions[1].content.push(regionTypes.header);
                    regions[1].content.push(regions[2].vertical ? regionTypes['verticalRegion'] : regionTypes['horizontalRegion']); //3rd region
                    if(hasFooter()) regions[1].content.push(regionTypes.footer);

                    //3rd Region
                    regions[2].content.push(regionTypes.content);
                    regions[2].content.push(regionTypes.aside);

                } else if(rightAsideCoversFooter() && !rightAsideCoversHeader()){

                } else if(rightAsideCoversHeader() && !rightAsideCoversFooter()){
                    regions[2].active = true;
                    regions[2].vertical = false;

                    regions[3].active = true;
                    regions[3].vertical = true;
                    
                    regions[1].content.push(regions[2].vertical ? regionTypes['verticalRegion'] : regionTypes['horizontalRegion']); //3rd region

                    //3rd Region
                    regions[2].content.push(regions[3].vertical ? regionTypes['verticalRegion'] : regionTypes['horizontalRegion']); //4th region
                    regions[2].content.push(regionTypes.aside);

                    //4th region
                    if(hasHeader()) regions[3].content.push(regionTypes.header);
                    regions[3].content.push(regionTypes.content);

                    if(hasFooter()) regions[1].content.push(regionTypes.footer);


                } else {
                    regions[1].content.push(regionTypes.content);
                    if(hasFooter()) regions[1].content.push(regionTypes.footer);
                }

            } else {

            }
        } else if(hasLeftAside()){

        } else if(hasRightAside()){

        } 
        //Replacing below
        /*else if(asideCoversHeader() && asideCoversFooter()){
            regions[0].vertical = false;
            regions[1].active = true;
            regions[1].vertical = true;
            
            //1st Region
            if(leftAsideCoversFooter() && leftAsideCoversHeader()){
                if(hasLeftAside()) regions[0].content.push(regionTypes.aside);
            } else {

            }

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

        }*/
    }

    console.log(regions);
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
            //debugger;
            let $nextRegion = $(regionContent[i].html);
            renderRegion($nextRegion, regions, regionNumber + 1);
            $region.append($nextRegion);
        } else {
            //debugger;
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

function hasHeader(regionTypesState){
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
