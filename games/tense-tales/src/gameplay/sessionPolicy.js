(function(){
  function shouldSaveProgress(session){return !session||session.active!==true||session.saveProgress===true;}
  function assistance(session,profile){return session&&session.active&&session.assistance?session.assistance:(profile&&profile.assistance||'guided');}
  var api={shouldSaveProgress:shouldSaveProgress,assistance:assistance};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.TenseTales.gameplay.sessionPolicy=api;
})();
