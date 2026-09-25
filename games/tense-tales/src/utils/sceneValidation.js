(function () {
  var HELD = ['leftHand', 'rightHand', 'bothHands'];
  var WORN = ['back', 'chest'];
  function finding(severity, code, context, layer, message) {
    return { severity:severity, code:code, storyId:context.storyId || null, panelId:context.panelId || null, layerId:layer && layer.id || null, message:message };
  }
  function validateDefinition(scene, catalog, anchors, context) {
    context = context || {};
    var out = [], ids = {}, layers = scene.layers || [];
    layers.forEach(function (layer) {
      if (!layer.id || ids[layer.id]) out.push(finding('error', 'DUPLICATE_LAYER_ID', context, layer, 'Layer IDs must be present and unique.'));
      ids[layer.id] = layer;
      if (layer.role !== 'surface' && !catalog[layer.assetId]) out.push(finding('error', 'UNKNOWN_ASSET', context, layer, 'Unknown asset: ' + layer.assetId));
      var asset=layer.assetId&&catalog[layer.assetId];
      if(asset&&asset.sourceDimensions&&asset.aspectRatio){var actual=asset.sourceDimensions.width/asset.sourceDimensions.height;if(Math.abs(actual-asset.aspectRatio)>.01)out.push(finding('error','ASSET_ASPECT_RATIO_MISMATCH',context,layer,'Catalog aspect ratio does not match source dimensions.'));}
      if (!(layer.scale > 0) || !isFinite(layer.scale)) out.push(finding('error', 'INVALID_SCALE', context, layer, 'Scale must be finite and positive.'));
      if (!isFinite(layer.z)) out.push(finding('error', 'INVALID_Z', context, layer, 'Layer z-order must be finite.'));
      if (!layer.attach && (!isFinite(layer.x) || !isFinite(layer.y))) out.push(finding('error', 'INVALID_COORDINATE', context, layer, 'World-positioned layers need finite x/y coordinates.'));
      if (layer.role === 'placedProp' && layer.attach) out.push(finding('error', 'ILLEGAL_ATTACHMENT_ROLE', context, layer, 'Placed props cannot attach to an actor.'));
      if ((layer.role === 'heldProp' || layer.role === 'wornProp') && !layer.attach) out.push(finding('error', 'ILLEGAL_ATTACHMENT_ROLE', context, layer, layer.role + ' requires an attachment.'));
      if (layer.attach) {
        var parent = ids[layer.attach.parent] || layers.find(function (x) { return x.id === layer.attach.parent; });
        if (!parent) out.push(finding('error', 'MISSING_ATTACHMENT_PARENT', context, layer, 'Attachment parent is missing: ' + layer.attach.parent));
        if (layer.attach.parent === layer.id) out.push(finding('error', 'CYCLIC_ATTACHMENT', context, layer, 'A layer cannot attach to itself.'));
        if (layer.role === 'heldProp' && HELD.indexOf(layer.attach.anchor) < 0) out.push(finding('error', 'ILLEGAL_ATTACHMENT_ROLE', context, layer, 'Held props must use a hand anchor.'));
        if (layer.role === 'wornProp' && WORN.indexOf(layer.attach.anchor) < 0) out.push(finding('error', 'ILLEGAL_ATTACHMENT_ROLE', context, layer, 'Worn props must use back or chest.'));
        if (parent && parent.role === 'actor' && !anchors.resolve(parent.pose, layer.attach.anchor, parent.flipX)) out.push(finding('error', 'UNSUPPORTED_ANCHOR', context, layer, 'Unsupported anchor ' + layer.attach.anchor + ' for pose ' + parent.pose + '.'));
      }
      if (layer.role === 'actor' && (!anchors.catalog[layer.assetId] || !anchors.catalog[layer.assetId][layer.pose])) out.push(finding('error', 'UNSUPPORTED_POSE', context, layer, 'Unsupported actor pose: ' + layer.pose));
    });
    return out;
  }
  function overlap(a,b) { return Math.max(0, Math.min(a.right,b.right)-Math.max(a.left,b.left)) * Math.max(0, Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)); }
  function validateResolved(resolved, context) {
    context = context || {}; var out = [];
    resolved.layers.forEach(function (layer) {
      if (!layer.boundsPx || layer.role === 'background' || layer.role === 'environment' || layer.role === 'surface') return;
      var b = layer.boundsPx;
      if (b.left < -1 || b.top < -1 || b.right > resolved.frame.width + 1 || b.bottom > resolved.frame.height + 1) out.push(finding('warning','PROP_OUTSIDE_FRAME',context,layer,'Layer extends outside the frame.'));
      if (layer.role === 'heldProp') {
        var actor = resolved.byId[layer.attach.parent], zone = actor && actor.interactionZones && actor.interactionZones[layer.attach.anchor];
        if (zone) {
          var cx=(b.left+b.right)/2, cy=(b.top+b.bottom)/2;
          if (Math.hypot(cx-zone.x,cy-zone.y) > zone.radius) out.push(finding('warning','PROP_OUTSIDE_HAND_ZONE',context,layer,layer.assetId + ' is outside the ' + layer.attach.anchor + ' interaction zone.'));
        }
      }
      var parent = layer.attach && resolved.byId[layer.attach.parent];
      if (layer.critical) Object.keys(resolved.byId).forEach(function(id){var actor=resolved.byId[id];if(actor.role==='actor'&&actor.faceZone&&overlap(b,actor.faceZone)>Math.min(b.width*b.height,actor.faceZone.width*actor.faceZone.height)*.28)out.push(finding('warning','PROP_OVERLAPS_FACE',context,layer,layer.assetId+' overlaps the face exclusion zone.'));});
      if (layer.critical && layer.role === 'heldProp' && b.width > resolved.frame.width*.08) out.push(finding('warning','CRITICAL_PROP_OVERSIZED',context,layer,layer.assetId + ' exceeds 8% of frame width.'));
      if (layer.attach && parent && layer.z <= parent.z && layer.role === 'heldProp') out.push(finding('warning','SUSPICIOUS_DEPTH',context,layer,'Held prop should render in front of its actor.'));
    });
    return out;
  }
  function validateContinuity(story) {
    var seen={}, out=[];
    story.panels.forEach(function(panel){ (panel.scene.layers||[]).forEach(function(layer){
      if (!layer.continuityKey) return;
      var value=layer.scale;
      if (seen[layer.continuityKey] != null && Math.abs(seen[layer.continuityKey]-value)>.001) out.push(finding('warning','CONTINUITY_SCALE_CHANGE',{storyId:story.id,panelId:panel.id},layer,'Recurring asset scale changed without justification.'));
      else seen[layer.continuityKey]=value;
    }); });
    return out;
  }
  var api={validateDefinition:validateDefinition,validateResolved:validateResolved,validateContinuity:validateContinuity};
  if(typeof module!=='undefined'&&module.exports) module.exports=api; else window.TenseTales.utils.sceneValidation=api;
})();
