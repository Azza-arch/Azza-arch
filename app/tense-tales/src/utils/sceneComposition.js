(function () {
  var Anchors = typeof require==='function' ? require('./characterAnchors.js') : window.TenseTales.utils.characterAnchors;
  var Validator = typeof require==='function' ? require('./sceneValidation.js') : window.TenseTales.utils.sceneValidation;
  function image(id,a,x,y,width,z,anchor,o){return Object.assign({id:id,assetId:a,role:'environment',x:x,y:y,width:width,scale:1,z:z,anchor:anchor||'bottom'},o||{});}
  function surface(id,color,y,height,z){return{id:id,role:'surface',surface:{color:color},x:0,y:y,width:100,height:height,scale:1,z:z,anchor:'top-left'};}
  function panel(id,color,x,y,width,height,z){return{id:id,role:'surface',surface:{color:color},x:x,y:y,width:width,height:height,scale:1,z:z,anchor:'top-left'};}
  var environmentPresets={
    forest:[surface('sky','#cceaf2',0,100,0),surface('ground','#92cf63',84,16,1),image('cloud','remCloud6',15,14,17,1,'center'),image('far-tree-left','remTreeSmall',10,85,10,2),image('far-tree-mid','remTreeSmall',24,85,8,2),image('far-tree-right','remTreeSmall',91,85,10,2),image('bush-left','remBush1',5,85,8,2),image('bush-right','remBush2',95,85,8,2)],
    park:[surface('sky','#d7eff5',0,100,0),surface('ground','#9bd36b',84,16,1),image('sun','outdoorSun',84,15,10,1,'center'),image('cloud','remCloud2',20,15,18,1,'center'),image('hills','outdoorHills1',50,80,100,1,'bottom'),image('bush-left','remBushAlt2',8,85,9,2),image('bush-right','remBush1',91,85,8,2)],
    neighborhood:[surface('sky','#d4edf4',0,100,0),surface('ground','#91ce63',84,16,1),image('cloud','remCloud6',19,14,17,1,'center'),image('distant-house','remHouseSmall',83,84,23,1,'bottom',{opacity:.82}),image('fence','remFence',75,85,24,2,'bottom',{opacity:.78}),image('bush','remBush2',93,85,9,2)],
    homeExterior:[surface('sky','#d9eff4',0,100,0),surface('ground','#9bd36b',84,16,1),image('sun','outdoorSun',16,14,10,1,'center'),image('cloud','remCloud2',42,15,17,1,'center',{opacity:.86}),image('fence','remFence',45,85,30,1,'bottom',{opacity:.62}),image('bush-left','remBushAlt2',8,85,9,2),image('bush-right','remBush2',95,85,9,2)],
    studyRoom:[
      surface('wall','#f4e5c7',0,84,0),surface('baseboard','#ead9b9',81,3,1),surface('floor','#c9955d',84,16,1),
      panel('board-frame','#b88a55',27,8,46,31,1),panel('chalkboard','#39745d',28,9,44,29,2),
      image('window','studyWindow',6,12,14,1,'top-left'),image('bookcase','studyBookcase',91,83,10,2),
      image('back-chair-left','studyChair',22,82,7,1,'bottom',{opacity:.58}),image('back-desk-left','studyDesk',22,84,17,2,'bottom',{opacity:.62}),
      image('back-chair-right','studyChair',78,82,7,1,'bottom',{opacity:.58}),image('back-desk-right','studyDesk',78,84,17,2,'bottom',{opacity:.62}),
      image('chair','studyChair',45,84,11,2),image('desk','studyDesk',50,88,34,4)
    ]
  };
  function aspectRatio(layer,catalog){var asset=catalog&&catalog[layer.assetId];return asset&&asset.aspectRatio||1;}
  function assetPath(layer,catalog){var a=catalog[layer.assetId];if(!a)return null;if(layer.pose)return a.poses&&a.poses[layer.pose];return a.path;}
  function textureKey(layer){return 'scene-'+layer.assetId+(layer.pose?'-'+layer.pose:'');}
  function boundsFor(layer,frame,actorRef,catalog){
    if(layer.role==='surface')return{left:layer.x/100*frame.width,top:layer.y/100*frame.height,width:layer.width/100*frame.width,height:layer.height/100*frame.height};
    var ratio=aspectRatio(layer,catalog), w,h;
    if(layer.role==='actor'){w=frame.width*.20*layer.scale;h=w/ratio;}
    else if(layer.width){w=frame.width*layer.width/100;h=w/ratio;}
    else {h=(actorRef?actorRef.height:frame.height*.28)*layer.scale;w=h*ratio;}
    var x=layer.x/100*frame.width,y=layer.y/100*frame.height,left=x-w/2,top=y-h;
    if(layer.anchor==='center'){top=y-h/2;} else if(layer.anchor==='top-left'){left=x;top=y;} else if(layer.anchor==='top'){top=y;}
    return{left:left,top:top,width:w,height:h,right:left+w,bottom:top+h};
  }
  function resolveScene(scene,frame,catalog,context){
    frame=frame||{width:1000,height:714};context=context||{};
    var defs=(environmentPresets[scene.environment]||[]).concat(scene.layers||[]).map(function(x){var copy=Object.assign({},x);if(!copy.anchor&&!copy.attach)copy.anchor='bottom';return copy;});
    var findings=Validator.validateDefinition({layers:defs},catalog,Anchors,context),byId={};
    defs.filter(function(l){return l.role==='actor';}).forEach(function(l){l.boundsPx=boundsFor(l,frame,null,catalog);byId[l.id]=l;});
    var actorRef=defs.find(function(l){return l.role==='actor';}); actorRef=actorRef&&actorRef.boundsPx;
    defs.forEach(function(l){
      if(l.role==='actor')return;
      if(l.attach){var p=byId[l.attach.parent];if(p){var point=Anchors.resolve(p.pose,l.attach.anchor,p.flipX);if(point){l.x=(p.boundsPx.left+point.x*p.boundsPx.width+(l.attach.offsetX||0)/100*frame.width)/frame.width*100;l.y=(p.boundsPx.top+point.y*p.boundsPx.height+(l.attach.offsetY||0)/100*frame.height)/frame.height*100;l.anchor='center';}else{l.x=p.x;l.y=p.y;l.anchor='center';}}}
      l.boundsPx=boundsFor(l,frame,actorRef,catalog);byId[l.id]=l;
    });
    defs.filter(function(l){return l.role==='actor';}).forEach(function(l){
      var b=l.boundsPx, head=Anchors.resolve(l.pose,'head',l.flipX); l.anchorPoints={};
      Object.keys(Anchors.catalog[l.assetId][l.pose]).forEach(function(name){var p=Anchors.resolve(l.pose,name,l.flipX);l.anchorPoints[name]={x:b.left+p.x*b.width,y:b.top+p.y*b.height};});
      l.faceZone={left:b.left+b.width*.32,top:b.top+b.height*.08,width:b.width*.36,height:b.height*.27};l.faceZone.right=l.faceZone.left+l.faceZone.width;l.faceZone.bottom=l.faceZone.top+l.faceZone.height;
      l.interactionZones={};['leftHand','rightHand','bothHands'].forEach(function(a){var p=l.anchorPoints[a];l.interactionZones[a]={x:p.x,y:p.y,radius:b.height*.18};});
    });
    defs.forEach(function(l){if(l.boundsPx){l.x=(l.boundsPx.left+l.boundsPx.width/2)/frame.width*100;l.y=(l.boundsPx.top+l.boundsPx.height)/frame.height*100;l.width=l.boundsPx.width/frame.width*100;if(l.role==='surface'){l.x=l.boundsPx.left/frame.width*100;l.y=l.boundsPx.top/frame.height*100;l.anchor='top-left';}}if(l.assetId){l.path=assetPath(l,catalog);l.texture=textureKey(l);var a=catalog[l.assetId]||{};l.critical=!!a.critical;l.sizeClass=a.sizeClass;}});
    var result={environment:scene.environment,frame:frame,layers:defs.sort(function(a,b){return a.z-b.z||a.id.localeCompare(b.id);}),byId:byId,findings:findings};
    result.findings=result.findings.concat(Validator.validateResolved(result,context));return result;
  }
  function resolve(scene,catalog,frame,context){return resolveScene(scene,frame,catalog,context).layers;}
  function domStyle(l){if(l.role==='surface')return 'left:'+l.x+'%;top:'+l.y+'%;width:'+l.width+'%;height:'+(l.height||16)+'%;background:'+l.surface.color+';z-index:'+l.z;var t=['translate(-50%, -100%)'];if(l.flipX)t.push('scaleX(-1)');if(l.rotation)t.push('rotate('+l.rotation+'deg)');return'left:'+l.x+'%;top:'+l.y+'%;width:'+l.width+'%;z-index:'+l.z+';opacity:'+(l.opacity==null?1:l.opacity)+';transform:'+t.join(' ')+';transform-origin:center center';}
  function renderDom(container,scene,catalog,options){options=options||{};container.textContent='';var frame=options.frameBounds||{width:container.clientWidth||560,height:container.clientHeight||400},r=resolveScene(scene,frame,catalog,options);r.layers.forEach(function(l){var el;if(l.role==='surface'){el=document.createElement('span');el.className='scene-layer scene-surface';}else{el=document.createElement('img');el.src=l.path;el.alt='';el.className='scene-layer';}el.dataset.sceneId=l.id;el.dataset.sceneRole=l.role;el.setAttribute('style',domStyle(l));container.appendChild(el);});return r;}
  var api={anchors:['bottom','center','top-left','top'],environmentPresets:environmentPresets,assetPath:assetPath,textureKey:textureKey,resolve:resolve,resolveScene:resolveScene,domStyle:domStyle,renderDom:renderDom};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.TenseTales.utils.sceneComposition=api;
})();
