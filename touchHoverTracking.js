(function(){
	var trackedItems = [];
	var removeItems = [];
	
	var touchstartHandler = function(evt){
		removeItems = trackedItems.slice();
		trackedItems = getTrackedItems(evt.target);
		markTrackItems(trackedItems);
	}
	
	var touchendHandler = function(evt){
		setTimeout(function(){
			unmarkItems(removeItems, trackedItems);
		},0);
	}
	
	var pointeroverHandler = function(evt){
		removeItems = trackedItems.slice();
		trackedItems = [];
		if(evt.pointerType === "touch"){
			trackedItems = getTrackedItems(evt.target);
			markTrackItems(trackedItems);
		}else{
			unmarkItems(removeItems, trackedItems, true);
		}
	};
	var pointeroutHandler = function(evt){
		requestAnimationFrame(function(){
			requestAnimationFrame(function(){
				unmarkItems(removeItems, trackedItems);
			});
		});
	};
	var getTrackedItems = function(node){
		trackItems = [node];
		trackItems = Array.prototype.concat(trackItems, getAllAncestors(node));
		return trackItems;
	}
	var markTrackItems = function(trackedItems){
		trackedItems.forEach(function(item){
			item.classList.add('touch_hover');
			});
	}
	var unmarkItems = function(dirtyItems, tracked,  dontWaitForPaint){
		var cbOnStack = false;
		dirtyItems.forEach(function(item){
			if(! tracked.includes(item)){
				if(dontWaitForPaint || !item.matches || !item.matches(':hover')){
					item.classList.remove('touch_hover');
				}else if(!cbOnStack){
					console.log(item);
					console.log(item.matches(':hover'));
					cbOnStack = true;
					requestAnimationFrame(unmarkItems.bind(this, dirtyItems.slice(), tracked.slice()));
				}
			}
		});
	}
	
	var getAllAncestors = function(node){
		var parents = [];
		while(node.parentNode && node.parentNode != document){
			node = node.parentNode;
			parents.push(node);
		}
		return parents;
	}
	if('onpointerover' in document){
		document.addEventListener('pointerover', pointeroverHandler);
		document.addEventListener('pointerout', pointeroutHandler);
	}else{
		document.addEventListener('touchstart', touchstartHandler);
		document.addEventListener('touchend', touchendHandler);
	}
})();

// document.addEventListener('pointerover', (evt) => console.log(evt))