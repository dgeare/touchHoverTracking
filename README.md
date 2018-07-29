# touchHoverTracking
Identifying when hover events are the result of a touch interaction, and allowing the CSS to style them differently.

--- The Problem ---

It is nearly impossible to absolutely infer the user's preferred method of interaction with the page. Even if one could be inferred, with the advent of more and more multi-use devices, 
it is possible the user will move seamlessly between mouse and touch gestures. 

--- The Goal ---
To identify the source of an individual gesture, on a case-by-case basis.

The script will append a class of .touch_hover to elements which would recieve a hovered-status so they may opt-out of styling, or be styled differently.

--- Use ---
Include the script in the page. For hover styles that are not wanted in the touch experience, append a :not(.touch_hover) to the selector.

E.G.
//animation would be clipped by page navigation
.my_fancy_link:hover:not(.touch_hover){
    transform:scale(1.2);
    transition:transform .5s;
}