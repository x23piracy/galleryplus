/**
 * ownCloud - galleryplus
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Robin Appelman <icewind1991@gmail.com>
 * @author Olivier Paroz <owncloud@interfasys.ch>
 *
 * @copyright Robin Appelman 2012-2015
 * @copyright Olivier Paroz 2014-2015
 */

/**
 * Wrapper for server side events
 * (http://en.wikipedia.org/wiki/Server-sent_events)
 */

/* global jQuery, $, EventSource, oc_requesttoken, Gallery */

/**
 * Create a new event source
 * @param {string} src
 * @param {object} [data] to be send as GET
 *
 * @constructs Gallery.EventSource
 */
Gallery.EventSource = function (src, data) {
	var dataStr = '';
	//var name;
	var joinChar;
	this.typelessListeners = [];
	if (data) {
		/*for(name in data){
		 dataStr+=name+'='+encodeURIComponent(data[name])+'&';
		 }*/
		for (var i = 0, keys = Object.keys(data); i < keys.length; i++) {
			dataStr += keys[i] + '=' + encodeURIComponent(data[keys[i]]) + '&';
		}
	}
	dataStr += 'requesttoken=' + encodeURIComponent(oc_requesttoken);
	if (typeof EventSource !== 'undefined') {
		joinChar = '&';
		if (src.indexOf('?') === -1) {
			joinChar = '?';
		}
		this.source = new EventSource(src + joinChar + dataStr);
		this.source.onmessage = function (e) {
			for (var i = 0; i < this.typelessListeners.length; i++) {
				this.typelessListeners[i](JSON.parse(e.data));
			}
		}.bind(this);
	}
	//add close listener
	this.listen('__internal__', function (data) {
		if (data === 'close') {
			this.close();
		}
	}.bind(this));
};

Gallery.EventSource.prototype = {
	typelessListeners: [],
	/**
	 * Listen to a given type of events.
	 *
	 * @param {String} type event type
	 * @param {Function} callback event callback
	 */
	listen: function (type, callback) {
		if (callback && callback.call) {
			if (type) {
				this.source.addEventListener(type, function (e) {
					if (typeof e.data !== 'undefined') {
						callback(JSON.parse(e.data));
					} else {
						callback('');
					}
				}, false);
			} else {
				this.typelessListeners.push(callback);
			}
		}
	},
	/**
	 * Closes this event source.
	 */
	close: function () {
		if (typeof this.source !== 'undefined') {
			this.source.close();
		}
	}
};