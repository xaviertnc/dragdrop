// main.js

import { mapdata } from './resources/mapdata.js';


import { App         } from './components/App.js';
import { LeftSidebar } from './components/LeftSidebar.js';
import { Map         } from './components/Map.js';


const log = window.__DEBUG_LEVEL__ ? console.log : function(){};
const log4 = window.__DEBUG_LEVEL__ > 3 ? console.log : function(){};


const app = new App({
  id: 'app',
  el: document.getElementById('app')
});


app.mapdata = mapdata;


app.keyboard.add('SHIFT', 16, ()=>log4('SHIFT PRESSED'), ()=>log4('SHIFT RELEASED'));


app.map = app.addChild(Map, {
  id    : 'map',
  el    : document.getElementById(('map')),
  items : mapdata.items.filter(function(item){ return item.group !== 'sidebar'; }),
  nextGroupId: mapdata.nextGroupId
});


app.leftSidebar = app.addChild(LeftSidebar, {
  id    : 'left-sidebar',
  el    : document.getElementById(('left-sidebar')),
  items : mapdata.items.filter(function(item){ return item.group === 'sidebar'; })
});


log('==============');
log('APP:', app);
log('==============');


window.NM = app;