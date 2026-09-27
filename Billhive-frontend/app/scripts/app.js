/**
 * app.js
 *
 * This module is the bootstrap script: at the moment does nothing but
 * providing the event handlers for the template / elements to be ready
 */

(function(document) {
  "use strict";

  //const onWebComponentsReady = () => {
    console.log("app:", "starting");

    // TODO how to import isUserAuthenticated from the app-utils element?
    //const isUserAuthenticated = document.querySelector("app-utils").isUserAuthenticated;
    const isUserAuthenticated = ()  => ( document.cookie !== "" );

    // app is the scope of the template: define vars on app makes them
    // reacheble from the template
    const app = document.querySelector("#app");

    app.user = { isUserAuthorized: isUserAuthenticated() };

    app.setRouteState = (event, detail) => {
      const isUserAuthorized = isUserAuthenticated();
      const isLoginPage = detail.path.indexOf("login") > -1;
      const isRegisterPage = detail.path.indexOf("register") > -1;
      const isLandingPage = detail.path.indexOf("landing") > -1;
      const isTransactionsPage = detail.path.indexOf("transactions") > -1;

      // state for login-page
      if(!isUserAuthorized && isLoginPage) {
        event.detail.model["goToLandingPageFn"] = () => {
          window.location.assign("landing");
        };
        event.detail.model["goToRegisterPageFn"] = () => {
          document.querySelector("app-router").go("/register");
        };
      }
      // state for register-page
      else if(!isUserAuthorized && isRegisterPage) {
        event.detail.model["goToLoginPageFn"] = () => {
          document.querySelector("app-router").go("/login");
        };
      }
      // state for landing-page
      else if(isUserAuthorized && isLandingPage) {
        event.detail.model["goToTransactionsPageFn"] = (transactionId) => {
          document.querySelector("app-router").go("/transactions");
        };
      }
      // state for transactions-page
      else if(isUserAuthorized && isTransactionsPage) {
        event.detail.model["goToDetailPageFn"] = (transactionId) => {
          document.querySelector("app-router").go("/transactions/" + transactionId);
        };
        event.detail.model['transactions'] = document.querySelector("data-store").transactions;

        // watcher to sync transactions-page's state with the transactions
        // fetched from the server
        // TODO addEventListener is not crossbrowser!!
        var onDataStoreFetchDone = (e) => {
          const transactionsPage = document.querySelector("transactions-page");
          const data = document.querySelector("data-store").transactions;

          transactionsPage.set("transactions", {
            thisMonth: data.thisMonth,
            lastTransactions: data.lastTransactions
          });
        };
        document.removeEventListener("data-store_fetchDone", onDataStoreFetchDone);
        document.addEventListener("data-store_fetchDone", onDataStoreFetchDone);
      }
    };
  //};

  //window.addEventListener('WebComponentsReady', onWebComponentsReady);
})(document);

(function(document) {
  'use strict';

  // TODO is addEventListener cross-browser?

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  /*app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
  });*/
})(document);

/* Polyfills */
(function() {
  //@See https://jsperf.com/trim-polyfill
  if (typeof String.prototype.trim !== "function") {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, "");
    }
  }

  //@See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2Fmap
  // Production steps of ECMA-262, Edition 5, 15.4.4.19
  // Reference: http://es5.github.io/#x15.4.4.19
  if (!Array.prototype.map) {

    Array.prototype.map = function(callback, thisArg) {

      var T, A, k;

      if (this == null) {
        throw new TypeError(' this is null or not defined');
      }

      // 1. Let O be the result of calling ToObject passing the |this|
      //    value as the argument.
      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get internal
      //    method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }

      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (arguments.length > 1) {
        T = thisArg;
      }

      // 6. Let A be a new array created as if by the expression new Array(len) 
      //    where Array is the standard built-in constructor with that name and 
      //    len is the value of len.
      A = new Array(len);

      // 7. Let k be 0
      k = 0;

      // 8. Repeat, while k < len
      while (k < len) {

        var kValue, mappedValue;

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal
        //    method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (k in O) {

          // i. Let kValue be the result of calling the Get internal
          //    method of O with argument Pk.
          kValue = O[k];

          // ii. Let mappedValue be the result of calling the Call internal
          //     method of callback with T as the this value and argument
          //     list containing kValue, k, and O.
          mappedValue = callback.call(T, kValue, k, O);

          // iii. Call the DefineOwnProperty internal method of A with arguments
          // Pk, Property Descriptor
          // { Value: mappedValue,
          //   Writable: true,
          //   Enumerable: true,
          //   Configurable: true },
          // and false.

          // In browsers that support Object.defineProperty, use the following:
          // Object.defineProperty(A, k, {
          //   value: mappedValue,
          //   writable: true,
          //   enumerable: true,
          //   configurable: true
          // });

          // For best browser support, use the following:
          A[k] = mappedValue;
        }
        // d. Increase k by 1.
        k++;
      }

      // 9. return A
      return A;
    };
}
})();
