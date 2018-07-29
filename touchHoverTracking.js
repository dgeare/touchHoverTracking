(function(){
    var trackedItems = [];
    var removeItems = [];
    
    var touchstartHandler = function(evt){
      removeItems = trackedItems.slice();
      trackedItems = [];
      trackedItems.push(evt.target);
      trackedItems = Array.prototype.concat(trackedItems, getAllAncestors(evt.target));
      trackedItems.forEach(function(item){
        item.classList.add('touch_hover');
       });
    }
    
    var touchendHandler = function(evt){
      setTimeout(function(){
        removeItems.forEach(function(item){
          if(! trackedItems.includes(item))
            item.classList.remove('touch_hover');
        });
      },0);
    }
    
    var getAllAncestors = function(node){
      var parents = [];
      while(node.parentNode && node.parentNode != document){
        node = node.parentNode;
        parents.push(node);
      }
      return parents;
    }
    
    document.addEventListener('touchstart', touchstartHandler);
    document.addEventListener('touchend', touchendHandler);
  })();