// main.js

import { mapdata } from './resources/mapdata.js';


import { App               } from './components/App.js';
import { UnplacedItemsList } from './components/UnplacedItemsList.js';
import { Map               } from './components/Map.js';


const log = window.__DEBUG_LEVEL__ ? console.log : function(){};


const app = new App({
  id: 'app',
  el: document.getElementById('app')
});


app.mapdata = mapdata;


app.keyboard.add('SHIFT', 16, ()=>log('SHIFT PRESSED'), ()=>log('SHIFT RELEASED'));


app.map = app.addChild(Map, {
  id    : 'map',
  el    : document.getElementById(('map')),
  items : mapdata.items.filter(function(item){ return item.group === 2; })
});


app.unplaced = app.addChild(UnplacedItemsList, {
  id    : 'left-listbox',
  el    : document.getElementById(('left-listbox')),
  items : mapdata.items.filter(function(item){ return item.group === 1; })
});


log('==============');
log('APP:', app);
log('==============');


window.NM = app;