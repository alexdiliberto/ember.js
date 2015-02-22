import _default from "ember-views/views/states/default";
import run from "ember-metal/run_loop";
import merge from "ember-metal/merge";
import create from 'ember-metal/platform/create';
import jQuery from "ember-views/system/jquery";

/**
@module ember
@submodule ember-views
*/

import { get } from "ember-metal/property_get";
import { visitChildren } from "htmlbars-runtime";

var hasElement = create(_default);

merge(hasElement, {
  $: function(view, sel) {
    var elem = view.get('concreteView').element;
    return sel ? jQuery(sel, elem) : jQuery(elem);
  },

  getElement: function(view) {
    var parent = get(view, 'parentView');
    if (parent) { parent = get(parent, 'element'); }
    if (parent) { return view.findElementInParentElement(parent); }
    return jQuery("#" + get(view, 'elementId'))[0];
  },

  // once the view has been inserted into the DOM, rerendering is
  // deferred to allow bindings to synchronize.
  rerender: function(view) {
    var renderNode = view.renderNode;
    renderNode.isDirty = true;

    visitChildren(renderNode.childNodes, function(node) {
      node.state.shouldRerender = true;
      node.isDirty = true;
    });
    run.scheduleOnce('render', renderNode.ownerNode.lastResult, 'revalidate');
  },

  // once the view is already in the DOM, destroying it removes it
  // from the DOM, nukes its element, and puts it back into the
  // preRender state if inDOM.

  destroyElement: function(view) {
    view._renderer.remove(view, false);
    return view;
  },

  // Handle events from `Ember.EventDispatcher`
  handleEvent: function(view, eventName, evt) {
    if (view.has(eventName)) {
      // Handler should be able to re-dispatch events, so we don't
      // preventDefault or stopPropagation.
      return view.trigger(eventName, evt);
    } else {
      return true; // continue event propagation
    }
  },

  invokeObserver: function(target, observer) {
    observer.call(target);
  }
});

export default hasElement;
