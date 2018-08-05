(function(allowPointer){
	var trackedItems = [];
	var removeItems = [];
	var lastTouchEvent;
	var destroyTempEvent;
	
	/**
	 * touchstart handler.
	 * 
	 * Adds the current element and all ancestors to the tracked tree and marks them.
	 * Moves previously tracked items to the dirtyItemsArray to be checked for removal/unmarked.
	 * Because we're trying to support mixed-mode inputs we want to know of the next future mousemove event that 
	 * isn't related to our touch so we can clean up. 
	 * 
	 * Binds a limited-lifespan mousemove handler to to this. Not sure if that's the best tactic; the goal was to not bind to
	 * every mousemove on a desktop/primary mouse device, but now more work is required for touch-only devices (to bind and un-bind the event listeners)
	 * @param {TouchEvent} evt 
	 */
	var touchstartHandler = function(evt){
		if(typeof destroyTempEvent == 'function'){
			destroyTempEvent();
			destroyTempEvent = undefined;
		}
		lastTouchEvent = evt.touches[0];
		removeItems = trackedItems.slice();
		trackedItems = getTrackedItems(evt.target);
		markTrackItems(trackedItems);
		destroyTempEvent = limitedLifespanEventHandler(document, 'mousemove', function(evt){
			//IDK... the idea was to be a good citizen and not listen to all mouse events ... especially if that was the primary means of interation
			//It occurs that this will never unbind on a touch-only device
			if(Math.abs(evt.clientX - lastTouchEvent.clientX) < 20 && Math.abs(evt.clientY - lastTouchEvent.clientY) < 20){
				//same event. check target match
				if(evt.target != lastTouchEvent){
					trackedItems.push(evt.target);
					markTrackItems(trackedItems);
				}
			}else{
				//the mouse moved a significant distance from the last touch. Presume input method switch. If we're wrong and the mouse event was fired before
				//the touch event, the touchstartHandler should clean up after us
				removeItems = trackedItems.slice();
				trackedItems = [];
				unmarkItems(removeItems, trackedItems, true);
			}
		});
	}
	
	/**
	 * touchend handler
	 * untracks items flagged as dirty which are no longer tracked.
	 * @param {TouchEvent} evt 
	 */
	var touchendHandler = function(evt){
		requestAnimationFrame(function(){
			requestAnimationFrame(function(){
				unmarkItems(removeItems, trackedItems);
			});
		});
	}

	/**
	 * Binds an event handler to HTMLElement with a set alloted number of invocations before it is removed.
	 * 
	 * @param {Element} node Element to bind event listener to
	 * @param {eventName} type type of event to bind
	 * @param {Function} fn callback function to invoke
	 * @param {?Integer} maxCallCount Max number of times to call the function
	 */
	var limitedLifespanEventHandler = function(node, type, fn, maxCallCount){
		var count = 0;
		maxCallCount = maxCallCount || 3;
		var removableEventHandler = function(evt){
			if(++count >= maxCallCount){
				node.removeEventListener(type, removableEventHandler);
			}else{
				fn(evt);
			}
		};
		node.addEventListener(type, removableEventHandler);
		return function(){
			node.removeEventListener(type, removableEventHandler);
		}
	};
	
	/**
	 * the handler for pointerover events (delegated to document)
	 * @param {PointerEvent} evt 
	 */
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

	/**
	 * the handler for pointerout events (delegated to document)
	 * @param {PointerEvent} evt 
	 */
	var pointeroutHandler = function(evt){
		requestAnimationFrame(function(){
			requestAnimationFrame(function(){
				unmarkItems(removeItems, trackedItems);
			});
		});
	};
	
	/**
 	 * Returns an array of an element and all ancestors
	  *  
	 * @param {Element} node The base child element of the collection
	 */
	var getTrackedItems = function(node){
		trackItems = [node];
		trackItems = Array.prototype.concat(trackItems, getAllAncestors(node));
		return trackItems;
	}


	/**
	 * Marks the items
	 * 
	 * @param {Element[]} trackedItems the items to mark (class)
	 */
	var markTrackItems = function(trackedItems){
		trackedItems.forEach(function(item){
			item.classList.add('touch_hover');
		});
	}


	/**
	 * Untag Items not in the current tracked array.
	 * Because there is occasionally a delay between the 'leave' event and the time the browser considers the element
	 * No longer in a hovered state, there can be a "flash" of hovered style on leave. Account for that with a 
	 * one-frame delayed recursion.
	 * 
	 * @param {Element[]} dirtyItems the items which were previously tracked
	 * @param {Element[]} tracked the items currently tracked
	 * @param {?Boolean} dontWaitForPaint whether or not to check if the item to remove is still considered hovered by browser	 
	 */
	var unmarkItems = function(dirtyItems, tracked,  dontWaitForPaint){
		var cbOnStack = false;
		dirtyItems.forEach(function(item){
			if(! tracked.includes(item)){
				if(dontWaitForPaint || !item.matches || !item.matches(':hover')){
					item.classList.remove('touch_hover');
				}else if(!cbOnStack){//only add the recusion call once per frame
					cbOnStack = true;
					requestAnimationFrame(unmarkItems.bind(this, dirtyItems.slice(), tracked.slice()));
				}
			}
		});
	}
	
	/**
	 * Helper function to walk the DOM to the root
	 * @param {Element} node Current Element to start from
	 */
	var getAllAncestors = function(node){
		var parents = [];
		while(node.parentNode && node.parentNode != document){
			node = node.parentNode;
			parents.push(node);
		}
		return parents;
	}

	//bind events
	if(allowPointer && 'onpointerover' in document){
		//if the browser supports the PointerEvent API, just use that
		document.addEventListener('pointerover', pointeroverHandler);
		document.addEventListener('pointerout', pointeroutHandler);
	}else{
		document.addEventListener('touchstart', touchstartHandler);
		document.addEventListener('touchend', touchendHandler);
	}
})(true);//disable pointer over for testing non-supported browsers